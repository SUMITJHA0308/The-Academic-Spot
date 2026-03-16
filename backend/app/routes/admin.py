from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from sqlalchemy import distinct

import pandas as pd
import io

from app.core.database import get_db
from app.models.question import Question
from app.models.user import User
from app.models.attempt import Attempt

router = APIRouter(tags=["admin"])


# =====================================================
# 📊 ADMIN DASHBOARD STATS
# =====================================================

@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):

    total_students = db.query(User).filter(User.role == "student").count()
    total_questions = db.query(Question).count()
    total_attempts = db.query(Attempt).count()

    correct_attempts = db.query(Attempt).filter(
        Attempt.is_correct == True
    ).count()

    accuracy = 0
    if total_attempts > 0:
        accuracy = round((correct_attempts / total_attempts) * 100, 2)

    return {
        "total_students": total_students,
        "total_questions": total_questions,
        "total_attempts": total_attempts,
        "accuracy": accuracy
    }


# =====================================================
# 📥 CSV UPLOAD
# =====================================================

@router.post("/upload-csv")
async def upload_csv(
    subject: str = Form(...),
    chapter: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files allowed")

    contents = await file.read()

    try:
        df = pd.read_csv(io.BytesIO(contents))
        df.columns = df.columns.str.strip().str.lower()
    except:
        raise HTTPException(status_code=400, detail="Invalid CSV format")

    required_columns = [
        "question",
        "option_a",
        "option_b",
        "option_c",
        "option_d",
        "correct_answer",
        "difficulty"
    ]

    for col in required_columns:
        if col not in df.columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing column: {col}"
            )

    inserted = 0

    for _, row in df.iterrows():

        try:

            q = Question(
                subject=subject,
                chapter=chapter,
                question=str(row["question"]).strip(),
                option_a=str(row["option_a"]).strip(),
                option_b=str(row["option_b"]).strip(),
                option_c=str(row["option_c"]).strip(),
                option_d=str(row["option_d"]).strip(),
                correct_answer=str(row["correct_answer"]).strip(),
                difficulty=str(row["difficulty"]).strip()
            )

            db.add(q)
            inserted += 1

        except:
            continue

    db.commit()

    return {
        "message": "CSV uploaded successfully",
        "inserted_questions": inserted
    }


# =====================================================
# 📚 GET ALL SUBJECTS
# =====================================================

@router.get("/subjects")
def get_subjects(db: Session = Depends(get_db)):

    subjects = db.query(distinct(Question.subject)).all()

    return [s[0] for s in subjects if s[0] is not None]


# ========================================================================================================
# 📖 GET CHAPTERS
# ========================================================================================================

@router.get("/chapters/{subject}")
def get_chapters(subject: str, db: Session = Depends(get_db)):

    chapters = db.query(
        distinct(Question.chapter)
    ).filter(
        Question.subject == subject
    ).all()

    return [c[0] for c in chapters if c[0] is not None]


# =====================================================
# 📑 GET QUESTIONS
# =====================================================

@router.get("/questions/{subject}/{chapter}")
def get_questions(subject: str, chapter: str, db: Session = Depends(get_db)):

    questions = db.query(Question).filter(
        Question.subject == subject,
        Question.chapter == chapter
    ).all()

    return questions


# =====================================================
# ❌ DELETE QUESTION
# =====================================================

@router.delete("/question/{id}")
def delete_question(id: int, db: Session = Depends(get_db)):

    q = db.query(Question).filter(Question.id == id).first()

    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    db.delete(q)
    db.commit()

    return {"message": "Question deleted"}


# =====================================================
# ✏️ UPDATE QUESTION
# =====================================================

@router.put("/question/{id}")
def update_question(id: int, data: dict, db: Session = Depends(get_db)):

    q = db.query(Question).filter(Question.id == id).first()

    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    q.question = data.get("question", q.question)
    q.option_a = data.get("option_a", q.option_a)
    q.option_b = data.get("option_b", q.option_b)
    q.option_c = data.get("option_c", q.option_c)
    q.option_d = data.get("option_d", q.option_d)
    q.correct_answer = data.get("correct_answer", q.correct_answer)
    q.difficulty = data.get("difficulty", q.difficulty)

    db.commit()

    return {"message": "Question updated successfully"}


# =====================================================
# 👨‍🎓 STUDENT ANALYTICS
# =====================================================

@router.get("/students")
def get_students(db: Session = Depends(get_db)):

    students = db.query(User).filter(User.role == "student").all()

    data = []

    for s in students:

        attempts = db.query(Attempt).filter(
            Attempt.student_id == s.id
        ).count()

        correct = db.query(Attempt).filter(
            Attempt.student_id == s.id,
            Attempt.is_correct == True
        ).count()

        accuracy = 0

        if attempts > 0:
            accuracy = round((correct / attempts) * 100, 2)

        data.append({
            "id": s.id,
            "email": s.email,
            "attempts": attempts,
            "accuracy": accuracy
        })

    return data
@router.delete("/student/{id}")
def delete_student(id:int, db:Session=Depends(get_db)):

    student=db.query(User).filter(User.id==id).first()

    if not student:
        raise HTTPException(status_code=404,detail="Student not found")

    db.delete(student)
    db.commit()

    return {"message":"Student deleted"}