from groq import Groq
import os
from dotenv import load_dotenv
from utils.parser import safe_parse_json

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"


def analyze_conversation(conversation, features=None):

    # FEATURE FLAGS
    feature_map = {f.get("name"): f.get("enabled") for f in features} if features else {}

    sentiment_enabled = feature_map.get("Sentiment Detection", True)
    keywords_enabled = feature_map.get("Keyword Extraction", True)
    suggestions_enabled = feature_map.get("Smart Suggestions", True)
    summarization_enabled = feature_map.get("Auto Summarization", True)

    # SAFETY
    if not conversation or len(conversation) == 0:
        return fallback("No conversation provided")

    # LIMIT CONTEXT
    conversation = conversation[-12:]

    # SPLIT CONTEXT
    recent_msgs = conversation[-5:]
    older_msgs = conversation[:-5]

    recent_text = "\n".join(
        [f"{m.get('sender', 'customer')}: {m.get('text', '')}" for m in recent_msgs]
    )

    older_text = "\n".join(
        [f"{m.get('sender', 'customer')}: {m.get('text', '')}" for m in older_msgs]
    )

    prompt = f"""
You are an enterprise AI Customer Support Intelligence Engine.

Your task is to analyze a customer support conversation and return STRICT VALID JSON ONLY.

=================================================
STRICT OUTPUT RULES
=================================================

- Return ONLY valid JSON
- No markdown
- No explanations outside JSON
- No comments
- No extra text

Emotion MUST be EXACTLY ONE of:
["frustrated", "confused", "positive"]

Never return:
- multiple emotions
- combined labels
- pipe separated labels
- comma separated labels

If uncertain:
choose the closest single valid emotion.

=================================================
PRIMARY ANALYSIS RULE
=================================================

The PRIMARY emotional signal MUST come from CUSTOMER messages.

Customer messages determine emotion.

Agent messages are context only.

Agent politeness, apologies, or reassurance MUST NOT incorrectly create positive emotion.

Example:
Agent: "Sorry for the inconvenience"
Customer still upset
→ emotion = frustrated

=================================================
EMOTION DEFINITIONS
=================================================

FRUSTRATED:
Customer shows:
- complaints
- dissatisfaction
- repeated unresolved issues
- negative tone
- anger
- urgency
- disappointment
- demanding behavior
- blame
- implied dissatisfaction

Examples:
- "Still not fixed"
- "This is ridiculous"
- "Why is this taking so long"
- sarcastic frustration

CONFUSED:
Customer shows:
- questions
- doubts
- clarification seeking
- uncertainty
- lack of understanding
- guidance requests

WITHOUT strong complaint tone.

Examples:
- "How do I do this?"
- "Can you explain?"
- "I don't understand"
- "What does this mean?"

IMPORTANT:
Question asking alone is NOT frustration.

POSITIVE:
Customer shows:
- satisfaction
- gratitude
- issue resolution
- acceptance
- confirmation

Examples:
- "Thanks"
- "That worked"
- "Got it"
- "Issue resolved"

=================================================
SARCASM HANDLING
=================================================

Detect sarcasm and implied negative sentiment.

Example:
"Wow amazing service, waiting for 3 days"

This is FRUSTRATED, not positive.

=================================================
CONFIDENCE RULES
=================================================

Confidence MUST be based on evidence quality:

90–100:
clear repeated evidence

70–89:
strong evidence

50–69:
mixed signals

below 50:
uncertain / weak evidence

Never inflate confidence without evidence.

=================================================
RECENCY PRIORITY
=================================================

Recent messages have highest priority.

Older messages are context only.

If conversation improves:
frustrated → resolved
Return positive.

If unresolved issue repeats:
increase frustration confidence.

=================================================
KEYWORD RULES
=================================================

Extract ONLY meaningful actionable keywords.

Allowed:
- issue entities
- product/service references
- operational nouns

Good:
["refund", "delivery", "payment failure"]

Bad:
["help", "issue", "problem"]

Rules:
- max 5 keywords
- no generic filler words
- based mainly on recent customer messages

=================================================
SUGGESTED ACTION RULES
=================================================

Suggested actions MUST:

- be practical
- be executable
- be relevant to CURRENT state
- consider BOTH customer AND agent actions
- avoid repeating actions already done

VERY IMPORTANT:
Each suggestion MUST be maximum 3 words.

GOOD:
["Check refund status"]
["Provide ETA"]
["Escalate billing"]

BAD:
["Apologize for inconvenience and reassure customer"]

Return max 4 actions.

=================================================
REASON QUALITY
=================================================

Reason must be specific.

Do NOT use repetitive generic explanations.

Bad:
"Customer seems frustrated"

Good:
"Customer repeatedly reports unresolved delivery delay in recent messages, showing dissatisfaction rather than simple clarification."

Reason should explain:
- why emotion was chosen
- what evidence supports it
- why other emotions were less accurate

=================================================
CONTEXT
=================================================

OLDER CONTEXT:
{older_text}

RECENT CONVERSATION:
{recent_text}

=================================================
RETURN JSON FORMAT
=================================================

{{
  "emotion": "frustrated",
  "confidence": 84,
  "keywords": ["delivery", "refund"],
  "suggestedActions": [
    "Check delivery status",
    "Provide ETA",
    "Escalate support"
  ],
  "reason": "Customer repeatedly mentions unresolved delivery delay in recent messages, showing dissatisfaction rather than simple confusion."
}}
"""

    try:
        res = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.15
        )

        text = res.choices[0].message.content
        data = safe_parse_json(text)

        raw_emotion = str(data.get("emotion", "")).lower()

        if "|" in raw_emotion:
            raw_emotion = raw_emotion.split("|")[0].strip()

        if "," in raw_emotion:
            raw_emotion = raw_emotion.split(",")[0].strip()

        emotion = normalize(raw_emotion)

        confidence = data.get("confidence", 70)

        try:
            confidence = int(confidence)
        except:
            confidence = 70

        confidence = max(0, min(100, confidence))

        keywords = data.get("keywords", [])
        if not isinstance(keywords, list):
            keywords = []

        keywords = [
            str(k).strip()
            for k in keywords
            if str(k).strip()
        ][:5]

        suggested_actions = data.get("suggestedActions", [])
        if not isinstance(suggested_actions, list):
            suggested_actions = []

        cleaned_actions = []

        for action in suggested_actions:
            action = str(action).strip()

            if not action:
                continue

            if len(action.split()) <= 3:
                cleaned_actions.append(action)

        suggested_actions = cleaned_actions[:4]

        result = {
            "emotion": emotion,
            "confidence": confidence,
            "keywords": keywords,
            "suggestedActions": suggested_actions,
            "reason": str(data.get("reason", "")).strip()
        }

        if not sentiment_enabled:
            result["emotion"] = "N/A"
            result["confidence"] = 0

        if not keywords_enabled:
            result["keywords"] = []

        if not suggestions_enabled:
            result["suggestedActions"] = []

        if not summarization_enabled:
            result["reason"] = ""

        return result

    except Exception as e:
        print("AI ERROR:", str(e))
        return fallback(str(e))


def normalize(e):
    if not e:
        return "confused"

    e = e.lower().strip()

    if e in ["angry", "negative", "annoyed", "upset"]:
        return "frustrated"

    if e in ["question", "unclear", "unsure", "confusion"]:
        return "confused"

    if e in ["happy", "positive", "resolved", "satisfied"]:
        return "positive"

    if e not in ["frustrated", "confused", "positive"]:
        return "confused"

    return e


def fallback(reason="No AI response"):
    return {
        "emotion": "confused",
        "confidence": 50,
        "keywords": [],
        "suggestedActions": [],
        "reason": reason
    }