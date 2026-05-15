import json
import re

def safe_parse_json(text):
    try:
        return json.loads(text)
    except:
        try:
            match = re.search(r"\{.*\}", text, re.DOTALL)
            if match:
                return json.loads(match.group())
        except:
            pass

    return {
        "sentiment": "confused",
        "confidence": 0,
        "keywords": [],
        "reason": "Parsing failed",
        "suggestions": []
    }