from flask import Blueprint, request, jsonify
from services.translation_service import (
    translate_messages,
    detect_language,
    get_language_suggestions,
    normalize_language_name
)

translation_bp = Blueprint("translation", __name__)


@translation_bp.route("/language-suggestions", methods=["POST"])
def language_suggestions():
    try:
        data = request.json or {}
        query = (data.get("query") or "").strip()

        if not query:
            return jsonify({
                "suggestions": []
            })

        suggestions = get_language_suggestions(query)

        return jsonify({
            "suggestions": suggestions
        })

    except Exception as e:
        print("❌ Suggestion API Error:", str(e))

        return jsonify({
            "suggestions": [],
            "error": str(e)
        }), 500


@translation_bp.route("/normalize-language", methods=["POST"])
def normalize_language():
    try:
        data = request.json or {}
        language = (data.get("language") or "").strip()

        corrected = normalize_language_name(language)

        return jsonify({
            "language": corrected
        })

    except Exception as e:
        print("❌ Normalize API Error:", str(e))

        return jsonify({
            "language": language,
            "error": str(e)
        }), 500


@translation_bp.route("/translate", methods=["POST"])
def translate_messages_api():
    try:
        data = request.json or {}

        messages = data.get("messages", [])
        target_language = (data.get("language") or "").strip()

        if not messages:
            return jsonify({
                "language_used": target_language or "N/A",
                "messages": []
            })

        if not target_language or len(target_language) < 2:
            sample_text = " ".join([
                m.get("text", "") for m in messages[:3]
            ]).strip()

            if sample_text:
                target_language = detect_language(sample_text)
            else:
                target_language = "English"

        corrected_language = normalize_language_name(
            target_language
        )

        translated_messages = translate_messages(
            messages,
            corrected_language
        )

        return jsonify({
            "language_used": corrected_language,
            "messages": translated_messages
        })

    except Exception as e:
        print("❌ Translation API Error:", str(e))

        return jsonify({
            "language_used": "error",
            "messages": data.get("messages", []),
            "error": str(e)
        }), 500