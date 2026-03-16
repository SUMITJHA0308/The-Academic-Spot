import random
from app.models.question import Question


class EloAdaptiveEngine:

    def __init__(self, state, db):

        self.state = state
        self.db = db

        self.student_elo = state.elo_rating
        self.current_level = state.current_level
        self.mistake_counter = state.mistake_counter


    # -----------------------------------------
    # Difficulty Decide
    # -----------------------------------------
    def decide_difficulty(self):

        if self.student_elo <= 1035:
            self.current_level = "Easy"

        elif self.student_elo <= 1090:
            self.current_level = "Medium"

        else:
            self.current_level = "Hard"

        return self.current_level


    # -----------------------------------------
    # ELO UPDATE
    # -----------------------------------------
    def update_elo(self, is_correct, time_taken):

        if is_correct:
            self.student_elo += 15
            self.mistake_counter = 0

        else:
            self.student_elo -= 7
            self.mistake_counter += 1

        # rating negative ना हो
        if self.student_elo < 0:
            self.student_elo = 0

        self.student_elo = round(self.student_elo, 2)

        return self.student_elo, self.mistake_counter


    # -----------------------------------------
    # STUDENT LEVEL CLASSIFICATION
    # -----------------------------------------
    def classify_student(self):

        if self.student_elo >= 1150:
            return "Advanced"

        elif self.student_elo >= 1050:
            return "Intermediate"

        else:
            return "Learner"