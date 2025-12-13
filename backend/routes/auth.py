from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from passlib.context import CryptContext

import models
import schemas
from database import get_db
from oauth2 import create_access_token, get_current_user
from utils import generate_reset_code, store_reset_code, verify_reset_code, delete_reset_code, send_reset_email, hash_password, verify_password


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", status_code=201, response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):

    # check duplicate email
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(400, "Email already registered")

    # check duplicate username
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(400, "Username already taken")

    hashed_pw = hash_password(user.password)

    new_user = models.User(
        full_name=user.full_name,
        username=user.username,
        email=user.email,
        password=hashed_pw,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=schemas.Token)
def login(
    user_credentials: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    print('inside login')

    user = (
        db.query(models.User)
        .filter(models.User.username == user_credentials.username)
        .first()
    )
    print('fetched user:', user)

    if not user:
        raise HTTPException(status_code=403, detail="Invalid credentials")

    if not verify_password(user_credentials.password, str(user.password)):
        raise HTTPException(status_code=403, detail="Invalid credentials")

    # Create JWT token
    token = create_access_token({"user_id": user.id})

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.post("/forgot-password")
def forgot_password(email_data: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Send password reset verification code to email
    """
    # Check if user exists
    user = db.query(models.User).filter(models.User.email == email_data.email).first()
    
    if user:
        # Only generate and send code if email exists
        code = generate_reset_code()
        store_reset_code(email_data.email, code)
        
        # Send email (prints to console in development)
        send_reset_email(email_data.email, code)
    
    # Don't reveal if email exists or not for security
    return {"message": "If the email exists, a verification code has been sent"}


@router.post("/verify-reset-code")
def verify_code(verify_data: schemas.VerifyCodeRequest, db: Session = Depends(get_db)):
    """
    Verify the reset code
    """
    # Check if user exists
    user = db.query(models.User).filter(models.User.email == verify_data.email).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    # Verify code
    if not verify_reset_code(verify_data.email, verify_data.code):
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
    
    return {"message": "Code verified successfully"}


@router.post("/reset-password")
def reset_password(reset_data: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Reset password after code verification
    """
    # Check if user exists
    user = db.query(models.User).filter(models.User.email == reset_data.email).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid request")
    
    # Verify code one more time
    if not verify_reset_code(reset_data.email, reset_data.code):
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
    
    # Update only password field
    db.query(models.User).filter(models.User.email == reset_data.email).update(
        {"password": hash_password(reset_data.new_password)},
        synchronize_session=False
    )
    db.commit()
    
    # Delete the used code
    delete_reset_code(reset_data.email)
    
    return {"message": "Password reset successfully"}