import psycopg2
import json
from dotenv import load_dotenv
import os

load_dotenv()


def get_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))


def search_similar_chunks(query_embedding: list[float], document_id: int, top_k: int = 4) -> list[dict]:
    """
    Finds the most semantically similar chunks to a query within a specific document.

    Returns structured results: [{"text": str, "chunk_index": int, "metadata": dict}, ...]

    Design decisions:
    - Returns dicts instead of plain strings so callers get text + page metadata
      in a single query (no N+1 problem).
    - COALESCE(metadata, '{}') handles old chunks that were stored before the
      metadata column existed — they return an empty dict instead of NULL.
    - The <=> operator is pgvector's cosine distance. Lower = more similar.
    - top_k=4 balances context quality vs. token cost. Too many chunks dilute
      the relevant context; too few risk missing key information.
    - metadata is parsed from JSON string to dict here (not in the caller)
      to keep the data contract clean — callers always get a Python dict.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT text, chunk_index, COALESCE(metadata, '{}')
        FROM chunks
        WHERE document_id = %s
        ORDER BY embedding <=> %s::vector
        LIMIT %s
        """,
        (document_id, query_embedding, top_k),
    )

    results = cursor.fetchall()

    cursor.close()
    conn.close()

    parsed_results = []
    for row in results:
        # metadata comes back as a string from COALESCE.
        # Parse it to a dict. If parsing fails (corrupt data), use empty dict.
        raw_metadata = row[2]
        if isinstance(raw_metadata, str):
            try:
                metadata = json.loads(raw_metadata)
            except (json.JSONDecodeError, TypeError):
                metadata = {}
        elif isinstance(raw_metadata, dict):
            # psycopg2 may auto-parse JSONB depending on version/config
            metadata = raw_metadata
        else:
            metadata = {}

        parsed_results.append({
            "text": row[0],
            "chunk_index": row[1],
            "metadata": metadata,
        })

    return parsed_results