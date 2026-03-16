from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# ======================================================
# LOAD ENV
# ======================================================
load_dotenv()

# ======================================================
# DATABASE
# ======================================================
from app.core.database import Base, engine, get_db
from app.models.question import Question

# ======================================================
# ROUTERS
# ======================================================
from app.routes import auth, student, questions, analytics, admin

# ======================================================
# FASTAPI APP
# ======================================================
app = FastAPI(
    title="The Academic Spot",
    version="2.3.0",
    description="AI Driven Adaptive Learning Platform"
)

# ======================================================
# CORS (VERY IMPORTANT)
# ======================================================
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost",
    "http://127.0.0.1"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================================================
# CREATE TABLES
# ======================================================
Base.metadata.create_all(bind=engine)

# ======================================================
# INCLUDE ROUTERS
# ======================================================
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(student.router, prefix="/student", tags=["student"])
app.include_router(questions.router, prefix="/questions", tags=["questions"])
app.include_router(analytics.router)
app.include_router(admin.router, prefix="/admin", tags=["admin"])

# ======================================================
# ROOT
# ======================================================
@app.get("/")
def root():
    return {
        "platform": "The Academic Spot",
        "status": "Backend Running"
    }

# ======================================================
# HEALTH CHECK
# ======================================================
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "academic-spot-backend"
    }

# ======================================================
# SUBJECT LIST
# ======================================================
@app.get("/subjects")
def get_subjects(db: Session = Depends(get_db)):

    subjects = db.query(Question.subject).distinct().all()

    return [s[0] for s in subjects if s[0]]

# ======================================================
# CHAPTER LIST
# ======================================================
@app.get("/chapters/{subject}")
def get_chapters(subject: str, db: Session = Depends(get_db)):

    chapters = (
        db.query(Question.chapter)
        .filter(Question.subject == subject)
        .distinct()
        .all()
    )

    return [c[0] for c in chapters if c[0]]

# ======================================================
# GET QUESTIONS
# ======================================================
@app.get("/questions/{subject}/{chapter}")
def get_questions(subject: str, chapter: str, db: Session = Depends(get_db)):

    questions = (
        db.query(Question)
        .filter(
            Question.subject == subject,
            Question.chapter == chapter
        )
        .all()
    )

    return [
        {
            "id": q.id,
            "question": q.question,
            "difficulty": q.difficulty,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d,
        }
        for q in questions
    ]