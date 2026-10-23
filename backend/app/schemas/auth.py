import re
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict


class SignupRequest(BaseModel):
    name: str = Field(..., description="Full name (2-60 characters)")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., description="Password (8-72 characters, at least one letter and one number)")

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        trimmed = value.strip()
        if len(trimmed) < 2 or len(trimmed) > 60:
            raise ValueError("Name must be between 2 and 60 characters.")
        return trimmed

    @field_validator("email", mode="after")
    @classmethod
    def lowercase_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 8 or len(value) > 72:
            raise ValueError("Password must be between 8 and 72 characters.")
        if not re.search(r"[A-Za-z]", value):
            raise ValueError("Password must contain at least one letter.")
        if not re.search(r"\d", value):
            raise ValueError("Password must contain at least one number.")
        return value


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Account email address")
    password: str = Field(..., description="Account password")

    @field_validator("email", mode="after")
    @classmethod
    def lowercase_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
