from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def _build_prompt(question: str, context_chunks: list[str], chat_history: list[dict] = None) -> str:
    """
    Builds the full prompt for Gemini, combining:
    1. System instruction (answer from context only)
    2. PDF context chunks (from vector search)
    3. Conversation history (last N messages for follow-up support)
    4. The current question
    """
    context = "\n\n".join(context_chunks)

    # Format conversation history as User/Assistant pairs.
    # This lets the LLM understand follow-ups like "explain that more"
    # or "what about the second point?"
    history_text = ""
    if chat_history:
        history_lines = []
        for msg in chat_history:
            role = "User" if msg.get("role") == "user" else "Assistant"
            history_lines.append(f"{role}: {msg.get('content', '')}")
        history_text = "\n".join(history_lines)

    prompt = f"""You are a helpful assistant. Answer the user's question based only on the context provided below.
If the answer is not in the context, say "I don't have enough information to answer that."

Context:
{context}"""

    # Only include history section if there are previous messages
    if history_text:
        prompt += f"""

Conversation so far:
{history_text}"""

    prompt += f"""

Question: {question}

Answer:"""

    return prompt

def generate_answer(question: str, context_chunks: list[str], chat_history: list[dict] = None) -> str:
    """Non-streaming: waits for full response, returns complete string."""
    prompt = _build_prompt(question, context_chunks, chat_history)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text

def generate_answer_stream(question: str, context_chunks: list[str], chat_history: list[dict] = None):
    """
    Streaming: yields text chunks as Gemini generates them.
    
    Uses `generate_content_stream()` — the google-genai SDK's dedicated
    streaming method. This returns an iterator where each item is a chunk
    of the response as it's generated.
    """
    prompt = _build_prompt(question, context_chunks, chat_history)

    response = client.models.generate_content_stream(
        model="gemini-2.5-flash",
        contents=prompt
    )

    for chunk in response:
        if chunk.text:
            yield chunk.text