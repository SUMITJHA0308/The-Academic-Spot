import os
from groq import Groq


class GroqSolutionEngine:

    def __init__(self, question, options, answer):

        self.question = question
        self.options = options
        self.answer = answer

        self.client = Groq(
            api_key=os.getenv("GROQ_API_KEY")
        )

    def generate_solution(self):

        prompt = f"""
You are an expert Physics teacher preparing students for MHT-CET.

Explain the MCQ in VERY SIMPLE language so that even an 8th standard student can understand.

Follow explanation style used in:

• Maharashtra State Board Physics
• MTG Objective Physics
• Target Publications MHT-CET books

Question:
{self.question}

Options:
A. {self.options['A']}
B. {self.options['B']}
C. {self.options['C']}
D. {self.options['D']}

Correct Answer: {self.answer}

Explain using the structure below:

Concept:
Explain the basic idea behind the question in simple words.

Formula:
Write the formula needed (if applicable).

Step 1:
Explain the first step.

Step 2:
Explain the next step.

Step 3:
Continue solving.

Final Answer:
Explain clearly why option {self.answer} is correct.

Why other options are wrong:
Briefly explain why the remaining options are incorrect.

Diagram (if helpful):
Describe a simple diagram the student should draw to understand the problem.

Rules:
• Keep explanation short and clear
• Maximum 120 words
• Do not use complex language
"""

        try:

            response = self.client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a friendly physics teacher explaining concepts simply."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3
            )

            return response.choices[0].message.content.strip()

        except Exception as e:

            return f"Solution generation failed: {str(e)}"