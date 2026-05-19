from pipeline.extract import extract_text_from_pdf
from pipeline.chunk import chunk_text
from pipeline.embed import generate_embeddings,generate_query_embedding
from db.store import store_document, store_chunks
from db.search import search_similar_chunks
from pipeline.chat import generate_answer

# Step 1 - Extract
text = extract_text_from_pdf("sample.pdf")

# Step 2 - Chunk
chunks = chunk_text(text)

# Step 3 - Embed
embedded_chunks = generate_embeddings(chunks)

# Step 4 - Store
document_id = store_document("sample.pdf")
store_chunks(document_id, embedded_chunks)
print(f"Stored document with id: {document_id}")

# Step 5 - Search
# from pipeline.embed import generate_embeddings
query = "who is this person and what are their skills and projects?"
query_embedding = generate_query_embedding(query)
results = search_similar_chunks(query_embedding, document_id)

print("\n--- Top matching chunks ---")
for i, chunk in enumerate(results):
    print(f"\nResult {i+1}: {chunk[:200]}")

answer = generate_answer(query, results)
print("\n--- Answer ---")
print(answer)