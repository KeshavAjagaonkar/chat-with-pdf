import fitz


def extract_text_from_pdf(pdf_path: str) -> list[dict]:
    """
    Extracts text from a PDF, preserving page boundaries.

    Returns a list of page objects: [{"page": 1, "text": "..."}, ...]

    Design decisions:
    - Returns structured per-page data instead of a flat string so that
      downstream chunking can track which page(s) each chunk spans.
    - Empty pages are skipped (common in scanned PDFs with blank separator pages).
    - Each page's text is stripped to remove leading/trailing whitespace
      that PyMuPDF often includes from headers/footers/margins.
    - Errors on individual pages are logged but don't abort the entire
      extraction — a 100-page PDF shouldn't fail because page 47 has
      a corrupt annotation.
    """
    document = fitz.open(pdf_path)
    if document.is_encrypted:
        raise ValueError("PDF is encrypted and password-protected")

    pages = []

    for page_num in range(len(document)):
        try:
            page = document[page_num]
            # sort=True sorts text spans vertically then horizontally, reading columns in sequential natural flow
            text = page.get_text("text", sort=True).strip()

            # Skip empty pages — no useful content to chunk or embed.
            # This is common in scanned PDFs with blank separator pages
            # or PDFs with image-only pages (where get_text returns "").
            if not text:
                continue

            pages.append({
                "page": page_num + 1,  # 1-indexed for human readability
                "text": text,
            })
        except Exception as e:
            # Log but don't crash — partial extraction is better than none.
            # A corrupt annotation on one page shouldn't kill the whole pipeline.
            print(f"Warning: Failed to extract page {page_num + 1}: {e}")
            continue

    document.close()

    if not pages:
        raise ValueError("This PDF appears to be scanned or contains only images. Selectable text is required.")

    return pages