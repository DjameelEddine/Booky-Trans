from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserOut, ProfileUpdate, PasswordUpdate
from utils import verify_password, hash_password
from dependencies import get_current_user

router = APIRouter()

@router.get("/me", response_model=UserOut)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return current_user

@router.put("/me", response_model=UserOut)
def update_my_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.first_name is not None:
        current_user.first_name = data.first_name
    if data.last_name is not None:
        current_user.last_name = data.last_name
    if data.email is not None:
        current_user.email = data.email

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return current_user

@router.put("/me/password")
def change_my_password(
    body: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(body.current_password, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    current_user.password = hash_password(body.new_password)
    db.add(current_user)
    db.commit()

    return {"detail": "Password updated successfully"}
