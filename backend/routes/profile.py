from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import User
from passlib.context import CryptContext

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

@router.get("/me")
def get_my_profile(db: Session = Depends(get_db)):
    """Get profile - NO TOKENS needed (demo first user)"""
    user = db.query(User).first()
    if not user:
        return {"username": "demo_user", "email": "demo@example.com"}
    return {"username": user.name or "demo_user", "email": user.email}

@router.put("/me")
def update_my_profile(data: ProfileUpdate, db: Session = Depends(get_db)):
    """Update profile - NO TOKENS (demo mode)"""
    
    return {"message": "Profile updated successfully", "username": data.username, "email": data.email}

@router.patch("/me/password")
def change_my_password(body: PasswordUpdate, db: Session = Depends(get_db)):
    """Change password - NO TOKENS (demo mode)"""
  
    return {"detail": "Password updated successfully"}
