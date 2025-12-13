
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from database import get_db
from sqlalchemy.orm import Session
import models
from passlib.context import CryptContext

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Simple register - NO TOKENS"""
    # Check if user exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = pwd_context.hash(user.password)
    
    # Create user
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        name=user.name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return {"message": f"User {user.email} created successfully", "user_id": db_user.id}

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    """Simple login - NO TOKENS, just success message"""
    # Find user
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Check password
    if not pwd_context.verify(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    return {"message": f"Logged in as {user.email}", "user_id": db_user.id}

@router.get("/me")
def get_me(db: Session = Depends(get_db)):
    """Public profile - NO TOKEN needed"""
    
    user = db.query(models.User).first()
    if not user:
        raise HTTPException(status_code=404, detail="No users found")
    return {"email": user.email, "name": user.name}
