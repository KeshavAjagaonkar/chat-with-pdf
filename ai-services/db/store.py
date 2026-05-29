import psycopg2
import json
from db.pool import connection_pool

def store_document(filename: str, user_id: str) -> int:
    """
    Stores a document metadata entry in PostgreSQL documents table.
    Borrows connection from ThreadedConnectionPool.
    """
    conn = connection_pool.getconn()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO documents (filename, user_id) VALUES (%s, %s) RETURNING id",
            (filename, user_id),
        )
        document_id = cursor.fetchone()[0]
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        connection_pool.putconn(conn)

    return document_id


def store_chunks(document_id: int, embedded_chunks: list[dict]):
    """
    Stores embedded chunks and their metadata inside a single SQL transaction block.
    """
    conn = connection_pool.getconn()
    try:
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
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        connection_pool.putconn(conn)