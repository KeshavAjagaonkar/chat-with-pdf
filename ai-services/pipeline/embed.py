import time
import random
from google import genai
from google.genai import types
from dotenv import load_dotenv
import os

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def generate_embeddings(chunks: list[dict], filename: str = None) -> list[dict]:
    """
    Generates embeddings for structured chunk objects.

    Args:
        chunks: List of {"text": str, "pages": [int]} from chunk_text.
        filename: Optional filename to link chunks to their target document.

    Returns:
        List of {"index": int, "text": str, "embedding": list[float], "metadata": dict}
        ready for storage.
    """
    embedded_chunks = []

    for i, chunk in enumerate(chunks):
        text = chunk["text"]

        # Exponential backoff with jitter retry loop for rate limit protection (HTTP 429)
        retries = 5
        delay = 1.0
        response = None

        for attempt in range(retries):
            try:
                response = client.models.embed_content(
                    model="gemini-embedding-001",
                    contents=text,
                    config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT"),
                )
                break
            except Exception as e:
                if attempt == retries - 1:
                    raise e
                # Wait with added randomized jitter to prevent thundering herd crashes
                time.sleep(delay + random.uniform(0, 0.5))
                delay *= 2.0

        embedding = response.embeddings[0].values

        embedded_chunks.append({
            "index": i,
            "text": text,
            "embedding": list(embedding),
            "metadata": {
                "pages": chunk.get("pages", []),
                "filename": filename,
            },
        })

    return embedded_chunks


def generate_query_embedding(query: str) -> list[float]:
    """
    Generates a query embedding for semantic search.

    Uses RETRIEVAL_QUERY task type (vs RETRIEVAL_DOCUMENT for chunks).
    This asymmetry is by design — Google's embedding model is trained to
    map queries and documents into the same space but with different
    internal processing paths, which improves retrieval accuracy.
    """
    response = client.models.embed_content(
        model="gemini-embedding-001",
        contents=query,
        config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY"),
    )
    return list(response.embeddings[0].values)