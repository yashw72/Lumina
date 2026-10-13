from app.services.chunker import chunk_pages


def test_chunk_pages_preserves_page_numbers_and_sequential_index():
    pages = [
        {"page": 1, "text": "Page one has this comprehensive introduction explaining operating systems. It covers processes, memory, and storage."},
        {"page": 2, "text": "Page two discusses thread scheduling in detail, including cooperative multitasking and preemptive scheduling algorithms."},
    ]

    chunks = chunk_pages(pages, chunk_size=80, overlap=20)
    assert len(chunks) > 0

    # Verify sequential index
    for idx, c in enumerate(chunks):
        assert c["chunk_index"] == idx

    # Verify page numbers match page boundaries
    p1_chunks = [c for c in chunks if c["page"] == 1]
    p2_chunks = [c for c in chunks if c["page"] == 2]

    assert len(p1_chunks) > 0
    assert len(p2_chunks) > 0
    assert len(p1_chunks) + len(p2_chunks) == len(chunks)


def test_chunk_pages_overlap_works():
    long_text = (
        "Operating systems manage computer hardware and software resources. "
        "A process is a program in execution and has its own memory space. "
        "Threads share the address space of the parent process. "
        "Concurrency introduces challenges such as deadlocks and race conditions."
    )
    pages = [{"page": 1, "text": long_text}]

    chunks = chunk_pages(pages, chunk_size=120, overlap=30)
    assert len(chunks) >= 2

    # Check that overlap exists: end of chunk 0 overlaps with start of chunk 1
    # Check words or substring presence
    chunk_0_words = set(chunks[0]["text"].split())
    chunk_1_words = set(chunks[1]["text"].split())
    shared_words = chunk_0_words.intersection(chunk_1_words)
    assert len(shared_words) > 0


def test_tiny_chunks_are_skipped():
    pages = [
        {"page": 1, "text": "Short. Tiny! Hello."},  # len < 30
        {"page": 2, "text": "This is a sufficiently long sentence that is definitely longer than thirty characters."},
    ]

    chunks = chunk_pages(pages, chunk_size=100, overlap=20)
    # The chunk with < 30 chars must be skipped
    page_numbers = [c["page"] for c in chunks]
    assert 1 not in page_numbers
    assert 2 in page_numbers
    assert all(len(c["text"]) >= 30 for c in chunks)
