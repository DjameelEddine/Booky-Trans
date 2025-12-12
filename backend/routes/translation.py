from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends
from sqlalchemy.orm import Session
import os
import datetime

from ..database import get_db
from ..models import Translation, Review
from ..schemas import TranslationOut, ReviewBase
from ..oauth2 import get_current_user


# Directory where uploaded translation files are stored (project-root/uploads/translations)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads', 'translations')
# ensure directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/Translations", tags=["Translations"])

# -------------------------
# 1) UPLOAD TRANSLATION
# -------------------------
@router.post("/upload", status_code=201)
def upload_translation(
    book_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".txt"]:
        raise HTTPException(status_code=400, detail="Only PDF or TXT allowed")

    # Create unique filename
    filename = f"{datetime.datetime.now().timestamp()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # Save file
    with open(file_path, "wb") as f:
        f.write(file.file.read())

    # Create DB record using the authenticated user id
    new_translation = Translation(
        book_id=book_id,
        user_id=current_user.id,
        upload_date=datetime.date.today(),
        file_path=file_path
    )

    db.add(new_translation)
    db.commit()
    db.refresh(new_translation)

    return {"message": "Translation uploaded successfully", "translation_id": new_translation.id}


# -------------------------
# 2) LIST TRANSLATIONS FOR A BOOK
# -------------------------
@router.get("/book/{book_id}", response_model=list[TranslationOut])
def list_translations(book_id: int, db: Session = Depends(get_db)):
    translations = db.query(Translation).filter(Translation.book_id == book_id).all()
    return translations


# -------------------------
# 3) DOWNLOAD TRANSLATION FILE
# -------------------------
from fastapi.responses import FileResponse

@router.get("/download/{translation_id}")
def download_translation(translation_id: int, db: Session = Depends(get_db)):
    translation = db.query(Translation).filter(Translation.id == translation_id).first()
    if not translation:
        raise HTTPException(status_code=404, detail="Translation not found")

    return FileResponse(
        translation.file_path,
        media_type="application/octet-stream",
        filename=os.path.basename(translation.file_path)
    )


# -------------------------
# 4) SUBMIT REVIEW
# -------------------------
@router.post("/review", status_code=201)
def submit_review(
    review: ReviewBase,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Validate translation exists
    tr = db.query(Translation).filter(Translation.id == review.translation_id).first()
    if not tr:
        raise HTTPException(status_code=404, detail="Translation not found")

    # create review as the authenticated user
    new_review = Review(
        user_id=current_user.id,
        translation_id=review.translation_id,
        date_issued=review.date_issued,
        rating=review.rating,
        comment=review.comment,
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return {
        "message": "Review added successfully",
        "review": {
            "id": new_review.id,
            "translation_id": new_review.translation_id,
            "user_id": new_review.user_id,
            "date_issued": new_review.date_issued.isoformat() if new_review.date_issued else None,
            "comment": new_review.comment,
            "rating": new_review.rating
        }
    }


# -------------------------
# 5) LIST REVIEWS FOR A TRANSLATION
# -------------------------
@router.get("/reviews/{translation_id}")
def list_reviews(translation_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.translation_id == translation_id).all()
    return reviews
