from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def _build_prompt(question: str, context_chunks: list[str]) -> str:
    """Shared prompt builder used by both streaming and non-streaming paths."""
    context = "\n\n".join(context_chunks)

    return f"""You are a helpful assistant. Answer the user's question based only on the context provided below.
If the answer is not in the context, say "I don't have enough information to answer that."

Context:
{context}

Question: {question}

Answer:"""

def generate_answer(question: str, context_chunks: list[str]) -> str:
    """Non-streaming: waits for full response, returns complete string."""
    prompt = _build_prompt(question, context_chunks)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text

def generate_answer_stream(question: str, context_chunks: list[str]):
    """
    Streaming: yields text chunks as Gemini generates them.
    
    This is a Python generator function (uses `yield`).
    Each chunk contains a small piece of the answer (usually a few words).
    FastAPI's StreamingResponse can consume this directly.
    
    The `stream=True` parameter tells the Gemini SDK to return an iterator
    instead of waiting for the complete response.
    """
    prompt = _build_prompt(question, context_chunks)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        stream=True
    )

    for chunk in response:
        if chunk.text:
            yield chunk.text