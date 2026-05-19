import fitz

def extract_text_from_pdf(pdf_path: str) -> str:
    document = fitz.open(pdf_path)
    
    full_text = ""
    
    for page in document:
        page_text = page.get_text()
        full_text += page_text
    
    # print(full_text)
    
    document.close()
    
    return full_text