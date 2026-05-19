def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    words = text.split()
    
    chunks = []
    start = 0
    
    while start < len(words):
        end = start + chunk_size
        chunk = words[start:end]
        chunk_text_joined = " ".join(chunk)
        chunks.append(chunk_text_joined)
        start = end - overlap
    
    return chunks