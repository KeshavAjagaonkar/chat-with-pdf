import psycopg2
import json
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
        (filename, user_id),
    )

    document_id = cursor.fetchone()[0]

    conn.commit()
    cursor.close()
    conn.close()

    return document_id


def store_chunks(document_id: int, embedded_chunks: list[dict]):
    """
    Stores embedded chunks with their metadata in the database.

    Design decisions:
    - metadata is serialized as JSON and stored in a JSONB column.
      PostgreSQL JSONB supports indexing and querying, so we can later
      filter chunks by page number if needed (e.g., "show me all chunks from page 5").
    - json.dumps is used explicitly (not relying on psycopg2's JSON adaptation)
      to ensure consistent serialization regardless of psycopg2 version.
    - Chunks without metadata get '{}' (empty object), not NULL.
      This avoids NULL-handling complexity in every downstream query.
    """
    conn = get_connection()
    cursor = conn.cursor()

    for chunk in embedded_chunks:
        metadata = chunk.get("metadata", {})
        cursor.execute(
            """
            INSERT INTO chunks (document_id, chunk_index, text, embedding, metadata)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                document_id,
                chunk["index"],
                chunk["text"],
                chunk["embedding"],
                json.dumps(metadata),
            ),
        )

    conn.commit()
    cursor.close()
    conn.close()