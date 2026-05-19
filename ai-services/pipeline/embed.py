from google import genai
from google.genai import types
from dotenv import load_dotenv
import os

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_embeddings(chunks: list[str]) -> list[dict]:
    embedded_chunks = []

    for i, chunk in enumerate(chunks):
        response = client.models.embed_content(
            model="gemini-embedding-001",
            contents=chunk,
            config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT")
        )

        embedding = response.embeddings[0].values

        embedded_chunks.append({
            "index": i,
            "text": chunk,
            "embedding": list(embedding)
        })

    return embedded_chunks
def generate_query_embedding(query: str) -> list[float]:
    response = client.models.embed_content(
        model="gemini-embedding-001",
        contents=query,
        config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY")
    )
    return list(response.embeddings[0].values)