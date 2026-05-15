from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL = "llama-3.1-8b-instant"


def generate_impact_summary(features):
    try:
        disabled_features = [
            f["name"]
            for f in features
            if not f.get("enabled")
        ]

        # ALL FEATURES ENABLED
        if len(disabled_features) == 0:
            return (
                "All AI-powered capabilities are active. "
                "The platform is operating at full efficiency with optimized automation and customer support intelligence."
            )

        prompt = f"""
You are an Enterprise AI System Impact Analyst.

The following platform features are currently disabled:
{", ".join(disabled_features)}

Your task:
Generate a concise professional impact summary.

RULES:
- Summary MUST be concise
- Minimum 2 lines
- Maximum 4 lines
- Maximum 30 words
- Keep sentences short and clear
- Focus only on practical operational impact
- Mention efficiency, workflow, or user experience impact where relevant
- Maintain professional SaaS product tone
- DO NOT use bullet points
- DO NOT use markdown
- DO NOT write long paragraphs
- DO NOT use corporate report style wording
- DO NOT mention "feature list"
- DO NOT mention JSON
- Return ONLY the summary
"""

        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2
        )

        summary = response.choices[0].message.content.strip()

        return summary

    except Exception as e:
        print("Impact Summary Error:", str(e))

        return (
            "Some AI capabilities are currently unavailable. "
            "Operational efficiency or customer experience may be affected."
        )