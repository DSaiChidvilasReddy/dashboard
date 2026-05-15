from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv
from urllib.parse import quote_plus  # 🔥 IMPORTANT

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

# 🔥 ENCODE PASSWORD (handles @, !, #, etc.)
encoded_password = quote_plus(DB_PASSWORD)

# ✅ SAFE CONNECTION STRING
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True
    )

    # 🔥 TEST CONNECTION
    with engine.connect() as conn:
        print("✅ Connected to MySQL successfully")

except Exception as e:
    print("❌ Database connection failed:", str(e))
    raise e


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()