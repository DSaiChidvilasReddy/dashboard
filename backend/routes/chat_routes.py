from flask import Blueprint, jsonify, request
from services.chat_service import (
    get_users,
    get_messages,
    add_message,
    create_user,
    run_ai_analysis
)
from extensions import socketio

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/users", methods=["GET"])
def users():
    return jsonify(get_users())


@chat_bp.route("/users", methods=["POST"])
def add_user():
    data = request.json

    user = create_user(data.get("name"))

    return jsonify(user)


@chat_bp.route("/messages/<int:user_id>", methods=["GET"])
def messages(user_id):
    return jsonify(get_messages(user_id))


def background_ai_analysis(user_id, features):
    try:
        ai_result = run_ai_analysis(
            user_id,
            features
        )

        socketio.emit("insights_update", {
            "user_id": user_id,
            "insights": ai_result
        })

    except Exception as e:
        print("Background AI Error:", str(e))


@chat_bp.route("/send", methods=["POST"])
def send():
    data = request.json

    user_id = data["user_id"]
    sender = data["sender"]
    text = data["text"]
    features = data.get("features", None)

    # FAST SAVE
    result = add_message(
        user_id,
        sender,
        text
    )

    # INSTANT MESSAGE EMIT
    socketio.emit("new_message", {
        "user_id": user_id,
        "message": {
            "id": result["id"],
            "sender": sender,
            "text": text,
            "timestamp": result["timestamp"]
        },
        "insights": None
    })

    # BACKGROUND AI
    socketio.start_background_task(
        background_ai_analysis,
        user_id,
        features
    )

    return jsonify(result)