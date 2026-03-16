import pandas as pd
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal
from app.models.question import Question

df = pd.read_csv("processed/merged.csv")

db = SessionLocal()

print(f"Uploading {len(df)} questions...")

try:
    for _, row in df.iterrows():
        question = Question(
            subject=row["subject"],
            chapter=row["chapter"],
            difficulty=row["Difficulty"],
            question=row["Question"],
            option_a=row["Option_A"],
            option_b=row["Option_B"],
            option_c=row["Option_C"],
            option_d=row["Option_D"],
            correct_answer=row["Correct_Answer"]
        )

        db.add(question)

    db.commit()
    print("Success!")

except Exception as e:
    db.rollback()
    print("Database Error:", e)

finally:
    db.close()