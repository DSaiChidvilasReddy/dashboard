import pymysql
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from urllib.parse import quote_plus

from models.models import Base, User, Message
from services.ai_service import analyze_conversation

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_NAME = os.getenv("DB_NAME")


# 🔥 ENCODE PASSWORD (VERY IMPORTANT)
ENCODED_PASSWORD = quote_plus(DB_PASSWORD)


# ✅ CREATE ENGINE AFTER DB EXISTS
def get_engine(with_db=True):
    if with_db:
        url = f"mysql+pymysql://{DB_USER}:{ENCODED_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    else:
        url = f"mysql+pymysql://{DB_USER}:{ENCODED_PASSWORD}@{DB_HOST}:{DB_PORT}/"

    return create_engine(url)


# 🔥 CHECK DB EXISTS
def database_exists():
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )

        with connection.cursor() as cursor:
            cursor.execute("SHOW DATABASES")
            dbs = [db[0] for db in cursor.fetchall()]

        connection.close()
        return DB_NAME in dbs

    except Exception as e:
        print("❌ Error checking database:", e)
        return False


# 🔥 CREATE DB
def create_database():
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )

        with connection.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE {DB_NAME}")

        connection.close()
        print(f"✅ Database '{DB_NAME}' created")

    except Exception as e:
        print("❌ Error creating database:", e)
        exit()


# 🔥 DROP DB
def drop_database():
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )

        with connection.cursor() as cursor:
            cursor.execute(f"DROP DATABASE {DB_NAME}")

        connection.close()
        print(f"🗑️ Database '{DB_NAME}' deleted")

    except Exception as e:
        print("❌ Error deleting database:", e)
        exit()


# 🔥 INSERT INDIAN DEMO DATA
def seed_data(SessionLocal):
    db = SessionLocal()

    try:
        users = [
            User(name="Aarav Sharma"),
            User(name="Priya Reddy"),
            User(name="Rahul Verma"),
        ]

        db.add_all(users)
        db.commit()

        messages = [

            # Aarav → frustrated
            Message(user_id=users[0].id, sender="customer", text="My order is delayed again!", timestamp="10:00"),
            Message(user_id=users[0].id, sender="agent", text="Sorry for the inconvenience.", timestamp="10:01"),
            Message(user_id=users[0].id, sender="customer", text="This is very frustrating", timestamp="10:02"),

            # Priya → positive
            Message(user_id=users[1].id, sender="customer", text="Thanks for the quick help!", timestamp="11:00"),
            Message(user_id=users[1].id, sender="agent", text="Glad to assist you!", timestamp="11:01"),

            # Rahul → confused
            Message(user_id=users[2].id, sender="customer", text="How does this feature work?", timestamp="12:00"),
            Message(user_id=users[2].id, sender="customer", text="I don't understand this", timestamp="12:01"),
            Message(user_id=users[2].id, sender="agent", text="Let me explain step by step.", timestamp="12:02"),
        ]

        db.add_all(messages)
        db.commit()

        # 🔥 RUN AI
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

        print("✅ Demo data inserted successfully")

    except Exception as e:
        print("❌ Error inserting data:", e)

    finally:
        db.close()


# 🔥 MAIN FLOW
def main():
    exists = database_exists()

    if exists:
        print(f"⚠️ Database '{DB_NAME}' already exists")

        choice = input("👉 Choose option:\n1. Use existing DB\n2. Rewrite DB\nEnter (1/2): ")

        if choice == "2":
            drop_database()
            create_database()
        else:
            print("✅ Using existing database")
            return
    else:
        create_database()

    # ✅ CREATE ENGINE AFTER DB EXISTS
    engine = get_engine(with_db=True)

    # ✅ CREATE SESSION
    SessionLocal = sessionmaker(bind=engine)

    # 🔥 CREATE TABLES
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created")

    # 🔥 SEED DATA
    seed_data(SessionLocal)


if __name__ == "__main__":
    main()