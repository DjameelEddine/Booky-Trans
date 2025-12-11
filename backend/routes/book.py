from fastapi import APIRouter, Depends, status, HTTPException, Response
from sqlalchemy.orm import Session
from schemas import BookCreate, BookOut
from database import get_db
import models
from typing import List
from sqlalchemy import or_
from oauth2 import get_current_user
import utils


'''
Code Explanation:

- current_user: models.User=Depends(get_current_user):

    this line is used to get all info of the currently
    logged in user, you don't need to understand how it
    works, just put it as an argument in your API Endpoint
    like I'm doing so below (make sure you import what's required).
'''


router = APIRouter(prefix="/Books", tags=["Books"])

@router.post("/BookUplaod", response_model=BookOut)
def upload_book(book: BookCreate, db: Session=Depends(get_db)):

    print ('inside upload_book')

    try:
        book_dict = book.model_dump()
        print('after model dump')
        book_dict["name"] = book_dict["name"].capitalize()
        book_dict["category"] = book_dict["category"].capitalize()
        book_dict["author"] = book_dict["author"].capitalize()
        book_dict["language"] = book_dict["language"].capitalize()
        book_dict["target_language"] = book_dict["target_language"].capitalize()
        print('after inupt capitalization', book_dict)

        new_book = models.Book(**book_dict)
        print('after creating new_book', new_book.id)
        db.add(new_book)
        print('after adding new book')
        db.commit()
        print('after committing to db')
        db.refresh(new_book)
        print('after refreshing')

        # Add this book to `uploaded_books` table

        uploaded_book_dict = {'user_id': 1, 'book_id':new_book.id}
        new_upload = models.UploadedBooks(**uploaded_book_dict)
        print ('after creating new_upload', new_upload)
        db.add(new_upload)
        print ('after adding new_upload')
        db.commit()
        print ('after comitting new_uplaod')
        db.refresh(new_upload)
        print ('after refreshing new_uplaod')

        return new_book
    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=400, detail=str(e))



@router.get("/", response_model=List[BookOut])
def get_books(search: str = "", filter: str="", db: Session = Depends(get_db)):
    search = search.capitalize()

    books = db.query(models.Book).filter(
        or_(
        models.Book.name.contains(search),
        models.Book.category.contains(search),
        models.Book.author.contains(search),
        models.Book.language.contains(search),
        models.Book.target_language.contains(search),
        models.Book.category.contains(filter),
        models.Book.language.contains(filter),
        models.Book.target_language.contains(filter),
        )
        ).all()
    if not books:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="No Book Has Been Found!")
    return books


@router.post('/')
def toggle_favorite(book_id: int, db: Session=Depends(get_db)):
    # Check if already favorited
    existing = db.query(models.FavoriteBooks).filter(
        models.FavoriteBooks.user_id == 1,
        models.FavoriteBooks.book_id == book_id
    ).first()

    if existing:
        # Remove favorite
        db.delete(existing)
        db.commit()
        return {"favorited": False}
    else:
        # Add favorite
        fav = models.FavoriteBooks(user_id=1, book_id=book_id)
        db.add(fav)
        db.commit()
        return {"favorited": True}
