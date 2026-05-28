import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

def get_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

def fetch_user_documents(user_id: str) -> list[dict]:
    """
    Returns all documents belonging to a specific user.
    
    SQL breakdown:
    - WHERE user_id = %s → only this user's docs (multi-tenant isolation)
    - ORDER BY uploaded_at DESC → newest first
    - %s is a parameterized placeholder (prevents SQL injection)
    """
    conn = get_connection()
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

    cursor.close()
    conn.close()

    # Convert tuples to dicts for clean JSON serialization.
    # psycopg2 returns rows as tuples like (1, "file.pdf", datetime(...))
    # We map them to dicts so FastAPI can serialize them as JSON.
    return [
        {
            "id": row[0],
            "filename": row[1],
            "uploaded_at": row[2].isoformat() + "+00:00"  # Mark as UTC so browsers convert to local time
        }
        for row in rows
    ]


def save_message(document_id: int, user_id: str, role: str, content: str):
    """
    Inserts a single chat message into the messages table.
    
    Called twice per chat exchange:
    1. Once for the user's question (role='user')
    2. Once for the AI's answer (role='assistant')
    
    The CHECK constraint on the `role` column in the DB will reject
    any value that isn't 'user' or 'assistant'.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO messages (document_id, user_id, role, content)
        VALUES (%s, %s, %s, %s)
        """,
        (document_id, user_id, role, content)
    )

    conn.commit()
    cursor.close()
    conn.close()


def fetch_messages(document_id: int, user_id: str) -> list[dict]:
    """
    Returns all messages for a specific document + user combination.
    
    SQL breakdown:
    - WHERE document_id = %s AND user_id = %s → scoped to this doc AND this user
    - ORDER BY id ASC → oldest first, so chat reads top-to-bottom chronologically.
      We use the auto-incrementing primary key 'id' instead of 'created_at' to
      guarantee exact sequential order, preventing flips from identical timestamps.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT role, content FROM messages
        WHERE document_id = %s AND user_id = %s
        ORDER BY id ASC
        """,
        (document_id, user_id)
    )

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return [
        {"role": row[0], "content": row[1]}
        for row in rows
    ]


def verify_document_owner(document_id: int, user_id: str) -> bool:
    """
    Checks if a document belongs to a specific user.
    
    Used to prevent User B from chatting with or deleting User A's document.
    Returns True if the document exists AND belongs to the user, False otherwise.
    
    SELECT 1 is a performance trick — we don't need the actual data,
    just whether a matching row exists. It's faster than SELECT *.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT 1 FROM documents WHERE id = %s AND user_id = %s",
        (document_id, user_id)
    )

    result = cursor.fetchone()

    cursor.close()
    conn.close()

    return result is not None


def delete_document(document_id: int):
    """
    Deletes a document and all associated data (messages + chunks).
    
    Deletion order matters because of foreign key constraints:
    1. Delete messages (references documents.id)
    2. Delete chunks (references documents.id)
    3. Delete the document itself
    
    All three deletes happen in a single transaction (one conn.commit),
    so if any step fails, nothing is deleted — all-or-nothing.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM messages WHERE document_id = %s", (document_id,))
    cursor.execute("DELETE FROM chunks WHERE document_id = %s", (document_id,))
    cursor.execute("DELETE FROM documents WHERE id = %s", (document_id,))

    conn.commit()
    cursor.close()
    conn.close()
