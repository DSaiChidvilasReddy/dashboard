from database import SessionLocal
from models.models import User, Message
from datetime import datetime
from services.ai_service import analyze_conversation


def get_users():
    db = SessionLocal()

    try:
        users = db.query(User).all()
        result = []

        for u in users:
            last_msg = db.query(Message)\
                .filter(Message.user_id == u.id)\
                .order_by(Message.id.desc())\
                .first()

            result.append({
                "id": u.id,
                "name": u.name,
                "lastMessage": last_msg.text if last_msg else "",
                "emotion": u.emotion or "confused",
                "avatar": "👤"
            })

        return result

    finally:
        db.close()


def create_user(name):
    db = SessionLocal()

    try:
        cleaned_name = (name or "").strip()

        if not cleaned_name:
            raise ValueError("Customer name required")

        existing = db.query(User)\
            .filter(User.name == cleaned_name)\
            .first()

        if existing:
            return {
                "id": existing.id,
                "name": existing.name,
                "emotion": existing.emotion or "confused",
                "avatar": "👤"
            }

        new_user = User(
            name=cleaned_name,
            emotion="confused"
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            "id": new_user.id,
            "name": new_user.name,
            "emotion": new_user.emotion,
            "lastMessage": "",
            "avatar": "👤"
        }

    finally:
        db.close()


def get_messages(user_id):
    db = SessionLocal()

    try:
        messages = db.query(Message)\
            .filter(Message.user_id == user_id)\
            .order_by(Message.id.asc())\
            .all()

        result = []

        for m in messages:
            raw_sender = (m.sender or "").strip().lower()

            if raw_sender in ["agent", "support", "admin"]:
                sender = "agent"
            else:
                sender = "customer"

            result.append({
                "id": m.id,
                "user_id": m.user_id,
                "sender": sender,
                "text": m.text,
                "timestamp": m.timestamp
            })

        return result

    finally:
        db.close()


# FAST MESSAGE SAVE
def add_message(user_id, sender, text):
    db = SessionLocal()

    try:
        new_msg = Message(
            user_id=user_id,
            sender=sender.lower(),
            text=text,
            timestamp=datetime.now().strftime("%H:%M")
        )

        db.add(new_msg)
        db.commit()
        db.refresh(new_msg)

        return {
            "status": "message saved",
            "id": new_msg.id,
            "timestamp": new_msg.timestamp
        }

    finally:
        db.close()


# BACKGROUND AI
def run_ai_analysis(user_id, features=None):
    db = SessionLocal()

    try:
        messages = db.query(Message)\
            .filter(Message.user_id == user_id)\
            .order_by(Message.id.asc())\
            .all()

        conversation = [
            {
                "sender": m.sender,
                "text": m.text
            }
            for m in messages
        ]

        ai_result = analyze_conversation(
            conversation,
            features
        )

        user = db.query(User)\
            .filter(User.id == user_id)\
            .first()

        if user:
            user.emotion = ai_result["emotion"]
            db.commit()

        return ai_result

    finally:
        db.close()