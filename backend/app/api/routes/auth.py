import logging
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import hash_password, verify_password, create_access_token
from app.db.database import get_db
from app.db.models import User
from app.schemas.auth import SignupRequest, LoginRequest, UserOut, TokenResponse
from app.services.rate_limit import login_rate_limiter
from app.api.deps import get_current_user

logger = logging.getLogger("documentor.auth")
router = APIRouter(prefix="/auth", tags=["auth"])

# Standard pre-computed dummy hash for timing-attack mitigation
DUMMY_ARGON2_HASH = "$argon2id$v=19$m=65536,t=3,p=4$anVzdGFkdW1teXNhbHQ$dummyhashdummyhashdummyhashdummyhashdummy"


def _get_client_ip(request: Request) -> str:
    """Extracts client IP address safely, checking proxy headers if present."""
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return "127.0.0.1"


@router.post(
    "/signup",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user account and obtain access token",
)
def signup(
    payload: SignupRequest,
    db: Session = Depends(get_db),
):
    normalized_email = payload.email.lower().strip()

    # Check for existing user with case-insensitive unique email
    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    # Securely hash password and persist user
    hashed = hash_password(payload.password)
    new_user = User(
        name=payload.name,
        email=normalized_email,
        password_hash=hashed,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    logger.info("New user registered successfully with ID: %d", new_user.id)

    access_token = create_access_token(new_user.id)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserOut.model_validate(new_user),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user with email and password",
)
def login(
    request: Request,
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    settings = get_settings()
    client_ip = _get_client_ip(request)
    normalized_email = payload.email.lower().strip()

    # Check rate limit before processing credentials
    if login_rate_limiter.is_blocked(
        client_ip,
        normalized_email,
        max_attempts=settings.LOGIN_MAX_ATTEMPTS,
        window_minutes=settings.LOGIN_WINDOW_MINUTES,
    ):
        logger.warning(
            "Rate limit triggered for IP %s and email %s",
            client_ip,
            normalized_email,
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed attempts. Try again later.",
        )

    user = db.query(User).filter(User.email == normalized_email).first()

    if not user:
        # Dummy verification to protect against user enumeration timing attacks
        verify_password("dummy_password_timing_pad", DUMMY_ARGON2_HASH)
        login_rate_limiter.record_failure(client_ip, normalized_email, settings.LOGIN_WINDOW_MINUTES)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Verify password
    if not verify_password(payload.password, user.password_hash):
        login_rate_limiter.record_failure(client_ip, normalized_email, settings.LOGIN_WINDOW_MINUTES)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Clear rate limiter on successful login
    login_rate_limiter.clear(client_ip, normalized_email)
    logger.info("User %d successfully logged in", user.id)

    access_token = create_access_token(user.id)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserOut.model_validate(user),
    )


@router.get(
    "/me",
    response_model=UserOut,
    status_code=status.HTTP_200_OK,
    summary="Get current authenticated user profile",
)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)
