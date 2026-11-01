from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from pathlib import Path

# Load .env if present
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parents[4] / ".env"
    load_dotenv(dotenv_path=env_path)
except Exception:
    pass

DATABASE_URL = os.environ.get(
    "DATABASE_URL", 
    "sqlite:///khulna.db"
)

# Normalize cloud-managed postgres URL for SQLAlchemy + psycopg
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgresql+"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

# Resolve relative sqlite URL to root project directory
if DATABASE_URL.startswith("sqlite:///") and not (DATABASE_URL.startswith("sqlite:////") or ":" in DATABASE_URL[10:13]):
    rel_path = DATABASE_URL.replace("sqlite:///", "")
    if not os.path.isabs(rel_path):
        root_dir = Path(__file__).resolve().parents[4]
        db_file = (root_dir / rel_path).resolve()
        DATABASE_URL = f"sqlite:///{db_file}"

# SQLite multi-threading support for FastAPI
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
