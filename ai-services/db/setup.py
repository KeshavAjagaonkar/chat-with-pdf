import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()
print(repr(os.getenv("DATABASE_URL")))
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
            embedding vector(3072)
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
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    conn.commit()
    cursor.close()
    conn.close()
    print("Tables created successfully")

if __name__ == "__main__":
    create_tables()