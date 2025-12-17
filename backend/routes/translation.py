from fastapi import APIRouter, UploadFile, Path, File, Form, HTTPException, status, Depends
from sqlalchemy.orm import Session
import os
import datetime
from utils import secure_filename
from database import get_db
import models
from schemas import TranslationOut, ReviewBase
from oauth2 import get_current_user

router = APIRouter(prefix="/Books/{book_id}/Translations", tags=['Translations'])
# -------------------------
# 1) UPLOAD TRANSLATION
# -------------------------
@router.post("/upload", status_code=201)
async def upload_translation(
    book_id: int = Path(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    try:
        # Check if book exists
        book = db.query(models.Book).filter(models.Book.id == book_id).first()
        if not book:
            raise HTTPException(404, "Book not found")
        
        
        # Validate file extension
        if not file.filename:
            raise HTTPException(400, "No filename provided")
        
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in [".pdf", ".txt", ".epub"]:
            raise HTTPException(400, "Only PDF, EPUB or TXT allowed")
        
        # 1. Create translation in DB first (without file_path)
        new_translation = models.Translation(
            book_id=book_id,
            user_id=current_user.id,
            upload_date=datetime.date.today(),
            file_path=""  # Temporary empty
        )
        
        db.add(new_translation)
        db.commit()
        db.refresh(new_translation)
        
        # 2. Create translation folder
        trans_folder = os.path.join("uploads", "translations", str(new_translation.id))
        os.makedirs(trans_folder, exist_ok=True)
        
        # 3. Save file
        filename = secure_filename(file.filename)
        file_path = os.path.join(trans_folder, filename)
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # 4. Update translation with file_path
        db.query(models.Translation).filter(models.Translation.id == new_translation.id).update(
            {"file_path": file_path}
        )
        db.commit()
        
        return {"message": "Translation uploaded successfully", "translation_id": new_translation.id}
        
    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=400, detail=str(e))


# -------------------------
# 2) LIST TRANSLATIONS FOR A BOOK
# -------------------------
@router.get("/")
def list_translations(book_id: int, db: Session = Depends(get_db)):
    rows = db.query(models.Translation, models.User).join(models.User, models.User.id == models.Translation.user_id).filter(models.Translation.book_id == book_id).all()
    out = []
    for tr, user in rows:
        out.append({
            "id": tr.id,
            "book_id": tr.book_id,
            "user_id": tr.user_id,
            "upload_date": tr.upload_date.isoformat() if tr.upload_date is not None else None,
            "file_path": tr.file_path or '',
            "author_username": user.username,
            "author_full_name": user.full_name,
            "author_display": user.full_name or user.username,
        })
    return out


# -------------------------
# 3) DOWNLOAD TRANSLATION FILE
# -------------------------
from fastapi.responses import FileResponse

@router.get("/{translation_id}/download")
def download_translation(translation_id: int, db: Session = Depends(get_db)):
    translation = db.query(models.Translation).filter(models.Translation.id == translation_id).first()
    if not translation:
        raise HTTPException(status_code=404, detail="Translation not found")

    if not os.path.exists(str(translation.file_path)):
        raise HTTPException(status_code=404, detail="File not found on server")
    
    return FileResponse(
        str(translation.file_path),
        media_type="application/octet-stream",
        filename=os.path.basename(str(translation.file_path))
    )


# -------------------------
# 4) SUBMIT REVIEW
# -------------------------
@router.post("/{translation_id}/review", status_code=201)
def submit_review(
    translation_id: int,
    review: ReviewBase,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    tr = db.query(models.Translation).filter(models.Translation.id == translation_id).first()
    if not tr:
        raise HTTPException(status_code=404, detail="Translation not found")

    if review.rating is None and (review.comment is None or str(review.comment).strip() == ""):
        raise HTTPException(status_code=400, detail="Review must contain at least a rating or a comment")


    new_review = models.Review(
        user_id=current_user.id,
        translation_id=translation_id,
        date_issued=datetime.date.today(),
        rating=review.rating if review.rating is not None else None,
        comment=review.comment if review.comment is not None and str(review.comment).strip() != '' else None,
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    # Attach author display info for frontend convenience
    user = db.query(models.User).filter(models.User.id == new_review.user_id).first()
    return {
        "message": "Review added successfully",
        "review": {
            "id": new_review.id,
            "translation_id": new_review.translation_id,
            "user_id": new_review.user_id,
            "date_issued": new_review.date_issued.isoformat() if new_review.date_issued is not None else None,
            "comment": new_review.comment,
            "rating": new_review.rating,
            "author_username": user.username if user else None,
            "author_full_name": user.full_name if user else None,
            "author_display": (user.full_name or user.username) if user else None,
        }
    }


# -------------------------
# 5) LIST REVIEWS FOR A TRANSLATION
# -------------------------
@router.get("/{translation_id}/reviews")
def list_reviews(translation_id: int, db: Session = Depends(get_db)):
   
    rows = db.query(models.Review, models.User).join(models.User, models.User.id == models.Review.user_id).filter(models.Review.translation_id == translation_id).all()
    out = []
    for rev, user in rows:
        out.append({
            "id": rev.id,
            "translation_id": rev.translation_id,
            "user_id": rev.user_id,
            "date_issued": rev.date_issued.isoformat() if rev.date_issued is not None else None,
            "comment": rev.comment,
            "rating": rev.rating,
            "author_username": user.username,
            "author_full_name": user.full_name,
            "author_display": user.full_name or user.username,
        })
    return out
