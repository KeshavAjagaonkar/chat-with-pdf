import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

def get_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

def search_similar_chunks(query_embedding: list[float], document_id: int, top_k: int = 4) -> list[str]:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT text FROM chunks
        WHERE document_id = %s
        ORDER BY embedding <=> %s::vector
        LIMIT %s
        """,
        (document_id, query_embedding, top_k)
    )

    results = cursor.fetchall()

    cursor.close()
    conn.close()

    return [row[0] for row in results]