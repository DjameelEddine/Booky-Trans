from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserOut, UserUpdate
from oauth2 import get_current_user
from utils import hash_password

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("/me", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
def update_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if data.first_name: current_user.First_name = data.first_name
    if data.last_name: current_user.Last_name = data.last_name
    if data.email: current_user.Email = data.email
    if data.password: current_user.Password = hash_password(data.password)
    
    db.commit()
    db.refresh(current_user)
    return current_user
