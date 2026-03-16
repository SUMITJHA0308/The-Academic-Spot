from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from fastapi.responses import FileResponse

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak
)

from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

import tempfile

from app.core.database import get_db
from app.models.question import Question
from app.models.student_state import StudentState
from app.models.attempt import Attempt

from app.services.groq_hint_engine import GroqHintEngine
from app.services.solution_engine import GroqSolutionEngine
from app.services.elo_engine import EloAdaptiveEngine


router = APIRouter(tags=["student"])


# ==========================================================
# HEADER + WATERMARK
# ==========================================================

def add_page_design(canvas, doc):

    canvas.saveState()

    width, height = doc.pagesize

    # HEADER
    canvas.setFont("Helvetica-Bold", 14)
    canvas.drawString(40, height - 40, "The Academic Spot")

    # WATERMARK
    canvas.saveState()

    canvas.translate(width/2, height/2)
    canvas.rotate(45)

    canvas.setFont("Helvetica-Bold", 80)
    canvas.setFillColorRGB(0.9,0.9,0.9)

    canvas.drawCentredString(0,0,"THE ACADEMIC SPOT")

    canvas.restoreState()
    canvas.restoreState()


# ==========================================================
# PROFILE
# ==========================================================

@router.get("/profile")
def get_profile(student_id:int, db:Session=Depends(get_db)):

    state = db.query(StudentState).filter(
        StudentState.user_id==student_id
    ).first()

    attempts = db.query(Attempt).filter(
        Attempt.student_id==student_id
    ).all()

    total=len(attempts)
    correct=sum(1 for a in attempts if a.is_correct)

    accuracy=round((correct/total)*100,2) if total else 0

    return {
        "student_id":student_id,
        "elo_rating":state.elo_rating,
        "current_level":state.current_level,
        "total_attempts":total,
        "accuracy":accuracy
    }


# ==========================================================
# NEXT QUESTION
# ==========================================================

@router.get("/next-question")
def next_question(student_id:int, db:Session=Depends(get_db)):

    state=db.query(StudentState).filter(
        StudentState.user_id==student_id
    ).first()

    difficulty=state.current_level

    attempted_ids=[
        a.question_id for a in db.query(Attempt.question_id)
        .filter(Attempt.student_id==student_id).all()
    ]

    question=db.query(Question).filter(
        func.lower(Question.difficulty)==difficulty.lower(),
        ~Question.id.in_(attempted_ids)
    ).order_by(func.random()).first()

    if not question:
        question=db.query(Question).order_by(func.random()).first()

    return {
        "question_id":question.id,
        "question":question.question,
        "difficulty":question.difficulty,
        "options":{
            "A":question.option_a,
            "B":question.option_b,
            "C":question.option_c,
            "D":question.option_d
        }
    }


# ==========================================================
# ATTEMPT
# ==========================================================

@router.post("/attempt")
def submit_attempt(
    student_id:int,
    question_id:int,
    answer:str,
    time_taken:float,
    db:Session=Depends(get_db)
):

    question=db.query(Question).filter(
        Question.id==question_id
    ).first()

    state=db.query(StudentState).filter(
        StudentState.user_id==student_id
    ).first()

    is_correct = answer.upper()==question.correct_answer.upper()

    elo_engine=EloAdaptiveEngine(state,db)

    new_elo,_=elo_engine.update_elo(is_correct,time_taken)

    state.elo_rating=new_elo
    state.current_level=elo_engine.decide_difficulty()

    solution_text=""

    try:

        engine=GroqSolutionEngine(
            question.question,
            {
                "A":question.option_a,
                "B":question.option_b,
                "C":question.option_c,
                "D":question.option_d
            },
            question.correct_answer
        )

        solution_text=engine.generate_solution()

    except:

        solution_text=f"Correct answer is {question.correct_answer}"


    # REMOVE useless lines

    solution_text=solution_text.replace("No diagram needed.","")
    solution_text=solution_text.replace("No formula needed.","")

    attempt=Attempt(

        student_id=student_id,
        question_id=question_id,
        is_correct=is_correct,
        time_taken=time_taken,
        elo_before=state.elo_rating,
        elo_after=new_elo,
        solution=solution_text

    )

    db.add(attempt)
    db.commit()

    return {
        "correct":is_correct,
        "new_elo":new_elo
    }


# ==========================================================
# HINT
# ==========================================================

@router.post("/hint")
def get_hint(question_id:int,level:int=1,db:Session=Depends(get_db)):

    q=db.query(Question).filter(
        Question.id==question_id
    ).first()

    engine=GroqHintEngine(q.question)

    return {"hint":engine.generate_hint(level)}


# ==========================================================
# PDF REPORT
# ==========================================================

@router.get("/generate-report")
def generate_report(student_id:int, db:Session=Depends(get_db)):

    attempts=db.query(Attempt).filter(
        Attempt.student_id==student_id
    ).all()

    questions=db.query(Question).all()

    question_map={q.id:q for q in questions}

    styles=getSampleStyleSheet()

    elements=[]

    # =========================
    # SUMMARY PAGE
    # =========================

    state=db.query(StudentState).filter(
        StudentState.user_id==student_id
    ).first()

    total=len(attempts)
    correct=sum(1 for a in attempts if a.is_correct)
    wrong=total-correct

    accuracy=round((correct/total)*100,2)

    elements.append(
        Paragraph("Academic Spot - Performance Report",styles["Title"])
    )

    elements.append(Spacer(1,20))

    summary_data=[

    ["Student ID",student_id],
    ["ELO Score",state.elo_rating],
    ["Total Questions",total],
    ["Correct",correct],
    ["Wrong",wrong],
    ["Accuracy",f"{accuracy}%"]

    ]

    table=Table(summary_data,colWidths=[200,300])

    table.setStyle(TableStyle([

    ("BACKGROUND",(0,0),(0,-1),colors.HexColor("#2563eb")),
    ("TEXTCOLOR",(0,0),(0,-1),colors.white),

    ("GRID",(0,0),(-1,-1),1,colors.lightgrey)

    ]))

    elements.append(table)

    elements.append(PageBreak())



    # =========================
    # QUESTION PAGES
    # =========================

    for i,attempt in enumerate(attempts,start=1):

        q=question_map.get(attempt.question_id)

        difficulty=q.difficulty.lower()

        if difficulty=="easy":
            color="green"
        elif difficulty=="medium":
            color="orange"
        else:
            color="red"

        result="Correct" if attempt.is_correct else "Wrong"

        solution=(attempt.solution or "").replace("\n","<br/>")

        header=Table([[

        Paragraph(f"<b>Question {i}</b>",styles["Heading2"]),

        Paragraph(
        f"<font color='{color}'><b>{q.difficulty.upper()}</b></font>",
        styles["Heading3"]
        )

        ]],colWidths=[380,100])

        header.setStyle(TableStyle([
        ("ALIGN",(1,0),(1,0),"RIGHT")
        ]))

        elements.append(header)

        elements.append(Spacer(1,10))

        elements.append(
        Paragraph(f"<b>{q.question}</b>",styles["BodyText"])
        )

        elements.append(Spacer(1,20))


        # ANSWER BOX

        ans_table=Table([

        ["Correct Answer",q.correct_answer],
        ["Result",result]

        ],colWidths=[200,280])

        ans_table.setStyle(TableStyle([

        ("BACKGROUND",(0,0),(0,-1),colors.HexColor("#2563eb")),
        ("TEXTCOLOR",(0,0),(0,-1),colors.white),

        ("BOX",(0,0),(-1,-1),1,colors.lightgrey)

        ]))

        elements.append(ans_table)

        elements.append(Spacer(1,20))


        # SOLUTION

        elements.append(
        Paragraph("<b>Solution</b>",styles["Heading3"])
        )

        elements.append(Spacer(1,10))

        elements.append(
        Paragraph(solution,styles["BodyText"])
        )

        elements.append(PageBreak())


    temp=tempfile.NamedTemporaryFile(delete=False,suffix=".pdf")

    doc=SimpleDocTemplate(temp.name)

    doc.build(
    elements,
    onFirstPage=add_page_design,
    onLaterPages=add_page_design
    )

    return FileResponse( 
    temp.name,
    media_type="application/pdf",
    filename="quiz_report.pdf"
    )

