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

@app.post("/process")
async def process_pdf(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = extract_text_from_pdf(temp_path)
    chunks = chunk_text(text)
    embedded_chunks = generate_embeddings(chunks)

    document_id = store_document(file.filename)
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

@app.get("/health")
async def health():
    return {"status": "ok"}