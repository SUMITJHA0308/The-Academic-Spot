from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.core.database import get_db
from app.models.user import User
from app.models.student_state import StudentState

router = APIRouter()

# ----------------------------------
# HARDCODED ADMIN CREDENTIALS
# ----------------------------------

ADMIN_EMAIL = "admin@academicspot.com"
ADMIN_PASSWORD = "admin123"


# ----------------------------------
# Request Schemas
# ----------------------------------

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ----------------------------------
# REGISTER
# ----------------------------------

@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = User(
        email=data.email,
        password=data.password,
        role=data.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Student state initialize
    if data.role.lower() == "student":

        student_state = StudentState(
            user_id=new_user.id,
            elo_rating=1000,
            current_level="Easy",
            mistake_counter=0
        )

        db.add(student_state)
        db.commit()

    return {"message": "User registered successfully"}


# ----------------------------------
# LOGIN
# ----------------------------------

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):

    # ---------------------------
    # ADMIN LOGIN (HARDCODED)
    # ---------------------------
    if data.email == ADMIN_EMAIL and data.password == ADMIN_PASSWORD:

        return {
            "message": "Admin login successful",
            "role": "admin"
        }

    # ---------------------------
    # NORMAL USER LOGIN
    # ---------------------------

    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.password != data.password:
        raise HTTPException(status_code=401, detail="Invalid password")

    return {
        "message": "Login successful",
        "user_id": user.id,
        "role": user.role
    }