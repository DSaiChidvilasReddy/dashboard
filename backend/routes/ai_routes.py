from flask import Blueprint, request, jsonify

from services.ai_service import analyze_conversation
from services.impact_service import generate_impact_summary

ai_bp = Blueprint("ai", __name__)


@ai_bp.route("/chat", methods=["POST"])
def chat():

    data = request.json

    conversation = data.get("conversation", [])
    features = data.get("features", [])

    insights = analyze_conversation(
        conversation,
        features
    )

    return jsonify({
        "reply": "Thankyou for your help",
        "insights": insights
    })


@ai_bp.route("/impact-summary", methods=["POST"])
def impact_summary():

    data = request.json

    features = data.get("features", [])

    summary = generate_impact_summary(features)

    return jsonify({
        "summary": summary
    })