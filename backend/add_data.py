from database import SessionLocal, Base, engine
from models.models import User, Message
from services.ai_service import analyze_conversation

# ✅ Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    if db.query(User).count() == 0:

        # 👤 Users (NO last_message)
        user1 = User(name="John Smith")
        user2 = User(name="Sarah Johnson")
        user3 = User(name="Mike Chen")

        db.add_all([user1, user2, user3])
        db.commit()

        # 💬 Conversations
        messages = [

            # John → frustrated
            Message(user_id=user1.id, sender="customer", text="Where is my order?", timestamp="10:00"),
            Message(user_id=user1.id, sender="agent", text="Let me check that for you.", timestamp="10:01"),
            Message(user_id=user1.id, sender="customer", text="It’s been 5 days already!", timestamp="10:02"),

            # Sarah → positive
            Message(user_id=user2.id, sender="customer", text="Thanks for your help!", timestamp="11:00"),
            Message(user_id=user2.id, sender="agent", text="Happy to help!", timestamp="11:01"),

            # Mike → confused
            Message(user_id=user3.id, sender="customer", text="How does this work?", timestamp="12:00"),
            Message(user_id=user3.id, sender="customer", text="I am very confused", timestamp="12:00"),
            Message(user_id=user3.id, sender="agent", text="Let me explain step by step.", timestamp="12:01"),
        ]

        db.add_all(messages)
        db.commit()

        # 🔥 RUN AI FOR EACH USER
        users = db.query(User).all()

        for user in users:
            user_msgs = db.query(Message)\
                .filter(Message.user_id == user.id)\
                .order_by(Message.id.asc())\
                .all()

            conversation = [
                {"sender": m.sender, "text": m.text}
                for m in user_msgs
            ]

            ai_result = analyze_conversation(conversation)

            user.emotion = ai_result["emotion"]

        db.commit()

        print("✅ Users + Conversations + AI emotions added")

    else:
        print("ℹ️ Data already exists")

finally:
    db.close()