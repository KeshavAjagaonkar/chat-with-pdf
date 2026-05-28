from google import genai
from google.genai import types
from dotenv import load_dotenv
import os

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def generate_embeddings(chunks: list[dict]) -> list[dict]:
    """
    Generates embeddings for structured chunk objects.

    Args:
        chunks: List of {"text": str, "pages": [int]} from chunk_text.

    Returns:
        List of {"index": int, "text": str, "embedding": list[float], "metadata": dict}
        ready for storage.

    Design decisions:
    - Only the text is embedded (not page metadata). Including "[Page 3]" in the
      embedding input would pollute the semantic vector — the embedding should
      represent the *meaning* of the content, not its location in the PDF.
    - Page metadata is carried through as a separate "metadata" dict so it can
      be stored in a dedicated JSONB column (clean separation of content vs. metadata).
    - Each chunk is embedded individually rather than batched because the Gemini
      embedding API processes one content string per call. If the API adds batch
      support in the future, this can be optimized.
    """
    embedded_chunks = []

    for i, chunk in enumerate(chunks):
        text = chunk["text"]

        response = client.models.embed_content(
            model="gemini-embedding-001",
            contents=text,
            config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT"),
        )

        embedding = response.embeddings[0].values

        embedded_chunks.append({
            "index": i,
            "text": text,
            "embedding": list(embedding),
            "metadata": {
                "pages": chunk.get("pages", []),
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