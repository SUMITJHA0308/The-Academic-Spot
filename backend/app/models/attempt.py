from sqlalchemy import Column, Integer, Boolean, Float, Text
from app.core.database import Base


class Attempt(Base):

    __tablename__ = "attempts"

    id = Column(Integer, primary_key=True, index=True)

    # student जिसने question attempt किया
    student_id = Column(Integer, index=True)

    # कौन सा question attempt हुआ
    question_id = Column(Integer, index=True)

    # सही या गलत
    is_correct = Column(Boolean)

    # question solve करने में लगा time (seconds)
    time_taken = Column(Float)

    # ELO difficulty system
    elo_before = Column(Float)
    elo_after = Column(Float)

    # solution explanation
    solution = Column(Text)