import psycopg2
import json
from db.pool import connection_pool

def search_similar_chunks(query_embedding: list[float], document_id: int, top_k: int = 4) -> list[dict]:
    """
    Finds the most semantically similar chunks to a query using ThreadedConnectionPool.
    """
    conn = connection_pool.getconn()
    try:
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
    except Exception as e:
        raise e
    finally:
        cursor.close()
        connection_pool.putconn(conn)

    parsed_results = []
    for row in results:
        raw_metadata = row[2]
        if isinstance(raw_metadata, str):
            try:
                metadata = json.loads(raw_metadata)
            except (json.JSONDecodeError, TypeError):
                metadata = {}
        elif isinstance(raw_metadata, dict):
            metadata = raw_metadata
        else:
            metadata = {}

        parsed_results.append({
            "text": row[0],
            "chunk_index": row[1],
            "metadata": metadata,
        })

    return parsed_results