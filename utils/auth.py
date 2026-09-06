from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional, Dict, Any
import jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import APIKeyCookie
import bcrypt
from utils.config import settings
from database.core import get_db_connection

cookie_scheme = APIKeyCookie(name="access_token", auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode('utf-8')[:72]
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')


def create_access_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

async def get_current_user(token: Annotated[Optional[str], Depends(cookie_scheme)]) -> Dict[str, Any]:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated. Please log in.",
    )
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = int(payload.get("sub"))
    except (jwt.PyJWTError, ValueError, TypeError):
        raise credentials_exception

    conn = get_db_connection()
    user = conn.execute("SELECT u_id, username, email, user_type, created_at FROM users WHERE u_id = ?", (user_id,)).fetchone()
    conn.close()

    if not user:
        raise credentials_exception
    return dict(user)

async def get_optional_current_user(request: Request) -> Optional[Dict[str, Any]]:
    token = request.cookies.get("access_token")
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = int(payload.get("sub"))
        conn = get_db_connection()
        user = conn.execute("SELECT u_id, username, email, user_type, created_at FROM users WHERE u_id = ?", (user_id,)).fetchone()
        conn.close()
        return dict(user) if user else None
    except Exception:
        return None

def require_admin(current_user: Annotated[dict, Depends(get_current_user)]) -> dict:
    if current_user.get("user_type") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to platform Administrators."
        )
    return current_user

def require_organizer(current_user: Annotated[dict, Depends(get_current_user)]) -> dict:
    if current_user.get("user_type") not in ("organizer", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to Event Organizers."
        )
    return current_user

def require_buyer(current_user: Annotated[dict, Depends(get_current_user)]) -> dict:
    if current_user.get("user_type") not in ("buyer", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to Ticket Buyers."
        )
    return current_user
