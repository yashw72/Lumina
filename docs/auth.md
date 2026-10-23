# Auth.md — Signup, Login and Authentication Prompts (DocuMentor AI)

**Goal:** add real account creation and login. After a successful signup or login the user is redirected to the Home page. Every page and API (except `/api/health` and the auth endpoints) requires a valid token, and each user sees only their own documents, chats and study material.

**Who does what**
- **Yash** (backend): Chunks 0, 1, 2
- **Kaustubh** (frontend): Chunks 3, 4, 5 (can start right after Chunk 0, using mock mode)
- **Both:** Chunk 6 (integration, tests, docs, deployment settings)

## How to use this file
1. Pull `main` and make sure the app currently works.
2. Paste ONE chunk at a time into Antigravity, run the **Check**, then run the **Commit** commands.
3. Chunk 0 first (shared contract). Then backend and frontend chunks can run in parallel.
4. Each chunk starts with "Read antigravitycontext.md first", so Chunk 0 must be merged before the others.

## Design decisions (already made, do not change)
- **Passwords:** hashed with Argon2 (`argon2-cffi`). Never stored or logged in plain text.
- **Tokens:** JWT (HS256, PyJWT), 24 hours, sent as `Authorization: Bearer <token>`. Stored in the browser's localStorage. (Chosen because the frontend and backend are hosted on different domains, where cookies are painful. This is acceptable for a student project; a production system would consider httpOnly cookies.)
- **Isolation:** documents, chat sessions and vector search are filtered by the logged-in user. Other users' items return 404.
- **Security basics:** generic "Invalid email or password" message, email stored lowercase and unique, password rules, simple login rate limit, secret key from environment.

---

## CHUNK 0 — Update the shared contract (do this first)

**Prompt**
```text
Read antigravitycontext.md fully first.

Task: Update documentation ONLY (no application code) so both developers share the same authentication contract.

1. In antigravitycontext.md:
   - Section 3 Backend stack: add `argon2-cffi` (password hashing) and `PyJWT` (tokens), and `email-validator`.
   - Section 5 backend/.env.example: add
       SECRET_KEY=change-me-to-a-long-random-string-at-least-32-chars
       ACCESS_TOKEN_EXPIRE_MINUTES=1440
       LOGIN_MAX_ATTEMPTS=5
       LOGIN_WINDOW_MINUTES=15
   - Section 4 folder structure: add backend/app/api/routes/auth.py, backend/app/schemas/auth.py, backend/app/core/security.py, backend/app/api/deps.py, backend/app/services/rate_limit.py, backend/tests/test_auth.py, backend/tests/test_isolation.py, frontend/src/api/auth.js, frontend/src/context/AuthContext.jsx, frontend/src/components/auth/ProtectedRoute.jsx, frontend/src/components/auth/PublicRoute.jsx, frontend/src/components/auth/PasswordInput.jsx, frontend/src/components/auth/PasswordStrength.jsx, frontend/src/components/layout/UserMenu.jsx, frontend/src/pages/LoginPage.jsx, frontend/src/pages/SignupPage.jsx.
   - Section 6 API contract: add a new "Authentication" subsection:
       POST /auth/signup  body {"name": "Yash", "email": "a@b.com", "password": "Passw0rd!"}
         -> 201 {"access_token": "...", "token_type": "bearer", "user": {"id": 1, "name": "Yash", "email": "a@b.com", "created_at": "..."}}
       POST /auth/login   body {"email": "...", "password": "..."} -> 200, same response shape as signup
       GET  /auth/me      (requires token) -> the user object
       Errors: 409 {"detail": "An account with this email already exists"}, 401 {"detail": "Invalid email or password"}, 422 validation errors, 429 {"detail": "Too many failed attempts. Try again later."}.
     Add the rule: every endpoint except GET /health, POST /auth/signup and POST /auth/login requires the header `Authorization: Bearer <access_token>`; otherwise the API returns 401 {"detail": "Not authenticated"}. Data is private per user: another user's document or session returns 404.
     Validation rules: name 2-60 chars; email valid format, stored lowercase, unique; password 8-72 chars with at least one letter and one number.
   - Section 7 Coding rules: add "Never log passwords or tokens", "Frontend token handling lives only in src/api/client.js and src/context/AuthContext.jsx".
   - Section 11 Known limitations: replace the "Authentication & Multi-tenancy" item with the new behavior (email/password accounts, JWT, per-user data), and note that password reset and email verification are not implemented.
2. Mirror the API changes into docs/api.md.
3. Update backend/.env.example with the four new variables (placeholder SECRET_KEY only).
```

**Check:** The context file, `docs/api.md` and `.env.example` all show the auth contract.

**Commit**
```bash
git checkout main && git pull
git checkout -b docs/auth-contract
git add antigravitycontext.md docs/ backend/.env.example
git commit -m "docs: define authentication contract and per-user data rules"
git push origin docs/auth-contract
```
> Open a PR, have the other person approve, merge to `main`, then both pull.

---

## CHUNK 1 — Backend: users, hashing, JWT, signup/login/me (Yash)

**Prompt**
```text
Read antigravitycontext.md first (sections 5, 6 and 7). Work only inside backend/.

Task: Implement authentication exactly as in the API contract.
1. requirements.txt: add argon2-cffi, PyJWT, email-validator. Install them.
2. app/core/config.py: add SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES (default 1440), LOGIN_MAX_ATTEMPTS (5), LOGIN_WINDOW_MINUTES (15). On startup, if SECRET_KEY is missing, shorter than 32 characters or still the placeholder, log a clear error and refuse to start (raise RuntimeError with instructions on generating one: python -c "import secrets; print(secrets.token_urlsafe(48))"). Tests may override it via environment.
3. app/db/models.py: add a User model (id, name, email unique+indexed, password_hash, created_at). Keep existing models unchanged in this chunk.
4. app/core/security.py:
   - hash_password(password) and verify_password(password, hash) using argon2.PasswordHasher (verify must return False instead of raising on mismatch; also rehash-on-verify if needed).
   - create_access_token(user_id) -> JWT with claims sub (string user id), iat, exp using SECRET_KEY and HS256.
   - decode_access_token(token) -> user id or None (handle expired, malformed and tampered tokens without raising).
5. app/schemas/auth.py: SignupRequest (name stripped 2-60 chars; email via EmailStr, lowercased; password 8-72 chars with at least one letter and one digit, with a clear validation message), LoginRequest, UserOut (id, name, email, created_at; from_attributes), TokenResponse (access_token, token_type="bearer", user).
6. app/services/rate_limit.py: a small in-memory limiter keyed by (client ip + email) that records failed logins; after LOGIN_MAX_ATTEMPTS failures within LOGIN_WINDOW_MINUTES it blocks further attempts with HTTP 429 {"detail": "Too many failed attempts. Try again later."}; a successful login clears the counter. Thread-safe, with old entries cleaned up. Add a comment that this is per-process and fine for a single instance.
7. app/api/deps.py: get_current_user dependency using fastapi.security.HTTPBearer(auto_error=False): reads the bearer token, decodes it, loads the user from the DB, otherwise raises HTTPException 401 {"detail": "Not authenticated"} with the header WWW-Authenticate: Bearer.
8. app/api/routes/auth.py with prefix /auth:
   - POST /signup: if the email already exists return 409 "An account with this email already exists"; else create the user, return 201 with TokenResponse (user is logged in immediately).
   - POST /login: apply the rate limiter; look up the user by lowercase email; verify the password; if the user does not exist still run a dummy hash verification to avoid revealing whether the email exists through timing; on failure return 401 "Invalid email or password"; on success return TokenResponse.
   - GET /me: returns the current user.
   Register the router under /api in main.py. Make sure CORS allows the Authorization header.
9. Never log passwords, hashes or tokens. Do not return password_hash anywhere.
10. Add tests in tests/test_auth.py (use a temp database and a test SECRET_KEY): signup success, duplicate email (also with different letter case), weak password, invalid email, login success, login wrong password, login unknown email (same message as wrong password), /me with valid token, /me with no token, /me with tampered token, /me with an expired token (create one with a negative expiry), rate limit returns 429 after the max attempts.
```

**Check:** `pytest` is green. In `/docs`, sign up, copy the token, click **Authorize**, and call `/api/auth/me`.

**Commit**
```bash
git checkout main && git pull
git checkout -b feat/backend-auth
git add backend/
git commit -m "feat(backend): add signup, login and JWT authentication with Argon2 hashing"
```

---

## CHUNK 2 — Backend: protect all routes and isolate data per user (Yash)

**Prompt**
```text
Read antigravitycontext.md first. Work only inside backend/. Chunk 1 (auth) is already in place.

Task: Make every data endpoint require login and make all data private per user. This is a security requirement: user B must never read, search, chat with, study from or delete user A's data.
1. app/db/models.py: add user_id (ForeignKey to users.id, indexed, not null for new rows) to Document and ChatSession.
2. Add a tiny idempotent startup migration in app/db/database.py (run after create_all): for SQLite, if the documents or chat_sessions table lacks a user_id column, ALTER TABLE ... ADD COLUMN user_id INTEGER. Legacy rows with NULL user_id belong to nobody and must never be returned to any user. Log what was migrated.
3. Require get_current_user on ALL routes in documents.py, chat.py and study.py (apply it with the router dependencies parameter so no route can be forgotten). Keep GET /api/health and the auth routes public.
4. documents.py: upload stores user_id = current user; list returns only the current user's documents; get and delete return 404 when the document does not belong to the current user. Store uploaded files under UPLOAD_DIR/<user_id>/ with the uuid-prefixed safe name.
5. vector_store / ingestion: chunk metadata must include user_id as well as document_id. Deleting a document removes its vectors.
6. rag.py and chat.py:
   - Resolve the allowed document ids as the current user's documents with status "ready". If the request has document_ids, every id must belong to the user, otherwise return 404 "Document not found". If document_ids is empty or missing, search ALL of the current user's ready documents (never all documents in the database). If the user has no ready documents, return the friendly "I could not find this in your uploaded documents. Upload a document first." answer with sources = [] without calling the LLM.
   - Always pass an explicit document_ids filter to vector_store.query.
   - A ChatSession belongs to its creator: continuing or reading history of someone else's session_id returns 404; an unknown session_id from the same user behaves as today.
7. study.py: summary, flashcards and quiz return 404 if the document does not belong to the current user (or is not ready).
8. Add tests/test_isolation.py with two users A and B (use a mocked llm and an embedding stub if needed): B cannot list, get, delete, chat with (by document_ids), study from, or read the chat history of A's data; B's chat with no document_ids never returns A's chunks as sources; every protected route returns 401 without a token (parametrize over all routes); health stays public. Update existing tests (documents, chat, study, end-to-end) to sign up and send a bearer token via a shared fixture in conftest.py.
9. Update backend/scripts/smoke_test.py: sign up a random user, use the token for all calls, and verify an unauthenticated call gets 401.
```

**Check:** `pytest` is fully green; in `/docs`, user A uploads a file, user B (different token) cannot see it.

**Commit**
```bash
git add backend/
git commit -m "feat(backend): require auth on all routes and isolate documents, chats and vectors per user"
git push origin feat/backend-auth
```
> Open a PR and tell Kaustubh the auth API is ready.

---

## CHUNK 3 — Frontend: auth state, API and route guards (Kaustubh)

**Prompt**
```text
Read antigravitycontext.md first (sections 6, 7 and 7b if present). Work only inside frontend/. Follow the existing design system.

Task: Build the authentication foundation (no UI pages yet).
1. src/api/auth.js: signup({name, email, password}), login({email, password}), getMe(). They return {accessToken, user} (convert access_token) and match the API contract. With VITE_USE_MOCK=true they use a mock: users saved in localStorage under a mock key, a fake token, realistic delays and the same error messages (409 duplicate email, 401 "Invalid email or password"). Add a comment that the mock is for demo only.
2. src/api/client.js: a request interceptor that adds "Authorization: Bearer <token>" when a token exists; a response interceptor that, on a 401 from any endpoint EXCEPT /auth/login and /auth/signup, clears the session and notifies the app (use a small event emitter or a registered callback) so AuthContext can log out, show the toast "Your session expired. Please log in again." and redirect to /login. Keep all token reading/writing in one small module src/lib/tokenStore.js (key "documentor_token", every localStorage access wrapped in try/catch, with an in-memory fallback).
3. src/context/AuthContext.jsx exposing {user, token, loading, isAuthenticated, signup, login, logout}. On app start, if a token exists call getMe() to validate it while loading=true (never flash protected content); if it fails clear the token. login/signup store the token and user. logout clears the token, user, the saved chat session id and any cached document state, and navigates to /login. Wrap the app with AuthProvider in main.jsx.
4. src/components/auth/ProtectedRoute.jsx: while loading show a full-screen centered Loader; if not authenticated <Navigate to="/login" replace />; else render children / <Outlet/>.
   src/components/auth/PublicRoute.jsx: for /login and /signup; if the user is already authenticated redirect to "/" (Home).
5. src/App.jsx: public routes "/login" (LoginPage) and "/signup" (SignupPage) wrapped in PublicRoute and rendered WITHOUT the sidebar layout; all existing routes ("/", "/library", "/chat", "/study" and any others) wrapped in ProtectedRoute inside the Layout; keep the 404 page. Lazy-load the pages if the project already does. Create simple placeholder LoginPage and SignupPage (heading only) so the routes work; the real UI comes in the next chunk.
6. Per-user chat session storage: change the saved chat session key in useChat.js to include the user id (e.g. documentor_chat_session_<userId>) so accounts never share sessions on the same browser.
```

**Check:** In mock mode, visiting `/` while logged out redirects to `/login`; after setting a token manually the protected pages open; no flash of protected content on refresh.

**Commit**
```bash
git checkout main && git pull
git checkout -b feat/frontend-auth
git add frontend/
git commit -m "feat(frontend): add auth context, token handling and protected routes"
```

---

## CHUNK 4 — Frontend: Login and Signup pages (Kaustubh)

**Prompt**
```text
Read antigravitycontext.md first and follow the existing UI design system (brand gradient, Inter font, rounded-2xl cards, light/dark mode, framer-motion under 300 ms, lucide-react icons, Tailwind only). Work only inside frontend/.

Task: Build polished LoginPage.jsx and SignupPage.jsx that look like a real SaaS product.
Layout (both pages, shared AuthLayout component in src/components/auth/):
- Desktop: split screen. Left half is a brand panel with the gradient background, soft blurred blobs, the DocuMentor AI logo, the headline "Learn smarter from your own documents", three short benefit bullets with icons (Chat with sources, Summaries and flashcards, Quizzes that test you) and a small floating mock chat preview card. Right half is the form card centered on a clean background with a theme toggle in the corner.
- Mobile: only the form card with a compact logo on top.
Login form: Email, Password (PasswordInput with show/hide eye button), "Log in" primary button with loading spinner, link "New here? Create an account" to /signup.
Signup form: Full name, Email, Password with a live PasswordStrength meter (weak/fair/strong bar plus a checklist: 8+ characters, a letter, a number), Confirm password, "Create account" button, link "Already have an account? Log in" to /login.
Behavior:
1. Client validation matching the backend rules (name 2-60 chars, valid email, password 8-72 chars with a letter and a number, confirm must match). Show inline error messages under fields on blur and on submit, with aria-invalid and aria-describedby; the first invalid field gets focus on submit.
2. Show server errors in an inline alert above the form (e.g. "Invalid email or password", "An account with this email already exists", "Too many failed attempts. Try again later.", network errors) and do not clear the email field. Also keep a toast for network failures only.
3. On success call AuthContext login/signup, show a success toast "Welcome, <first name>!" and navigate("/", { replace: true }) so the user lands on the Home page. Back button must not return to the login page.
4. Disable the submit button and inputs while loading; prevent double submit; Enter key submits.
5. Correct input attributes: type="email" with autoComplete="email", autoComplete="current-password" on login and "new-password" on signup, name attributes, autofocus on the first field, inputMode and spellCheck off for the email.
6. Accessibility: labels for every input, visible focus rings, keyboard-operable show/hide button with aria-label and aria-pressed, errors announced with aria-live="polite", good contrast in both themes.
7. Update the Home page hero to greet the logged-in user ("Welcome back, <first name>") using AuthContext.
8. Set page titles ("Log in | DocuMentor AI" and "Sign up | DocuMentor AI").
```

**Check:** In mock mode: create an account, land on Home with the greeting; log out; log in; try wrong password, duplicate email, weak password; test light/dark and 360px width.

**Commit**
```bash
git add frontend/
git commit -m "feat(frontend): add polished login and signup pages with validation and redirect to home"
```

---

## CHUNK 5 — Frontend: user menu, logout and session polish (Kaustubh)

**Prompt**
```text
Read antigravitycontext.md first and follow the existing design system. Work only inside frontend/.

Task: Finish the signed-in experience.
1. src/components/layout/UserMenu.jsx: an avatar circle with the user's initials on the brand gradient, name and email, opening a dropdown (framer-motion, closes on outside click and Esc, keyboard accessible with correct aria attributes) with "Signed in as <email>", a Theme toggle row and "Log out" (danger style). Place it in the Sidebar footer on desktop and in the mobile drawer/Topbar.
2. Logout: call AuthContext.logout, show the toast "You have been logged out", redirect to /login, and make sure no previous user's data stays visible (documents list, chat messages, study results are all reset). Test by logging in as user A, logging out, logging in as user B in the same tab: B must see an empty library and a fresh chat.
3. Session expiry: when the 401 handler fires, redirect to /login with the toast "Your session expired. Please log in again."; avoid showing multiple toasts or redirect loops when several requests fail at once.
4. Loading and edge cases: no flash of protected content on refresh; if the token is valid but the backend is offline, show the existing backend banner instead of logging the user out (only an actual 401 logs out).
5. Update the backend-status or banner logic only if needed so that the login and signup pages also show a clear message if the backend is unreachable.
6. Run npm run build and fix warnings; remove unused code.
```

**Check:** Two different accounts in the same browser never see each other's data; expired or deleted token sends you to login once.

**Commit**
```bash
git add frontend/
git commit -m "feat(frontend): add user menu, safe logout and session expiry handling"
git push origin feat/frontend-auth
```
> Open a PR and ask Yash to review.

---

## CHUNK 6 — Integration, verification, docs and deployment settings (both)

> Do this after both PRs are merged to `main` and both developers have pulled. Create a fresh local environment first: delete `data/` (old documents have no owner), make sure `backend/.env` contains a real `SECRET_KEY`, and set `VITE_USE_MOCK=false`.

**Prompt**
```text
Read antigravitycontext.md first. You may edit both backend/ and frontend/ for bug fixes found during this verification, plus docs and compose files.

Task: Verify the complete authentication flow end to end against the real backend and fix every problem found.
1. Start backend and frontend. Walk through and fix any bug in this flow: open the app logged out -> redirected to /login -> create account -> redirected to Home with greeting -> upload a document -> chat with sources -> generate summary, flashcards and quiz -> refresh the page (still logged in) -> log out -> log in again -> data still there.
2. Isolation check with two accounts in two browser profiles (or one normal and one private window): user B must not see A's documents, must get no sources from A's documents in chat, and must get 404 when requesting A's document or session ids directly (try with curl or /docs using B's token).
3. Security review of the final code: no password, hash or token is logged; password_hash never appears in any response; every route except health/signup/login requires auth; the SECRET_KEY check works (try starting without it); CORS allows the Authorization header and the configured origin; Argon2 and JWT usage is correct; fix anything weak.
4. Make sure `pytest` passes in backend/, `npm run build` passes in frontend/, and backend/scripts/smoke_test.py passes against the running server.
5. Docker: add SECRET_KEY (and the other new variables) to docker-compose.yml via env_file or environment, never hard-coded; confirm `docker compose up --build` works and signup/login works through the containers.
6. Documentation: update README.md (features: accounts and login; setup: how to generate SECRET_KEY; how to run the tests), docs/testing.md (add the auth and isolation checklist from step 1 and 2) and docs/demo-script.md (start the demo from the signup page).
7. Deployment notes in README.md: for Hugging Face Spaces add SECRET_KEY as a Secret (not a Variable); for a frontend on a different domain make sure CORS_ORIGINS matches exactly; tokens expire after 24 hours; free hosts that erase storage also erase accounts and documents on restart.
8. Print a short final report listing what was verified and any known limitations (no password reset, no email verification, token in localStorage, in-memory rate limit).
```

**Check:** The full flow works, both test suites pass, and a second user cannot access the first user's data.

**Commit**
```bash
git checkout main && git pull
git checkout -b chore/auth-integration
git add .
git commit -m "chore: verify auth integration, update docs and deployment settings"
git push origin chore/auth-integration
git tag v1.1.0   # after the PR is merged and you are on main
git push origin v1.1.0
```

---

## Deployment reminder (after you pull this feature)
- **Hugging Face Space:** add `SECRET_KEY` under **Secrets** (generate with `python -c "import secrets; print(secrets.token_urlsafe(48))"`). Without it the backend refuses to start.
- **Existing deployed data:** old documents have no owner and become invisible. Re-upload them under a new account.
- **Vercel:** no new variables needed. Redeploy if you changed anything.

## FINAL CHECKLIST
- [x] Signup and login redirect to Home
- [x] Logged-out visits to any page go to `/login`
- [x] Logged-in visits to `/login` or `/signup` go to Home
- [x] Refresh keeps you logged in; logout clears everything
- [x] Two accounts never see each other's data
- [x] All routes except health/signup/login return 401 without a token
- [x] `pytest` and `npm run build` pass
- [x] `SECRET_KEY` is set locally and on the host, and not committed