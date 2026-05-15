from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def list_models():
    try:
        models = client.models.list()

        print("✅ Available Groq Models:\n")

        for m in models.data:
            print(f"- {m.id}")

    except Exception as e:
        print("❌ Error:", e)


if __name__ == "__main__":
    list_models()