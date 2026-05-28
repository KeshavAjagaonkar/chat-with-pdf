from fastapi import Form, HTTPException
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
import json

from pipeline.extract import extract_text_from_pdf
from pipeline.chunk import chunk_text
from pipeline.embed import generate_embeddings, generate_query_embedding
from pipeline.chat import generate_answer, generate_answer_stream
from db.store import store_document, store_chunks
from db.search import search_similar_chunks
from db.query import fetch_user_documents, save_message, fetch_messages, verify_document_owner, delete_document
from db.setup import run_migrations

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Run idempotent migrations on startup.
# This ensures the metadata JSONB column exists on the chunks table
# without requiring manual SQL on Railway. Safe to run multiple times.
try:
    run_migrations()
except Exception as e:
    # Log but don't crash — the app can still serve existing data even if
    # the migration fails (e.g., DB temporarily unreachable at startup).
    print(f"Migration warning (non-fatal): {e}")


class ChatRequest(BaseModel):
    question: str
    document_id: int
    user_id: str = ""
    chat_history: list = []  # Last N messages for conversation context


# Pydantic model for message save requests.
# BaseModel automatically validates that all fields are present
# and are the correct type. If a field is missing, FastAPI returns
# a 422 error with a clear message — no manual validation needed.
class MessageRequest(BaseModel):
    document_id: int
    user_id: str
    role: str
    content: str


@app.post("/process")
async def process_pdf(file: UploadFile = File(...), user_id: str = Form(...)):
    """
    Full PDF ingestion pipeline: extract → chunk → embed → store.

    Data flow:
    1. extract_text_from_pdf → list[dict] with per-page text
    2. chunk_text → list[dict] with text + page boundaries
    3. generate_embeddings → list[dict] with text + embedding + metadata
    4. store_chunks → writes to PostgreSQL (text, embedding, metadata JSONB)

    The temp file is always cleaned up, even if processing fails (finally block).
    """
    temp_path = f"temp_{file.filename}"

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        pages = extract_text_from_pdf(temp_path)
        chunks = chunk_text(pages)
        embedded_chunks = generate_embeddings(chunks)

        document_id = store_document(file.filename, user_id)
        store_chunks(document_id, embedded_chunks)

        return {
            "document_id": document_id,
            "filename": file.filename,
            "total_chunks": len(chunks),
        }
    finally:
        # Always clean up the temp file, even if processing fails.
        # os.path.exists guard prevents FileNotFoundError if the file
        # was never written (e.g., upload stream failed).
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/chat")
async def chat(request: ChatRequest):
    """Non-streaming chat endpoint (kept as fallback)."""
    # Ownership check — prevent users from chatting with documents they don't own.
    # Without this, anyone who guesses a document_id could read someone else's PDF.
    if request.user_id:
        if not verify_document_owner(request.document_id, request.user_id):
            raise HTTPException(status_code=403, detail="You don't have access to this document")

    query_embedding = generate_query_embedding(request.question)
    relevant_chunks = search_similar_chunks(query_embedding, request.document_id)

    # relevant_chunks is now list[dict] with text + metadata.
    # generate_answer accepts this directly — it builds page-labeled context internally.
    answer = generate_answer(request.question, relevant_chunks, request.chat_history)

    return {
        "answer": answer,
        "document_id": request.document_id,
    }


# POST /chat/stream — streaming version of /chat.
# Returns chunks of the AI answer as Server-Sent Events (SSE).
# SSE is a standard protocol where the server sends events to the client
# over a long-lived HTTP connection. Each event is a line starting with "data: ".
# The frontend reads these chunks in real-time and appends them to the UI.
@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    if request.user_id:
        if not verify_document_owner(request.document_id, request.user_id):
            raise HTTPException(status_code=403, detail="You don't have access to this document")

    query_embedding = generate_query_embedding(request.question)
    relevant_chunks = search_similar_chunks(query_embedding, request.document_id)

    def stream_generator():
        try:
            # Stream the LLM response chunk by chunk.
            # relevant_chunks (list[dict]) is passed directly to the chat function.
            # The prompt builder extracts text + page labels internally.
            for chunk in generate_answer_stream(request.question, relevant_chunks, request.chat_history):
                yield f"data: {chunk}\n\n"

            # Send source citations as structured JSON.
            # Format: data: [SOURCES]<json_array>\n\n
            #
            # Design decisions:
            # - JSON instead of |||−separated strings: self-describing, extensible,
            #   handles edge cases (text containing |||), and the frontend can
            #   parse it with JSON.parse instead of fragile string splitting.
            # - Only text and pages are sent (not embeddings or chunk_index)
            #   to minimize bandwidth.
            # - Sent BEFORE [DONE] so the frontend can attach sources to the
            #   message before marking the stream as complete.
            if relevant_chunks:
                sources = []
                for c in relevant_chunks:
                    sources.append({
                        "text": c["text"],
                        "pages": c.get("metadata", {}).get("pages", []),
                    })
                sources_json = json.dumps(sources, ensure_ascii=False)
                yield f"data: [SOURCES]{sources_json}\n\n"

            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: [Error: {str(e)}]\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        stream_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


# GET /documents?user_id=xxx
# Returns all documents belonging to a user.
# FastAPI reads `user_id` from the query string automatically
# because this is a GET endpoint and user_id is a function parameter.
@app.get("/documents")
async def get_documents(user_id: str):
    documents = fetch_user_documents(user_id)
    return {"documents": documents}


# DELETE /documents?document_id=X&user_id=Y
# Deletes a document and all its chunks + messages.
# Verifies ownership first — users can only delete their own documents.
@app.delete("/documents")
async def remove_document(document_id: int, user_id: str):
    if not verify_document_owner(document_id, user_id):
        raise HTTPException(status_code=403, detail="You don't have access to this document")

    delete_document(document_id)
    return {"status": "deleted"}


# POST /messages — saves a single message (user or assistant)
# Called by the Node backend after each chat exchange.
@app.post("/messages")
async def post_message(request: MessageRequest):
    save_message(request.document_id, request.user_id, request.role, request.content)
    return {"status": "saved"}


# GET /messages?document_id=X&user_id=Y — returns chat history
# Called when the chat page loads to restore previous conversation.
@app.get("/messages")
async def get_messages(document_id: int, user_id: str):
    messages = fetch_messages(document_id, user_id)
    return {"messages": messages}


@app.get("/health")
async def health():
    return {"status": "ok"}