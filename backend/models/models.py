from sqlalchemy import Column, Integer, String, Text, ForeignKey
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    emotion = Column(String(50))   # ✅ keep only useful fields


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    sender = Column(String(20))
    text = Column(Text)
    timestamp = Column(String(20))