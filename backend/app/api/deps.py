from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.core.security import decode_access_token

# HTTPBearer with auto_error=False to provide custom 401 response and headers
bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Extracts Bearer token from the Authorization header, validates signature and expiration,
    and loads the corresponding User model from SQLite.
    Raises HTTP 401 with WWW-Authenticate: Bearer on any failure.
    """
    unauthorized_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not credentials or not credentials.credentials:
        raise unauthorized_exception

    token = credentials.credentials
    user_id_str = decode_access_token(token)
    if not user_id_str:
        raise unauthorized_exception

    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        raise unauthorized_exception

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise unauthorized_exception

    return user
