from datetime import datetime, timezone, timedelta
from typing import Optional, Union
import argon2
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError
import jwt

from app.core.config import get_settings

_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    """Hashes a plain-text password using Argon2id."""
    return _hasher.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """
    Verifies a plain-text password against an Argon2 hash.
    Returns False on mismatch, invalid hash, or any verification exception.
    """
    if not password or not hashed_password:
        return False
    try:
        return _hasher.verify(hashed_password, password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False
    except Exception:
        return False


def create_access_token(user_id: Union[int, str], expires_delta: Optional[timedelta] = None) -> str:
    """Creates a signed HS256 JWT access token containing the sub (user id), iat, and exp claims."""
    settings = get_settings()
    now = datetime.now(timezone.utc)
    if expires_delta is not None:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    payload = {
        "sub": str(user_id),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def decode_access_token(token: str) -> Optional[str]:
    """
    Decodes an access token and returns the subject (user id) string.
    Returns None if the token is expired, invalid, tampered, or malformed without raising exceptions.
    """
    if not token:
        return None
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        sub = payload.get("sub")
        return str(sub) if sub is not None else None
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, jwt.DecodeError):
        return None
    except Exception:
        return None
