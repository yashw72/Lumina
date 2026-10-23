import pytest
from datetime import timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.config import get_settings
from app.core.security import create_access_token
from app.db.database import Base, get_db
from app.services.rate_limit import login_rate_limiter


TEST_SECRET = "super-secret-test-key-that-is-at-least-32-characters-long!"


@pytest.fixture(autouse=True)
def setup_auth_test_env(tmp_path, monkeypatch):
    """Sets up an isolated SQLite test database, test SECRET_KEY, and resets rate limits."""
    settings = get_settings()
    monkeypatch.setattr(settings, "SECRET_KEY", TEST_SECRET)
    monkeypatch.setattr(settings, "LOGIN_MAX_ATTEMPTS", 5)
    monkeypatch.setattr(settings, "LOGIN_WINDOW_MINUTES", 15)

    test_db_file = tmp_path / "test_auth.db"
    test_db_url = f"sqlite:///{test_db_file.as_posix()}"
    test_engine = create_engine(test_db_url, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

    Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    login_rate_limiter._failures.clear()

    yield

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)


def test_signup_success():
    with TestClient(app) as client:
        res = client.post(
            "/api/auth/signup",
            json={"name": "Yash W", "email": "yash@example.com", "password": "SecurePassword1"},
        )
        assert res.status_code == 201, res.text
        data = res.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "yash@example.com"
        assert data["user"]["name"] == "Yash W"
        assert "password_hash" not in data["user"]


def test_duplicate_email_case_insensitive():
    with TestClient(app) as client:
        res1 = client.post(
            "/api/auth/signup",
            json={"name": "User One", "email": "test@domain.com", "password": "Password123"},
        )
        assert res1.status_code == 201

        # Attempt signup with same email in uppercase
        res2 = client.post(
            "/api/auth/signup",
            json={"name": "User Two", "email": "TEST@DOMAIN.COM", "password": "Password123"},
        )
        assert res2.status_code == 409
        assert res2.json()["detail"] == "An account with this email already exists"


def test_weak_password_validation():
    with TestClient(app) as client:
        # Too short (< 8 chars)
        res_short = client.post(
            "/api/auth/signup",
            json={"name": "Alice", "email": "alice@example.com", "password": "Pass1"},
        )
        assert res_short.status_code == 422

        # No numbers
        res_no_num = client.post(
            "/api/auth/signup",
            json={"name": "Alice", "email": "alice@example.com", "password": "PasswordOnly"},
        )
        assert res_no_num.status_code == 422

        # No letters
        res_no_letters = client.post(
            "/api/auth/signup",
            json={"name": "Alice", "email": "alice@example.com", "password": "1234567890"},
        )
        assert res_no_letters.status_code == 422


def test_invalid_email_validation():
    with TestClient(app) as client:
        res = client.post(
            "/api/auth/signup",
            json={"name": "Bob", "email": "not-an-email", "password": "Password123"},
        )
        assert res.status_code == 422


def test_login_success():
    with TestClient(app) as client:
        # First sign up
        signup_res = client.post(
            "/api/auth/signup",
            json={"name": "Charlie", "email": "charlie@example.com", "password": "Password123"},
        )
        assert signup_res.status_code == 201

        # Now log in (using mixed case to verify case-insensitivity)
        login_res = client.post(
            "/api/auth/login",
            json={"email": "CHARLIE@Example.com", "password": "Password123"},
        )
        assert login_res.status_code == 200
        data = login_res.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "charlie@example.com"


def test_login_wrong_password():
    with TestClient(app) as client:
        client.post(
            "/api/auth/signup",
            json={"name": "Dave", "email": "dave@example.com", "password": "Password123"},
        )

        res = client.post(
            "/api/auth/login",
            json={"email": "dave@example.com", "password": "WrongPassword99"},
        )
        assert res.status_code == 401
        assert res.json()["detail"] == "Invalid email or password"


def test_login_unknown_email():
    with TestClient(app) as client:
        res = client.post(
            "/api/auth/login",
            json={"email": "unknown@example.com", "password": "Password123"},
        )
        assert res.status_code == 401
        # Must return same message as wrong password to avoid user enumeration
        assert res.json()["detail"] == "Invalid email or password"


def test_me_valid_token():
    with TestClient(app) as client:
        signup_res = client.post(
            "/api/auth/signup",
            json={"name": "Eve", "email": "eve@example.com", "password": "Password123"},
        )
        token = signup_res.json()["access_token"]

        res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        user = res.json()
        assert user["name"] == "Eve"
        assert user["email"] == "eve@example.com"
        assert "id" in user


def test_me_no_token():
    with TestClient(app) as client:
        res = client.get("/api/auth/me")
        assert res.status_code == 401
        assert res.json()["detail"] == "Not authenticated"
        assert "WWW-Authenticate" in res.headers


def test_me_tampered_token():
    with TestClient(app) as client:
        tampered = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsignature"
        res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {tampered}"})
        assert res.status_code == 401
        assert res.json()["detail"] == "Not authenticated"


def test_me_expired_token():
    with TestClient(app) as client:
        # Create token with -1 hour expiry
        expired_token = create_access_token(user_id=1, expires_delta=timedelta(hours=-1))
        res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
        assert res.status_code == 401
        assert res.json()["detail"] == "Not authenticated"


def test_rate_limit_blocks_after_max_attempts():
    with TestClient(app) as client:
        email = "bruteforce@target.com"
        # 5 failed attempts (LOGIN_MAX_ATTEMPTS = 5)
        for _ in range(5):
            res = client.post(
                "/api/auth/login",
                json={"email": email, "password": "WrongPassword1"},
            )
            assert res.status_code == 401

        # 6th attempt must be blocked with 429
        blocked_res = client.post(
            "/api/auth/login",
            json={"email": email, "password": "WrongPassword1"},
        )
        assert blocked_res.status_code == 429
        assert blocked_res.json()["detail"] == "Too many failed attempts. Try again later."
