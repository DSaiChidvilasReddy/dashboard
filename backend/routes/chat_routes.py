from flask import Blueprint, jsonify, request
from services.chat_service import (
    get_users,
    get_messages,
    add_message,
    create_user
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


@chat_bp.route("/send", methods=["POST"])
def send():
    data = request.json

    result = add_message(
        data["user_id"],
        data["sender"],
        data["text"]
    )

    socketio.emit("new_message", {
        "user_id": data["user_id"],
        "message": {
            "id": result["id"],
            "sender": data["sender"],
            "text": data["text"],
            "timestamp": result["timestamp"]
        },
        "insights": result["insights"]
    })

    return jsonify(result)