def chunk_text(pages: list[dict], chunk_size: int = 500, overlap: int = 50) -> list[dict]:
    """
    Splits page-annotated text into overlapping chunks while tracking page boundaries.

    Args:
        pages: List of {"page": int, "text": str} from extract_text_from_pdf.
        chunk_size: Number of words per chunk.
        overlap: Number of words to overlap between consecutive chunks.

    Returns:
        List of {"text": str, "pages": [int]} where pages is the sorted list
        of page numbers that contributed words to this chunk.

    Design decisions:
    - Uses a word-stream approach: each word is paired with its source page.
      When a chunk spans a page boundary (e.g., words 480-520 where page 3
      ends at word 500), the chunk correctly reports pages [3, 4].
    - Overlap ensures context isn't lost at chunk boundaries. A sentence that
      starts at the end of chunk N also appears at the start of chunk N+1.
    - Empty inputs return an empty list (no crash, no dummy chunks).
    - The pages list is sorted and deduplicated for clean downstream use.
    """
    if not pages:
        return []

    # Build a word stream where each word carries its source page number.
    # This is O(total_words) memory — for a 100-page PDF with ~50k words,
    # that's ~50k tuples × ~72 bytes ≈ 3.6MB. Totally acceptable.
    word_stream: list[tuple[str, int]] = []
    for page in pages:
        words = page["text"].split()
        page_num = page["page"]
        for word in words:
            word_stream.append((word, page_num))

    if not word_stream:
        return []

    chunks = []
    start = 0

    while start < len(word_stream):
        end = min(start + chunk_size, len(word_stream))
        chunk_segment = word_stream[start:end]

        text = " ".join(word for word, _ in chunk_segment)
        # sorted(set(...)) gives us a clean, deduplicated, ordered page list.
        # A chunk spanning pages 3→4 gets pages=[3,4], not [3,3,3,...,4,4].
        pages_in_chunk = sorted(set(page_num for _, page_num in chunk_segment))

        chunks.append({
            "text": text,
            "pages": pages_in_chunk,
        })

        # Advance by (chunk_size - overlap) to create the overlap window.
        # Guard: if overlap >= chunk_size, we'd never advance. The min(...)
        # ensures we always move forward by at least 1 word.
        step = max(1, chunk_size - overlap)
        start += step

    return chunks