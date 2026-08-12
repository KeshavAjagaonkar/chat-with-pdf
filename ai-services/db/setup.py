import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

def get_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))


def create_tables():
    conn = get_connection()
    cursor = conn.cursor()

    # NOTE: The live table also has a user_id column that was added after initial creation.
    # CREATE TABLE IF NOT EXISTS skips entirely if the table exists, so this is safe to re-run.
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id SERIAL PRIMARY KEY,
            filename TEXT NOT NULL,
            uploaded_at TIMESTAMP DEFAULT NOW()
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chunks (
            id SERIAL PRIMARY KEY,
            document_id INTEGER REFERENCES documents(id),
            chunk_index INTEGER NOT NULL,
            text TEXT NOT NULL,
            embedding vector(3072),
            metadata JSONB DEFAULT '{}'
        );
    """)

    # Messages table for chat history persistence.
    # - document_id: links to the document being chatted about
    # - user_id: which user sent/received this message (enables per-user history)
    # - role: 'user' or 'assistant' — CHECK constraint prevents bad data at DB level
    # - created_at: used for ORDER BY when loading history (oldest first)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            document_id INTEGER REFERENCES documents(id),
            user_id TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
            content TEXT NOT NULL,
            sources JSONB DEFAULT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    conn.commit()
    cursor.close()
    conn.close()
    print("Tables created successfully")


def run_migrations():
    """
    Run safe, idempotent migrations for existing deployments.

    This is called at app startup (in main.py) to ensure the database schema
    is up to date without requiring manual intervention on Railway.

    Design decisions:
    - Uses DO $$ ... EXCEPTION WHEN duplicate_column ... $$ pattern instead of
      ALTER TABLE ... ADD COLUMN IF NOT EXISTS (which PostgreSQL doesn't support).
    - Each migration is wrapped in its own DO block so one failing migration
      doesn't prevent others from running.
    - The JSONB DEFAULT '{}' means existing rows automatically get an empty
      metadata object — no backfill needed.
    - This is idempotent: calling it 100 times has the same effect as calling
      it once. Safe for multi-instance deployments (Railway autoscaling).
    """
    conn = get_connection()
    cursor = conn.cursor()

    # Migration 1: Add metadata JSONB column to chunks table.
    # Stores page numbers and future metadata (section titles, confidence scores, etc.)
    # without requiring schema changes for each new field.
    cursor.execute("""
        DO $$
        BEGIN
            ALTER TABLE chunks ADD COLUMN metadata JSONB DEFAULT '{}';
        EXCEPTION
            WHEN duplicate_column THEN
                -- Column already exists, nothing to do.
                NULL;
        END $$;
    """)

    # Migration 2: Add sources JSONB column to messages table.
    # Stores parsed JSON arrays of chunk citations for assistant responses.
    cursor.execute("""
        DO $$
        BEGIN
            ALTER TABLE messages ADD COLUMN sources JSONB DEFAULT NULL;
        EXCEPTION
            WHEN duplicate_column THEN
                -- Column already exists, nothing to do.
                NULL;
        END $$;
    """)

    conn.commit()
    cursor.close()
    conn.close()
    print("Migrations complete")


if __name__ == "__main__":
    create_tables()