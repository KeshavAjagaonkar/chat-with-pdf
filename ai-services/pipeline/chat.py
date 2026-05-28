from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


# The system prompt is separated from the context so it's easy to iterate on.
# Each instruction is specific and testable — vague instructions like
# "be helpful" lead to inconsistent output.
SYSTEM_PROMPT = """You are a precise document assistant. Answer questions using ONLY the provided document context.

RULES:
1. Answer strictly from the context below. If the information is not present, say: "I couldn't find this information in the document."
2. When referencing specific information, cite the page number shown in brackets (e.g., "According to **Page 3**, ...").
3. Use **bold** for key terms, names, dates, numbers, and important concepts.
4. Structure your responses clearly using markdown:
   - Use bullet points for lists of items or features.
   - Use numbered lists for sequential steps or ranked items.
   - Use ### headings to separate distinct topics in longer answers.
   - Use > blockquotes when quoting directly from the document.
5. Be concise. Do not repeat information or add filler phrases.
6. For follow-up questions, refer to the conversation history for context."""


def _build_context(context_chunks: list) -> str:
    """
    Builds the document context section of the prompt.

    Accepts either list[dict] (new format with metadata) or list[str] (legacy).
    Each chunk is separated by a horizontal rule for visual clarity in the prompt.
    Page labels are prepended to each chunk so the LLM can cite specific pages.

    Design decisions:
    - Page labels use square brackets [Page N] which is a clear, parseable format.
    - Chunks are separated with --- to help the LLM distinguish context boundaries.
    - Graceful fallback: if a chunk has no page metadata (old documents), it's
      included without a page label. The LLM simply won't cite a page for it.
    """
    context_parts = []

    for chunk in context_chunks:
        if isinstance(chunk, dict):
            text = chunk.get("text", "")
            pages = chunk.get("metadata", {}).get("pages", [])

            if pages:
                if len(pages) == 1:
                    page_label = f"[Page {pages[0]}]"
                else:
                    page_label = f"[Pages {pages[0]}–{pages[-1]}]"
                context_parts.append(f"{page_label}\n{text}")
            else:
                context_parts.append(text)
        else:
            # Legacy fallback: plain string chunks (from old documents
            # or the non-streaming /chat endpoint if called directly).
            context_parts.append(str(chunk))

    return "\n\n---\n\n".join(context_parts)


def _build_prompt(question: str, context_chunks: list, chat_history: list[dict] = None) -> str:
    """
    Builds the full prompt for Gemini, combining:
    1. System instruction (formatting rules, citation requirements)
    2. Document context chunks (from vector search, with page labels)
    3. Conversation history (last N messages for follow-up support)
    4. The current question

    Design decisions:
    - System prompt is a constant, not dynamically built. This makes it
      easy to version, test, and iterate on prompt quality.
    - Context chunks are formatted with page labels and separators.
    - Chat history is formatted as a simple User/Assistant transcript.
      This is more token-efficient than structured JSON and the LLM
      understands it natively.
    - The question is placed last (closest to where the model generates)
      which gives it the strongest influence on the response — this is
      a well-known positional bias in LLMs.
    """
    context = _build_context(context_chunks)

    # Format conversation history as a readable transcript.
    history_section = ""
    if chat_history:
        history_lines = []
        for msg in chat_history:
            role = "User" if msg.get("role") == "user" else "Assistant"
            content = msg.get("content", "")
            # Truncate very long history messages to save tokens.
            # The full context is already in the chunks — history is just
            # for understanding follow-up intent ("explain that more").
            if len(content) > 500:
                content = content[:500] + "..."
            history_lines.append(f"{role}: {content}")
        history_section = f"\n\nCONVERSATION HISTORY:\n" + "\n".join(history_lines)

    prompt = f"""{SYSTEM_PROMPT}

DOCUMENT CONTEXT:
{context}{history_section}

QUESTION: {question}"""

    return prompt


def generate_answer(question: str, context_chunks: list, chat_history: list[dict] = None) -> str:
    """Non-streaming: waits for full response, returns complete string."""
    prompt = _build_prompt(question, context_chunks, chat_history)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    return response.text


def generate_answer_stream(question: str, context_chunks: list, chat_history: list[dict] = None):
    """
    Streaming: yields text chunks as Gemini generates them.

    Uses generate_content_stream() which returns an iterator of response chunks.
    Each chunk contains a small piece of the answer as it's generated.
    The caller (main.py) wraps these in SSE format for the frontend.
    """
    prompt = _build_prompt(question, context_chunks, chat_history)

    response = client.models.generate_content_stream(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    for chunk in response:
        if chunk.text:
            yield chunk.text