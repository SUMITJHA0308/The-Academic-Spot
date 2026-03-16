from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base

class StudentState(Base):
    __tablename__ = "student_states"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))  # ✅ THIS MUST EXIST
    elo_rating = Column(Integer, default=1000)
    current_level = Column(String, default="Easy")
    mistake_counter = Column(Integer, default=0)
