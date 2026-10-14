import argparse
import sys
import httpx

DEADLOCK_SAMPLE_TEXT = """An operating system deadlock occurs when two or more processes are unable to proceed because each is waiting for the other to release a resource. 
For a deadlock to occur, four Coffman conditions must hold simultaneously: mutual exclusion, hold and wait, no preemption, and circular wait. 
Mutual exclusion means that at least one resource must be held in a non-shareable mode. 
Hold and wait means a process must be concurrently holding at least one resource and requesting additional resources held by other processes. 
No preemption means that resources cannot be forcibly confiscated from a process; they must be voluntarily released. 
Circular wait implies that a closed chain of processes exists such that each process holds at least one resource needed by the next process in the chain. 
Operating systems employ several strategies to handle deadlocks, including deadlock prevention, avoidance, detection, and recovery. 
Deadlock prevention ensures that at least one of the four necessary conditions cannot hold. 
Deadlock avoidance dynamically examines the resource-allocation state to ensure that a circular wait condition can never exist. 
The Banker's Algorithm is a famous deadlock avoidance algorithm developed by Edsger Dijkstra. 
Deadlock detection allows the system to enter a deadlocked state, detects it using resource allocation graphs, and initiates recovery. 
Recovery techniques include process termination and resource preemption. 
Process termination can abort all deadlocked processes or abort them one by one until the deadlock cycle is eliminated. 
Resource preemption involves rolling back process states and preempting resources to resolve circular dependencies. 
Understanding deadlocks is fundamental to modern concurrent systems engineering and multi-threaded kernel architecture."""


def run_smoke_test(base_url: str, skip_llm: bool) -> bool:
    client = httpx.Client(base_url=base_url.rstrip("/"), timeout=60.0)
    results = []
    created_doc_id = None
    session_id = None

    def record(name: str, passed: bool, reason: str = ""):
        results.append((name, passed, reason))
        status_str = "PASS" if passed else f"FAIL - {reason}"
        print(f"[{'PASS' if passed else 'FAIL'}] {name} {f'({reason})' if reason else ''}")

    try:
        # Step a: GET /health
        try:
            r = client.get("/health")
            if r.status_code == 200 and r.json().get("status") == "ok":
                record("GET /health", True)
            else:
                record("GET /health", False, f"status {r.status_code}: {r.text}")
        except Exception as e:
            record("GET /health", False, str(e))

        # Step b: POST /documents/upload
        try:
            files = {"file": ("os-deadlocks.txt", DEADLOCK_SAMPLE_TEXT.encode("utf-8"), "text/plain")}
            r = client.post("/documents/upload", files=files)
            if r.status_code == 201:
                data = r.json()
                created_doc_id = data.get("id")
                if data.get("status") == "ready" and data.get("chunk_count", 0) >= 1:
                    record("POST /documents/upload", True)
                else:
                    record("POST /documents/upload", False, f"Unexpected data: {data}")
            else:
                record("POST /documents/upload", False, f"status {r.status_code}: {r.text}")
        except Exception as e:
            record("POST /documents/upload", False, str(e))

        # Step c: GET /documents and GET /documents/{id}
        try:
            r_list = client.get("/documents")
            r_get = client.get(f"/documents/{created_doc_id}") if created_doc_id else None

            if (
                r_list.status_code == 200
                and any(d["id"] == created_doc_id for d in r_list.json().get("documents", []))
                and r_get
                and r_get.status_code == 200
                and r_get.json().get("id") == created_doc_id
            ):
                record("GET /documents & /documents/{id}", True)
            else:
                record("GET /documents & /documents/{id}", False, "Document not found in list or get")
        except Exception as e:
            record("GET /documents & /documents/{id}", False, str(e))

        # Step d: Upload .exe file -> 4xx with string detail
        try:
            bad_file = {"file": ("malware.exe", b"MZDummyHeader", "application/octet-stream")}
            r_bad = client.post("/documents/upload", files=bad_file)
            if 400 <= r_bad.status_code < 500 and isinstance(r_bad.json().get("detail"), str):
                record("Upload invalid extension returns 4xx", True)
            else:
                record("Upload invalid extension returns 4xx", False, f"status {r_bad.status_code}: {r_bad.text}")
        except Exception as e:
            record("Upload invalid extension returns 4xx", False, str(e))

        if not skip_llm and created_doc_id:
            # Step e: POST /chat with answerable question
            try:
                r_chat = client.post(
                    "/chat",
                    json={
                        "question": "What are the four Coffman conditions for a deadlock?",
                        "document_ids": [created_doc_id],
                        "session_id": None,
                    },
                )
                if r_chat.status_code == 200:
                    chat_data = r_chat.json()
                    session_id = chat_data.get("session_id")
                    sources = chat_data.get("sources", [])
                    if chat_data.get("answer") and len(sources) > 0 and "document_id" in sources[0]:
                        record("POST /chat (grounded answer + sources)", True)
                    else:
                        record("POST /chat (grounded answer + sources)", False, f"Missing answer or sources: {chat_data}")
                else:
                    record("POST /chat (grounded answer + sources)", False, f"status {r_chat.status_code}: {r_chat.text}")
            except Exception as e:
                record("POST /chat (grounded answer + sources)", False, str(e))

            # Step f: POST /chat with same session_id and follow-up
            try:
                r_follow = client.post(
                    "/chat",
                    json={
                        "question": "why does circular wait happen?",
                        "document_ids": [created_doc_id],
                        "session_id": session_id,
                    },
                )
                if r_follow.status_code == 200 and r_follow.json().get("session_id") == session_id:
                    record("POST /chat follow-up retains session_id", True)
                else:
                    record("POST /chat follow-up retains session_id", False, f"status {r_follow.status_code}: {r_follow.text}")
            except Exception as e:
                record("POST /chat follow-up retains session_id", False, str(e))

            # Step g: POST /chat with unrelated question -> sources == []
            try:
                r_unrelated = client.post(
                    "/chat",
                    json={
                        "question": "What is the capital of France?",
                        "document_ids": [created_doc_id],
                        "session_id": session_id,
                    },
                )
                if r_unrelated.status_code == 200 and r_unrelated.json().get("sources") == []:
                    record("POST /chat unrelated question has empty sources", True)
                else:
                    record("POST /chat unrelated question has empty sources", False, f"sources not empty: {r_unrelated.text}")
            except Exception as e:
                record("POST /chat unrelated question has empty sources", False, str(e))

            # Step h: GET /chat/history/{session_id} -> 4 or more messages
            try:
                r_hist = client.get(f"/chat/history/{session_id}")
                if r_hist.status_code == 200 and len(r_hist.json().get("messages", [])) >= 4:
                    record("GET /chat/history/{session_id}", True)
                else:
                    record("GET /chat/history/{session_id}", False, f"History messages count unexpected: {r_hist.text}")
            except Exception as e:
                record("GET /chat/history/{session_id}", False, str(e))

            # Step i: POST /study/summary, /study/flashcards, /study/quiz
            try:
                r_sum = client.post("/study/summary", json={"document_id": created_doc_id})
                r_flash = client.post("/study/flashcards", json={"document_id": created_doc_id, "count": 5})
                r_quiz = client.post("/study/quiz", json={"document_id": created_doc_id, "count": 3})

                quiz_valid = (
                    r_quiz.status_code == 200
                    and isinstance(r_quiz.json().get("questions"), list)
                    and all(
                        len(q.get("options", [])) == 4 and 0 <= q.get("correct_index", -1) <= 3
                        for q in r_quiz.json().get("questions", [])
                    )
                )

                if (
                    r_sum.status_code == 200
                    and isinstance(r_sum.json().get("summary"), str)
                    and r_flash.status_code == 200
                    and isinstance(r_flash.json().get("flashcards"), list)
                    and quiz_valid
                ):
                    record("POST /study/{summary,flashcards,quiz} shape validation", True)
                else:
                    record("POST /study/{summary,flashcards,quiz} shape validation", False, f"Study endpoints invalid response")
            except Exception as e:
                record("POST /study/{summary,flashcards,quiz} shape validation", False, str(e))
        else:
            if skip_llm:
                print("[SKIP] Steps e-i skipped via --skip-llm")

        # Step j: POST /chat with empty question -> 422 with string detail
        try:
            r_empty = client.post("/chat", json={"question": ""})
            if r_empty.status_code == 422 and isinstance(r_empty.json().get("detail"), str):
                record("POST /chat empty question returns 422 string detail", True)
            else:
                record("POST /chat empty question returns 422 string detail", False, f"status {r_empty.status_code}: {r_empty.text}")
        except Exception as e:
            record("POST /chat empty question returns 422 string detail", False, str(e))

    finally:
        # Step k: DELETE /documents/{id} cleanup
        if created_doc_id:
            try:
                r_del = client.delete(f"/documents/{created_doc_id}")
                r_verify_404 = client.get(f"/documents/{created_doc_id}")
                if r_del.status_code == 200 and r_verify_404.status_code == 404:
                    record("DELETE /documents/{id} and 404 verification", True)
                else:
                    record("DELETE /documents/{id} and 404 verification", False, f"Cleanup status: del={r_del.status_code}, get={r_verify_404.status_code}")
            except Exception as e:
                record("DELETE /documents/{id} and 404 verification", False, str(e))

    print("\n" + "=" * 60)
    print("SMOKE TEST SUMMARY")
    print("=" * 60)
    all_passed = True
    for name, passed, reason in results:
        status_col = "PASS" if passed else "FAIL"
        print(f"{name:<50} | {status_col}")
        if not passed:
            all_passed = False
            if reason:
                print(f"  Reason: {reason}")
    print("=" * 60)

    return all_passed


def main():
    parser = argparse.ArgumentParser(description="DocuMentor AI API Smoke Test")
    parser.add_argument("--base-url", default="http://localhost:8000/api", help="API Base URL")
    parser.add_argument("--skip-llm", action="store_true", help="Skip LLM-dependent chat and study checks")
    args = parser.parse_args()

    print(f"Starting smoke tests against: {args.base_url}")
    success = run_smoke_test(base_url=args.base_url, skip_llm=args.skip_llm)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
