import psycopg2
import json
from db.pool import connection_pool

def fetch_user_documents(user_id: str) -> list[dict]:
    """
    Returns all documents belonging to a specific user.
    Borrowing active connections from the global ThreadedConnectionPool.
    """
    conn = connection_pool.getconn()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, filename, uploaded_at FROM documents
            WHERE user_id = %s
            ORDER BY uploaded_at DESC
            """,
            (user_id,)
        )
        rows = cursor.fetchall()
    except Exception as e:
        raise e
    finally:
        cursor.close()
        connection_pool.putconn(conn)

    return [
        {
            "id": row[0],
            "filename": row[1],
            "uploaded_at": row[2].isoformat() + "+00:00"  # Mark as UTC so browsers convert to local time
        }
        for row in rows
    ]


def save_message(document_id: int, user_id: str, role: str, content: str, sources: list = None):
    """
    Inserts a single chat message into the messages table, persisting sources citations.
    """
    conn = connection_pool.getconn()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO messages (document_id, user_id, role, content, sources)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                document_id,
                user_id,
                role,
                content,
                json.dumps(sources) if sources else None
            )
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        connection_pool.putconn(conn)


def fetch_messages(document_id: int, user_id: str) -> list[dict]:
    """
    Returns all messages for a specific document + user combination, restoring page citations.
    """
    conn = connection_pool.getconn()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT role, content, sources FROM messages
            WHERE document_id = %s AND user_id = %s
            ORDER BY id ASC
            """,
            (document_id, user_id)
        )
        rows = cursor.fetchall()
    except Exception as e:
        raise e
    finally:
        cursor.close()
        connection_pool.putconn(conn)

    messages = []
    for row in rows:
        raw_sources = row[2]
        sources = None
        if isinstance(raw_sources, str):
            try:
                sources = json.loads(raw_sources)
            except json.JSONDecodeError:
                sources = None
        elif isinstance(raw_sources, list):
            sources = raw_sources

        msg = {"role": row[0], "content": row[1]}
        if sources:
            msg["sources"] = sources
        messages.append(msg)
        
    return messages


def verify_document_owner(document_id: int, user_id: str) -> bool:
    """
    Checks if a document belongs to a specific user.
    """
    conn = connection_pool.getconn()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT 1 FROM documents WHERE id = %s AND user_id = %s",
            (document_id, user_id)
        )
        result = cursor.fetchone()
    except Exception as e:
        raise e
    finally:
        cursor.close()
        connection_pool.putconn(conn)

    return result is not None


def delete_document(document_id: int):
    """
    Deletes a document and all associated data (messages + chunks) in a single transaction transaction.
    """
    conn = connection_pool.getconn()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM messages WHERE document_id = %s", (document_id,))
        cursor.execute("DELETE FROM chunks WHERE document_id = %s", (document_id,))
        cursor.execute("DELETE FROM documents WHERE id = %s", (document_id,))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        connection_pool.putconn(conn)


def append_document_file(document_id: int, new_filename: str):
    """
    Appends a new filename to the document row to support multi-upload session references.
    """
    conn = connection_pool.getconn()
    try:
        cursor = conn.cursor()
        
        cursor.execute("SELECT filename FROM documents WHERE id = %s", (document_id,))
        row = cursor.fetchone()
        if not row:
            return
            
        current_filenames = row[0]
        if new_filename not in current_filenames:
            updated_filenames = f"{current_filenames}, {new_filename}"
            cursor.execute(
                "UPDATE documents SET filename = %s WHERE id = %s",
                (updated_filenames, document_id)
            )
            conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        connection_pool.putconn(conn)
