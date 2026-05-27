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
    
    Uses `generate_content_stream()` — the google-genai SDK's dedicated
    streaming method. This returns an iterator where each item is a chunk
    of the response as it's generated.
    
    NOTE: Do NOT use generate_content(stream=True) — that parameter
    doesn't exist in this SDK. The streaming method is separate.
    """
    prompt = _build_prompt(question, context_chunks)

    response = client.models.generate_content_stream(
        model="gemini-2.5-flash",
        contents=prompt
    )

    for chunk in response:
        if chunk.text:
            yield chunk.text