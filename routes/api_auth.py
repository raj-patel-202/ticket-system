from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Response, Depends, status
from models.schemas import UserRegister, UserLogin, UserOut
from database.core import get_db_connection
from utils.auth import (
    verify_password,
    hash_password,
    create_access_token,
    get_current_user
)
from utils.config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut)
def register_user(creds: UserRegister, response: Response):
    conn = get_db_connection()
    cursor = conn.cursor()

    if creds.user_type not in ("buyer", "organizer"):
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator accounts cannot be registered via the web interface. Please use the CLI tool (create_admin.py)."
        )

    # Check existing
    existing = cursor.execute(
        "SELECT u_id FROM users WHERE username = ? OR email = ?",
        (creds.username.strip(), creds.email.lower().strip())
    ).fetchone()

    if existing:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email is already registered."
        )

    now = datetime.now(timezone.utc).isoformat()
    hashed = hash_password(creds.password)

    cursor.execute(
        "INSERT INTO users (username, email, password, user_type, created_at) VALUES (?, ?, ?, ?, ?)",
        (creds.username.strip(), creds.email.lower().strip(), hashed, creds.user_type, now)
    )
    user_id = cursor.lastrowid
    conn.commit()

    # Auto-login after registration
    token = create_access_token(user_id)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    user_data = {
        "u_id": user_id,
        "username": creds.username.strip(),
        "email": creds.email.lower().strip(),
        "user_type": creds.user_type,
        "created_at": now
    }
    conn.close()
    return user_data

@router.post("/login")
def login_user(creds: UserLogin, response: Response):
    conn = get_db_connection()
    user = conn.execute(
        "SELECT * FROM users WHERE username = ?",
        (creds.username.strip(),)
    ).fetchone()
    conn.close()

    if not user or not verify_password(creds.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password."
        )

    token = create_access_token(user["u_id"])
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    # Determine redirect based on role
    redirect_url = "/"
    if user["user_type"] == "admin":
        redirect_url = "/admin"
    elif user["user_type"] == "organizer":
        redirect_url = "/dashboard"
    else:
        redirect_url = "/"

    return {
        "detail": "Login successful",
        "user": {
            "u_id": user["u_id"],
            "username": user["username"],
            "email": user["email"],
            "user_type": user["user_type"]
        },
        "redirect_url": redirect_url
    }

@router.post("/logout")
def logout_user(response: Response):
    response.delete_cookie(key="access_token")
    return {"detail": "Logged out successfully", "redirect_url": "/login"}

@router.get("/me")
def read_current_user_profile(current_user: dict = Depends(get_current_user)):
    return {
        "u_id": current_user["u_id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "user_type": current_user["user_type"],
        "created_at": current_user["created_at"]
    }
