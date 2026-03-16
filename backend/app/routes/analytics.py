from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, Integer

from app.core.database import get_db
from app.models.question import Question
from app.models.attempt import Attempt

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)

# ---------------------------------------------------
# 1️⃣ Weak Chapter Analytics
# ---------------------------------------------------
@router.get("/weak-chapters")
def weak_chapters(db: Session = Depends(get_db)):

    result = db.query(
        Question.chapter,
        func.avg(Attempt.is_correct.cast(Integer))
    ).join(
        Attempt,
        Attempt.question_id == Question.id
    ).group_by(
        Question.chapter
    ).all()

    data = []

    for chapter, accuracy in result:

        percent = round(accuracy * 100,2)

        data.append({
            "chapter": chapter,
            "accuracy": percent
        })

    return data


# ---------------------------------------------------
# 2️⃣ Student Risk Detector
# ---------------------------------------------------
@router.get("/student-risk")
def student_risk(db: Session = Depends(get_db)):

    students = db.query(Attempt.student_id).distinct().all()

    data = []

    for s in students:

        attempts = db.query(Attempt).filter(
            Attempt.student_id == s[0]
        ).all()

        if not attempts:
            continue

        accuracy = sum(a.is_correct for a in attempts) / len(attempts) * 100

        if accuracy < 40:
            risk = "HIGH"
        elif accuracy < 70:
            risk = "MEDIUM"
        else:
            risk = "LOW"

        data.append({
            "student_id": s[0],
            "accuracy": round(accuracy,2),
            "risk_level": risk
        })

    return data


# ---------------------------------------------------
# 3️⃣ Difficulty Success Rate
# ---------------------------------------------------
@router.get("/difficulty-success")
def difficulty_success(db: Session = Depends(get_db)):

    result = db.query(
        Question.difficulty,
        func.avg(Attempt.is_correct.cast(Integer))
    ).join(
        Attempt,
        Attempt.question_id == Question.id
    ).group_by(
        Question.difficulty
    ).all()

    data = []

    for difficulty, accuracy in result:

        data.append({
            "difficulty": difficulty,
            "success_rate": round(accuracy * 100,2)
        })

    return data


# ---------------------------------------------------
# 4️⃣ Top Students Leaderboard
# ---------------------------------------------------
@router.get("/leaderboard")
def leaderboard(db: Session = Depends(get_db)):

    students = db.query(Attempt.student_id).distinct().all()

    data = []

    for s in students:

        attempts = db.query(Attempt).filter(
            Attempt.student_id == s[0]
        ).all()

        if not attempts:
            continue

        accuracy = sum(a.is_correct for a in attempts) / len(attempts) * 100

        data.append({
            "student_id": s[0],
            "accuracy": round(accuracy,2)
        })

    data.sort(key=lambda x: x["accuracy"], reverse=True)

    return data[:10]