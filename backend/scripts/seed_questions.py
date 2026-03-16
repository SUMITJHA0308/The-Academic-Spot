import pandas as pd
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.question import Question

CSV_FILE = "Thermodynamics.csv"

def seed_questions():
    db: Session = SessionLocal()
    df = pd.read_csv(CSV_FILE)

    for _, row in df.iterrows():
        q = Question(
            question=row["question"],
            difficulty=row["difficulty"],
            option_a=row["option_a"],
            option_b=row["option_b"],
            option_c=row["option_c"],
            option_d=row["option_d"],
            correct_answer=row["correct_answer"],
            Difficulty=row["Difficulty"]
        )
        db.add(q)

    db.commit()
    db.close()
    print("✅ Questions inserted successfully")

if __name__ == "__main__":
    seed_questions()
