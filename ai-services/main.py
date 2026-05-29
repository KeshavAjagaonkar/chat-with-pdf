from fastapi import Form, HTTPException, BackgroundTasks
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
import json
import time
import hashlib

from pipeline.extract import extract_text_from_pdf
from pipeline.chunk import chunk_text
from pipeline.embed import generate_embeddings, generate_query_embedding
from pipeline.chat import generate_answer, generate_answer_stream
from db.store import store_document, store_chunks
from db.search import search_similar_chunks
from db.query import (
    fetch_user_documents,
    save_message,
    fetch_messages,
    verify_document_owner,
    delete_document,
    append_document_file
)
from db.setup import run_migrations
from db.redis_client import redis_client

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Run idempotent migrations on startup.
try:
    run_migrations()
except Exception as e:
    print(f"Migration warning (non-fatal): {e}")


class ChatRequest(BaseModel):
    question: str
    document_id: int
    user_id: str = ""
    chat_history: list = []  # Last N messages for conversation context


class MessageRequest(BaseModel):
    document_id: int
    user_id: str
    role: str
    content: str
    sources: list = None # Optional list of citations JSONB


def bg_process_pdf(temp_path: str, filename: str, user_id: str, document_id: int):
    """
    Asynchronous PDF processing task.
    Updates Redis status in real time to enable glowing UI upload progress indicators.
    """
    try:
        # Step 1: Extraction
        if redis_client:
            redis_client.set(f"status:{document_id}", json.dumps({"status": "extracting", "progress": 25}))
        pages = extract_text_from_pdf(temp_path)

        # Step 2: Chunking
        if redis_client:
            redis_client.set(f"status:{document_id}", json.dumps({"status": "chunking", "progress": 50}))
        chunks = chunk_text(pages)

        # Step 3: Embedding
        if redis_client:
            redis_client.set(f"status:{document_id}", json.dumps({"status": "embedding", "progress": 75}))
        embedded_chunks = generate_embeddings(chunks, filename)

        # Step 4: Postgres pgvector Storage
        store_chunks(document_id, embedded_chunks)

        if redis_client:
            redis_client.set(f"status:{document_id}", json.dumps({"status": "completed", "progress": 100}))
    except Exception as e:
        if redis_client:
            redis_client.set(f"status:{document_id}", json.dumps({"status": "failed", "error": str(e)}))
        print(f"Error processing document {document_id}: {e}")
    finally:
        # Always clean up temp file buffers to prevent disk overflows
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/process")
async def process_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: str = Form(...),
    document_id: int = Form(None)
):
    """
    Ingest PDF asynchronously. Returns the document_id instantly in <200ms,
    offloading CPU-heavy parsing and external embedding generation to the background.
    """
    temp_path = f"temp_{int(time.time())}_{file.filename}"

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        if not document_id:
            # First file: Initialize the document context row
            document_id = store_document(file.filename, user_id)
        else:
            # Subsequent files: Verify owner before appending chunks
            if not verify_document_owner(document_id, user_id):
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                raise HTTPException(status_code=403, detail="You don't have access to this document")
            append_document_file(document_id, file.filename)

        # Set initial progress state in Redis
        if redis_client:
            redis_client.set(f"status:{document_id}", json.dumps({"status": "processing", "progress": 0}))

        # Queue the background processing job
        background_tasks.add_task(bg_process_pdf, temp_path, file.filename, user_id, document_id)

        return {
            "document_id": document_id,
            "filename": file.filename,
            "status": "processing",
        }
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"Failed to initiate processing: {str(e)}")


@app.get("/documents/status/{document_id}")
async def get_document_status(document_id: int, user_id: str):
    """
    Queries real-time ingestion progress. Used by the frontend progress bars.
    """
    if not verify_document_owner(document_id, user_id):
        raise HTTPException(status_code=403, detail="You don't have access to this document")

    if redis_client:
        status_data = redis_client.get(f"status:{document_id}")
        if status_data:
            return json.loads(status_data)

    # Fallback to complete state if Redis is empty or down
    return {"status": "completed", "progress": 100}


def get_query_hash(question: str) -> str:
    return hashlib.sha256(question.lower().strip().encode("utf-8")).hexdigest()


@app.post("/chat")
async def chat(request: ChatRequest):
    """Non-streaming chat endpoint (fallback)."""
    if request.user_id:
        if not verify_document_owner(request.document_id, request.user_id):
            raise HTTPException(status_code=403, detail="You don't have access to this document")

    query_embedding = generate_query_embedding(request.question)
    relevant_chunks = search_similar_chunks(query_embedding, request.document_id)
    answer = generate_answer(request.question, relevant_chunks, request.chat_history)

    return {
        "answer": answer,
        "document_id": request.document_id,
    }


@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    Pipes streaming SSE tokens.
    Leverages Redis Semantic Query Caching to bypass vector search and LLM calls
    for duplicate user questions in sub-10ms response times.
    """
    if request.user_id:
        if not verify_document_owner(request.document_id, request.user_id):
            raise HTTPException(status_code=403, detail="You don't have access to this document")

    # Hash question to secure document scoping (Multi-Tenant boundary)
    query_hash = get_query_hash(request.question)
    cache_key = f"cache:doc:{request.document_id}:{query_hash}"

    # Step 1: Check Redis cache hit
    if redis_client:
        cached_response = redis_client.get(cache_key)
        if cached_response:
            try:
                cache_data = json.loads(cached_response)
                
                # Instantly stream cached response!
                def stream_cached_response():
                    content = cache_data['content']
                    lines = content.split("\n")
                    for i, line in enumerate(lines):
                        if i > 0:
                            yield "data: \n\n"
                        if line:
                            yield f"data: {line}\n\n"
                    if "sources" in cache_data:
                        yield f"data: [SOURCES]{json.dumps(cache_data['sources'])}\n\n"
                    yield "data: [DONE]\n\n"
                    
                return StreamingResponse(
                    stream_cached_response(),
                    media_type="text/event-stream",
                    headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
                )
            except Exception:
                pass

    # Step 2: Normal Retrieval Pipeline
    query_embedding = generate_query_embedding(request.question)
    relevant_chunks = search_similar_chunks(query_embedding, request.document_id)

    def stream_generator():
        try:
            full_answer = ""
            for chunk in generate_answer_stream(request.question, relevant_chunks, request.chat_history):
                full_answer += chunk
                # Split chunk by newline to guarantee each line is a valid SSE 'data: ' prefixed event.
                lines = chunk.split("\n")
                for i, line in enumerate(lines):
                    if i > 0:
                        yield "data: \n\n"
                    if line:
                        yield f"data: {line}\n\n"

            sources = []
            if relevant_chunks:
                for c in relevant_chunks:
                    sources.append({
                        "text": c["text"],
                        "pages": c.get("metadata", {}).get("pages", []),
                        "filename": c.get("metadata", {}).get("filename", "")
                    })
                sources_json = json.dumps(sources, ensure_ascii=False)
                yield f"data: [SOURCES]{sources_json}\n\n"

            # Cache the successful answer for 24 hours (86400 seconds)
            if redis_client and full_answer.strip():
                redis_client.setex(
                    cache_key,
                    86400,
                    json.dumps({"content": full_answer, "sources": sources})
                )

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


@app.get("/documents")
async def get_documents(user_id: str):
    documents = fetch_user_documents(user_id)
    return {"documents": documents}


@app.delete("/documents")
async def remove_document(document_id: int, user_id: str):
    if not verify_document_owner(document_id, user_id):
        raise HTTPException(status_code=403, detail="You don't have access to this document")

    delete_document(document_id)
    return {"status": "deleted"}


@app.post("/messages")
async def post_message(request: MessageRequest):
    save_message(
        request.document_id,
        request.user_id,
        request.role,
        request.content,
        request.sources
    )
    return {"status": "saved"}


@app.get("/messages")
async def get_messages(document_id: int, user_id: str):
    messages = fetch_messages(document_id, user_id)
    return {"messages": messages}


@app.get("/health")
async def health():
    return {"status": "ok"}