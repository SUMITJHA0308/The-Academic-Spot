import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class AIHintEngine:

    def __init__(self, question_text):
        self.question = question_text

    def generate_hint(self, level: int):

        system_prompt = """
You are an educational AI tutor.
You must NOT reveal the final answer.
You must NOT solve completely.
You only guide the student step by step.
Keep hints short (2-3 sentences).
        """

        if level == 1:
            instruction = "Give a conceptual hint only. Do not mention formulas."

        elif level == 2:
            instruction = "Give formula or method hint. Do not compute."

        elif level == 3:
            instruction = "Give structured solving approach without revealing the final answer."

        else:
            return "Invalid hint level."

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Question: {self.question}\n\n{instruction}"}
            ],
            max_tokens=200,
            temperature=0.4
        )

        return response.choices[0].message.content
