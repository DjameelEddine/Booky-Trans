from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserOut, ProfileUpdate, PasswordUpdate
from utils import verify_password, hash_password
from oauth2 import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("/me", response_model=UserOut)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"User with id: {id} not found!")
    return user

@router.patch("/me", response_model=UserOut)
def update_my_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_query = db.query(User).filter(User.id == current_user.id)
    user = user_query.first()

    user_dict = data.model_dump(exclude_none=True)
    try:
        user_dict["full_name"] = user_dict["full_name"].capitalize()
    except Exception as e:
        print (e)
    user_query.update(user_dict, synchronize_session=False) #type: ignore
    db.commit()
    db.refresh(user)
    return user

@router.patch("/me/password")
def change_my_password(
    body: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(body.current_password, str(current_user.password)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    
    user_query = db.query(User).filter(User.id == current_user.id)
    user_query.update({"password": hash_password(body.new_password)})
    db.commit()

    return {"detail": "Password updated successfully"}
