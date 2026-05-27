from fastapi import Form
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os

from pipeline.extract import extract_text_from_pdf
from pipeline.chunk import chunk_text
from pipeline.embed import generate_embeddings, generate_query_embedding
from pipeline.chat import generate_answer
from db.store import store_document, store_chunks
from db.search import search_similar_chunks
from db.query import fetch_user_documents, save_message, fetch_messages

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

class ChatRequest(BaseModel):
    question: str
    document_id: int

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
    temp_path = f"temp_{file.filename}"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = extract_text_from_pdf(temp_path)
    chunks = chunk_text(text)
    embedded_chunks = generate_embeddings(chunks)

    document_id = store_document(file.filename, user_id)
    store_chunks(document_id, embedded_chunks)

    os.remove(temp_path)

    return {
        "document_id": document_id,
        "filename": file.filename,
        "total_chunks": len(chunks)
    }

@app.post("/chat")
async def chat(request: ChatRequest):
    query_embedding = generate_query_embedding(request.question)
    relevant_chunks = search_similar_chunks(query_embedding, request.document_id)
    answer = generate_answer(request.question, relevant_chunks)

    return {
        "answer": answer,
        "document_id": request.document_id
    }

# GET /documents?user_id=xxx
# Returns all documents belonging to a user.
# FastAPI reads `user_id` from the query string automatically
# because this is a GET endpoint and user_id is a function parameter.
@app.get("/documents")
async def get_documents(user_id: str):
    documents = fetch_user_documents(user_id)
    return {"documents": documents}

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