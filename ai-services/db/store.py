import psycopg2
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
import os

load_dotenv()

def get_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

def store_document(filename: str, user_id: str) -> int:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO documents (filename, user_id) VALUES (%s, %s) RETURNING id",
        (filename, user_id)
    )

    document_id = cursor.fetchone()[0]

    conn.commit()
    cursor.close()
    conn.close()

    return document_id

def store_chunks(document_id: int, embedded_chunks: list[dict]):
    conn = get_connection()
    cursor = conn.cursor()

    for chunk in embedded_chunks:
        cursor.execute(
            """
            INSERT INTO chunks (document_id, chunk_index, text, embedding)
            VALUES (%s, %s, %s, %s)
            """,
            (document_id, chunk["index"], chunk["text"], chunk["embedding"])
        )

    conn.commit()
    cursor.close()
    conn.close()