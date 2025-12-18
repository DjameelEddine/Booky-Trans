from fastapi import APIRouter, Depends, Form, status, HTTPException, Response, File, UploadFile
import os
import uuid
from datetime import datetime
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from schemas import BookCreate, BookOut
from database import get_db
import models
from typing import List
from sqlalchemy import or_
from oauth2 import get_current_user
from utils import secure_filename


'''
Code Explanation:

- current_user: models.User=Depends(get_current_user):

    this line is used to get all info of the currently
    logged in user, you don't need to understand how it
    works, just put it as an argument in your API Endpoint
    like I'm doing so below (make sure you import what's required).
'''


router = APIRouter(prefix="/books", tags=["Books"])

@router.post("/upload", response_model=BookOut)
async def upload_book(db: Session=Depends(get_db),
                      name: str = Form(...),
                      category: str = Form(...),
                      author: str = Form(...),
                      description: str = "Book",
                      language: str = Form(...),
                      target_language: str = Form(...),
                      file: UploadFile = File(...),
                      img: UploadFile = File(...),
                      current_user: models.User=Depends(get_current_user)):

    print ('inside upload_book')

    try:
        book_dict = {
            
            "name": name.capitalize(),
            "category": category.capitalize(),
            "author": author.capitalize(),
            "description": description,
            "language": language.capitalize(),
            "target_language": target_language.capitalize(),
            "file_path": "",
            "img_path": None
        }

        new_book = models.Book(**book_dict)
        print('after creating new_book', new_book.id)
        db.add(new_book)
        print('after adding new book')
        db.commit()
        print('after committing to db')
        db.refresh(new_book)
        print('after refreshing')

        book_folder = os.path.join("uploads", "books", str(new_book.id))
        os.makedirs(book_folder, exist_ok=True)

        # 3. Save file to folder
        filename = secure_filename(file.filename)
        file_path = os.path.join(book_folder, filename)
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        img_path = None
        if img and img.filename:
            img_filename = f"cover_{secure_filename(img.filename)}"
            img_path = os.path.join(book_folder, img_filename)
    
            with open(img_path, "wb") as buffer:
                img_content = await img.read()
                buffer.write(img_content)
        
        # 5. Update book with file paths
        db.query(models.Book).filter(models.Book.id == new_book.id).update({"file_path": file_path})
        if img_path:
            db.query(models.Book).filter(models.Book.id == new_book.id).update({"img_path": img_path})
        db.commit()  # Don't forget this!

        # Add this book to `uploaded_books` table

        uploaded_book_dict = {'user_id': current_user.id, 'book_id':new_book.id}
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
def get_books(search: str = "", filter: str = "", db: Session = Depends(get_db)):
    
    query = db.query(models.Book)
    
    if search:
        search = search.capitalize()
        query = query.filter(
            or_(
                models.Book.name.contains(search),
                models.Book.category.contains(search),
                models.Book.author.contains(search),
                models.Book.language.contains(search),
                models.Book.target_language.contains(search),
            )
        )
    
    if filter:
        filter = filter.capitalize()
        query = query.filter(
            or_(
                models.Book.category.contains(filter),
                models.Book.language.contains(filter),
                models.Book.target_language.contains(filter),
            )
        )
    
    books = query.all()
    
    if not books:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No Book Has Been Found!"
        )
    
    return books


@router.post('/{book_id}')
def toggle_favorite(book_id: int, db: Session=Depends(get_db),
                    current_user: models.User=Depends(get_current_user)):
    # Check if already favorited
    existing = db.query(models.FavoriteBooks).filter(
        models.FavoriteBooks.user_id == current_user.id,
        models.FavoriteBooks.book_id == book_id
    ).first()

    if existing:
        # Remove favorite
        db.delete(existing)
        db.commit()
        return {"favorited": False}
    else:
        # Add favorite
        fav = models.FavoriteBooks(user_id=current_user.id, book_id=book_id)
        db.add(fav)
        db.commit()
        return {"favorited": True}

@router.get("/{book_id}/download")
def download_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="book not found")

    if not os.path.exists(str(book.file_path)):
        raise HTTPException(status_code=404, detail="File not found on server")
    
    return FileResponse(
        str(book.file_path),
        media_type="application/octet-stream",
        filename=os.path.basename(str(book.file_path))
    )