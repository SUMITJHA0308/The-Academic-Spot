from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True)
    chapter = Column(String)  
    subject = Column(String)
    difficulty = Column(String)
    question = Column(String)
    option_a = Column(String)
    option_b = Column(String)
    option_c = Column(String)
    option_d = Column(String)
    correct_answer = Column(String)
    topic = Column(String)  
   