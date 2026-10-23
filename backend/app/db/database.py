from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import get_settings

settings = get_settings()

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    # Ensure directory for sqlite database exists
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    if db_path and not db_path.startswith(":memory:"):
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_db_schema():
    """Creates tables and ensures migrations for newly added columns."""
    import logging
    from sqlalchemy import text
    logger = logging.getLogger("documentor.database")

    Base.metadata.create_all(bind=engine)
    if settings.DATABASE_URL.startswith("sqlite"):
        with engine.connect() as conn:
            try:
                conn.execute(text("ALTER TABLE documents ADD COLUMN user_id INTEGER"))
                conn.commit()
                logger.info("Migrated database: added user_id column to documents table")
            except Exception:
                pass

            try:
                conn.execute(text("ALTER TABLE chat_sessions ADD COLUMN user_id INTEGER"))
                conn.commit()
                logger.info("Migrated database: added user_id column to chat_sessions table")
            except Exception:
                pass

            try:
                conn.execute(text("ALTER TABLE chat_messages ADD COLUMN image_url VARCHAR(1024)"))
                conn.commit()
            except Exception:
                pass

