import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


class TopicDetector:

    def __init__(self):
        pass

    def detect_topic(self, question: str):

        prompt = f"""
You are a Physics expert for MHT-CET preparation.

Identify the MOST relevant physics topic of the following question.

Follow Maharashtra State Board + MHT-CET syllabus.

Allowed topics examples:
• Kinematics
• Laws of Motion
• Work Energy Power
• Rotational Motion
• Gravitation
• Oscillations
• Waves
• Electrostatics
• Current Electricity
• Magnetism
• Optics
• Modern Physics

Question:
{question}

Return ONLY the topic name.
No explanation.
"""

        try:

            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert physics classifier."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0
            )

            topic = response.choices[0].message.content.strip()

            return topic

        except Exception as e:

            return "Unknown Topic"