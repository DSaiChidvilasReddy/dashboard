from groq import Groq
import os
from dotenv import load_dotenv
import re
import json

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL = "llama-3.3-70b-versatile"


# 🔍 AUTO LANGUAGE DETECTION
def detect_language(text):
    try:
        prompt = f"""
Detect the language of the following text.

Return ONLY the language name.

Text:
{text}
"""

        res = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )

        return res.choices[0].message.content.strip()

    except Exception as e:
        print("Detection error:", e)
        return "English"


# 🌐 LANGUAGE SUGGESTIONS
def get_language_suggestions(query):
    try:
        if not query or not query.strip():
            return []

        prompt = f"""
You are a language assistant.

A user is typing a target language name for translation.

Input:
"{query}"

Task:
Return the 5 most relevant valid language names matching or closest to the input.

Rules:
- Fix spelling mistakes
- Include nearest related matches
- Return ONLY valid JSON array
- No explanation
- Example:
["Telugu", "Tamil", "Thai"]
"""

        res = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )

        text = res.choices[0].message.content.strip()

        suggestions = json.loads(text)

        if isinstance(suggestions, list):
            return suggestions[:5]

        return []

    except Exception as e:
        print("Suggestion error:", e)
        return []


# 🔧 NORMALIZE LANGUAGE NAME
def normalize_language_name(language):
    try:
        if not language or not language.strip():
            return "English"

        prompt = f"""
You are a language normalization assistant.

Input:
"{language}"

Task:
Convert this into the correct valid language name.

Rules:
- Fix spelling mistakes
- Return ONLY the corrected language name
- No explanation

Examples:
telgu -> Telugu
spnish -> Spanish
hindii -> Hindi
"""

        res = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )

        corrected = res.choices[0].message.content.strip()

        return corrected if corrected else language

    except Exception as e:
        print("Normalization error:", e)
        return language


# 🌍 CONTEXT-AWARE MESSAGE-BY-MESSAGE TRANSLATION
def translate_messages(messages, target_language):
    try:
        if not messages:
            return []

        target_language = normalize_language_name(target_language)

        structured_messages = []

        for i, msg in enumerate(messages, start=1):
            structured_messages.append(
                f"[MSG_{i}] {msg.get('text', '')}"
            )

        combined = "\n".join(structured_messages)

        prompt = f"""
You are a professional translator.

Translate the following chat messages into {target_language}.

STRICT RULES:
- Preserve meaning exactly
- Use natural grammar
- Do NOT add labels like "customer:" or "agent:"
- Do NOT add explanations
- Treat each [MSG_X] as a separate individual message
- Preserve ALL [MSG_X] markers exactly
- Translate ONLY the message content after each marker
- Use the full conversation context for accurate meaning

TEXT:
{combined}
"""

        res = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )

        raw_output = res.choices[0].message.content.strip()

        translated_map = {}

        matches = re.findall(
            r"\[MSG_(\d+)\]\s*(.*?)(?=\[MSG_\d+\]|\Z)",
            raw_output,
            flags=re.DOTALL
        )

        for msg_num, translated_text in matches:
            translated_map[int(msg_num)] = translated_text.strip()

        translated = []

        for i, msg in enumerate(messages, start=1):
            text = translated_map.get(i, msg.get("text"))

            text = re.sub(
                r"^(customer|agent)\s*:\s*",
                "",
                text,
                flags=re.IGNORECASE
            )

            translated.append({
                "id": msg.get("id"),
                "sender": msg.get("sender"),
                "timestamp": msg.get("timestamp"),
                "text": text.strip()
            })

        return translated

    except Exception as e:
        print("Translation error:", e)
        return messages