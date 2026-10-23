import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import get_settings
from app.core.security import create_access_token
from app.db.database import get_db, Base, engine, SessionLocal
from app.db.models import User

TEST_SECRET_KEY = "test-secret-key-at-least-32-chars-for-documentor-ai-tests!"


@pytest.fixture(autouse=True)
def ensure_test_secret_key(monkeypatch):
    """Ensures SECRET_KEY is always set to a valid 32+ char key across all tests."""
    settings = get_settings()
    monkeypatch.setattr(settings, "SECRET_KEY", TEST_SECRET_KEY)
    yield


def create_test_auth_headers(client: TestClient, prefix: str = "testuser") -> tuple[int, dict]:
    """Helper to create a fresh user via signup and return (user_id, headers)."""
    unique_email = f"{prefix}_{uuid.uuid4().hex[:8]}@example.com"
    res = client.post(
        "/api/auth/signup",
        json={"name": f"{prefix.capitalize()} User", "email": unique_email, "password": "Password123"},
    )
    assert res.status_code == 201, f"Signup failed: {res.text}"
    token = res.json()["access_token"]
    user_id = res.json()["user"]["id"]
    return user_id, {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_user(db_session):
    """Creates a default test user and returns (user, auth_headers)."""
    user = User(
        name="Test User",
        email=f"user_{uuid.uuid4().hex[:8]}@example.com",
        password_hash="fake_hash",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    token = create_access_token(user.id)
    headers = {"Authorization": f"Bearer {token}"}
    return user, headers


@pytest.fixture
def db_session():
    """Provides a fresh database session for a test."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
