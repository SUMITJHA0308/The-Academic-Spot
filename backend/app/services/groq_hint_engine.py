import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


class GroqHintEngine:

    def __init__(self, question, topic="Physics", subtopic="General"):
        self.question = question
        self.topic = topic
        self.subtopic = subtopic

    def generate_hint(self, level: int):

        # ==========================
        # LEVEL BASED INSTRUCTION
        # ==========================

        if level == 1:

            instruction = """
LEVEL 1 – META-COGNITIVE HINT

Purpose:
Help the student THINK about the problem.

Include:
Observation:
Identify important quantities or information given in the question.

Thinking Direction:
Tell the student what to analyze or focus on.

Strategy:
Suggest what type of relationship or reasoning might help.

Rules:
• Do NOT reveal formula
• Do NOT reveal concept name
• Do NOT solve the problem
"""

        elif level == 2:

            instruction = """
LEVEL 2 – CONCEPTUAL HINT

Purpose:
Help the student identify the correct physics concept.

Include:
Relevant Concept:
Name the chapter or principle.

Key Formula:
Write the formula used.

Concept Explanation:
Explain briefly why the formula applies.

Rules:
• Do NOT substitute numerical values
• Do NOT compute the final answer
"""

        elif level == 3:

            instruction = """
LEVEL 3 – PROCEDURAL HINT

Purpose:
Guide the student through the solving approach.

Include:
Step 1:
Identify given quantities.

Step 2:
Select correct formula.

Step 3:
Explain substitution process.

Step 4:
Explain simplification method.

Optional:
Suggest a useful diagram.

Rules:
• Do NOT compute final numeric answer
"""

        else:
            return "Invalid hint level"

        # ==========================
        # MASTER PROMPT
        # ==========================

        prompt = f"""
You are an expert Physics tutor for MHT-CET and Maharashtra State Board.

Before generating the hint, follow this reasoning internally:

1. Identify the physics topic.
2. Identify the exact concept required.
3. Decide the best hint strategy.

Only after that generate the hint.

------------------------------------

Topic: {self.topic}
Subtopic: {self.subtopic}

------------------------------------

Teaching Style:
Follow solving approach used in:

• Maharashtra State Board Physics textbook
• MTG Objective Physics
• Target Publications MHT-CET

------------------------------------

Important Teaching Rules:

• The hint must be directly related to the question.
• Do NOT introduce unrelated formulas.
• Do NOT reveal final answer.
• Do NOT reveal correct MCQ option.
• Keep explanation short and exam-oriented.

------------------------------------

{instruction}

------------------------------------

Question:
{self.question}

------------------------------------

Generate ONLY the hint for Level {level}.

Maximum length: 70 words.
"""

        # ==========================
        # AI CALL
        # ==========================

        try:

            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a strict physics tutor who gives structured hints without revealing answers."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.2
            )

            return response.choices[0].message.content.strip()

        except Exception as e:

            return f"Hint generation failed: {str(e)}"