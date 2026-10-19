from sqlmodel import create_engine, SQLModel
import os

DB_URL = os.getenv("DATABASE_URL", "sqlite:///./uthao.db")
engine = create_engine(DB_URL, connect_args={"check_same_thread": False} if DB_URL.startswith("sqlite") else {})


def init_db():
    from models import User, Order
    SQLModel.metadata.create_all(engine)
