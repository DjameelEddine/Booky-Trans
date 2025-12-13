from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from database import get_db
from models import User
from passlib.context import CryptContext

router = APIRouter(prefix="/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_pw: str, hashed_pw: str):
    return pwd_context.verify(plain_pw, hashed_pw)

@router.post("/register", status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check duplicate email
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(400, "Email already registered")
    
    hashed_pw = hash_password(user.password)
    new_user = User(
        email=user.email,
        password=hashed_pw,
        name=user.name
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": f"User {user.email} created", "user_id": new_user.id}

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    user_db = db.query(User).filter(User.email == user.email).first()
    
    if not user_db or not verify_password(user.password, user_db.password):
        raise HTTPException(status_code=403, detail="Invalid credentials")
    
    return {"message": f"Logged in as {user.email}", "user_id": user_db.id}

@router.get("/me")
def get_me(db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        return {"username": "demo_user", "email": "demo@example.com"}
    return {"username": user.name or "demo", "email": user.email}
