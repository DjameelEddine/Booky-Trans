from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
from datetime import datetime

from database import get_db
from models import User, FavoriteBooks, UploadedBooks, Book, Translation
from schemas import (
    UserOut,
    ProfileUpdate,
    PasswordUpdate,
    FavoriteBookOut,
    UploadedBookOut,
    TranslatedBookOut,
)
from utils import verify_password, hash_password
from oauth2 import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])

# ====================== PROFILE ======================

@router.get("/me", response_model=UserOut)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id: {current_user.id} not found!",
        )
    return user

@router.patch("/me", response_model=UserOut)
def update_my_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_query = db.query(User).filter(User.id == current_user.id)
    user = user_query.first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    update_data = {}

    if data.full_name is not None:
        update_data["full_name"] = data.full_name.capitalize()
    if data.email is not None:
        update_data["email"] = data.email
    if data.avatar_url is not None:
        avatar = str(data.avatar_url)
        if len(avatar) <= 255:
            update_data["avatar_url"] = avatar
    if data.bio is not None:
        update_data["bio"] = data.bio

    if update_data:
        user_query.update(update_data, synchronize_session=False)
        db.commit()
        db.refresh(user)

    return user

# ====================== FIXED AVATAR UPLOAD ======================
@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Only images allowed")
    
   
    os.makedirs("uploads/avatars", exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{current_user.id}_{timestamp}_{file.filename}"
    filepath = f"uploads/avatars/{filename}"
    
    # Save file
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update user avatar_url
    user = db.query(User).filter(User.id == current_user.id).first()
    user.avatar_url = f"/uploads/avatars/{filename}"  
    
    return {"avatar_url": user.avatar_url}

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


# ====================== FAVORITES ENDPOINTS ======================

@router.get("/favorites", response_model=List[FavoriteBookOut])
def get_favorite_books(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    favorites = (
        db.query(Book)
        .join(FavoriteBooks, Book.id == FavoriteBooks.book_id)
        .filter(FavoriteBooks.user_id == current_user.id)
        .all()
    )
    return favorites


@router.post("/favorites/{book_id}")
def add_favorite_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )

    existing = (
        db.query(FavoriteBooks)
        .filter(
            FavoriteBooks.user_id == current_user.id,
            FavoriteBooks.book_id == book_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Book already in favorites",
        )

    favorite = FavoriteBooks(user_id=current_user.id, book_id=book_id)
    db.add(favorite)
    db.commit()

    return {"message": "Book added to favorites", "favorited": True}


@router.delete("/favorites/{book_id}")
def remove_favorite_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    favorite = (
        db.query(FavoriteBooks)
        .filter(
            FavoriteBooks.user_id == current_user.id,
            FavoriteBooks.book_id == book_id,
        )
        .first()
    )

    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not in favorites",
        )

    db.delete(favorite)
    db.commit()

    return {"message": "Book removed from favorites", "favorited": False}


# ====================== UPLOADED BOOKS ENDPOINTS ======================

@router.get("/uploaded-books", response_model=List[UploadedBookOut])
def get_uploaded_books(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    uploaded = (
        db.query(Book)
        .join(UploadedBooks, Book.id == UploadedBooks.book_id)
        .filter(UploadedBooks.user_id == current_user.id)
        .all()
    )
    return uploaded


@router.delete("/uploaded-books/{book_id}")
def delete_uploaded_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )

    uploaded = (
        db.query(UploadedBooks)
        .filter(
            UploadedBooks.user_id == current_user.id,
            UploadedBooks.book_id == book_id,
        )
        .first()
    )
    if not uploaded:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You did not upload this book",
        )

    db.delete(uploaded)
    db.delete(book)
    db.commit()

    return {"message": "Book deleted successfully"}


# ====================== TRANSLATED BOOKS ENDPOINTS ======================

@router.get("/translated-books", response_model=List[TranslatedBookOut])
def get_translated_books(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    translated_books = (
        db.query(Book, Translation.upload_date, Translation.id)
        .join(Translation, Book.id == Translation.book_id)
        .filter(Translation.user_id == current_user.id)
        .all()
    )

    result: List[TranslatedBookOut] = []
    for book, upload_date, translation_id in translated_books:
        book_data = TranslatedBookOut(
            id=book.id,
            name=book.name,
            category=book.category,
            author=book.author,
            language=book.language,
            target_language=book.target_language,
            img_path=book.img_path,
            upload_date=upload_date,
            translation_id=translation_id,
        )
        result.append(book_data)

    return result


@router.delete("/translated-books/{translation_id}")
def delete_translated_book(
    translation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    translation = (
        db.query(Translation)
        .filter(
            Translation.id == translation_id,
            Translation.user_id == current_user.id,
        )
        .first()
    )

    if not translation:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You did not create this translation",
        )

    db.delete(translation)
    db.commit()

    return {"message": "Translation deleted successfully"}
