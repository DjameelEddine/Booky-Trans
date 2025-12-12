from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas import ReviewBase, ReviewUpdate
from database import get_db
from models import Review, Translation
from oauth2 import get_current_user

router = APIRouter(prefix="/Reviews", tags=["Reviews"])


@router.post("/review", status_code=201)


@router.put("/{review_id}")
def update_review(
    review_id: int,
    review_update: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Allow the author of a review to update their comment or rating."""
    existing = db.query(Review).filter(Review.id == review_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Review not found")

    if existing.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this review")

    updated = False
    if review_update.comment is not None:
        existing.comment = review_update.comment
        updated = True
    if review_update.rating is not None:
        existing.rating = review_update.rating
        updated = True

    if updated:
        db.commit()
        db.refresh(existing)
    # return the updated review payload so frontend can refresh without extra fetch
    return {
        "message": "Review updated",
        "review": {
            "id": existing.id,
            "translation_id": existing.translation_id,
            "user_id": existing.user_id,
            "date_issued": existing.date_issued.isoformat() if existing.date_issued else None,
            "comment": existing.comment,
            "rating": existing.rating
        }
    }


@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Allow the author to delete their review."""
    existing = db.query(Review).filter(Review.id == review_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Review not found")

    if existing.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this review")

    db.delete(existing)
    db.commit()

    # return deleted review id so frontend can remove it from UI
    return {"message": "Review deleted", "review_id": review_id}
