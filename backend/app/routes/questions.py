from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.question import Question

router = APIRouter(
    prefix="/questions",
    tags=["questions"]
)

@router.get("/")
def list_questions(db: Session = Depends(get_db)):
    questions = db.query(Question).all()
    return questions
