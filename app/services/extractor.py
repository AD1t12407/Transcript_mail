import fitz  # PyMuPDF
from fastapi import UploadFile, HTTPException
from app.core.config import settings
import io
import os
from typing import Tuple

async def validate_file(file: UploadFile) -> Tuple[str, str]:
    """Validate file type and size."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    file_ext = file.filename.lower().split('.')[-1]
    if f".{file_ext}" not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    return file.filename, file_ext

async def save_text_file(text: str, original_filename: str) -> str:
    """Save extracted text to a file."""
    # Create uploads directory if it doesn't exist
    os.makedirs("uploads", exist_ok=True)
    
    # Generate a text filename based on the original filename
    base_name = os.path.splitext(original_filename)[0]
    text_filename = f"uploads/{base_name}.txt"
    
    # Save the text
    with open(text_filename, "w", encoding="utf-8") as f:
        f.write(text)
    
    return text_filename

async def extract_text_from_file(file: UploadFile) -> dict:
    """Extract text from uploaded file."""
    filename, file_ext = await validate_file(file)
    
    try:
        if file_ext == "pdf":
            text = await extract_text_from_pdf(file)
        else:  # txt
            text = await extract_text_from_txt(file)
        
        # Save the text to a file
        saved_path = await save_text_file(text, filename)
            
        return {
            "text": text,
            "filename": filename,
            "file_type": file_ext,
            "error": None,
            "saved_path": saved_path
        }
    except Exception as e:
        return {
            "text": "",
            "filename": filename,
            "file_type": file_ext,
            "error": str(e),
            "saved_path": None
        }

async def extract_text_from_pdf(file: UploadFile) -> str:
    """Extract text from PDF file."""
    content = await file.read()
    try:
        doc = fitz.open(stream=content, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing PDF: {str(e)}")
    finally:
        await file.seek(0)

async def extract_text_from_txt(file: UploadFile) -> str:
    """Extract text from TXT file."""
    try:
        content = await file.read()
        return content.decode("utf-8").strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing text file: {str(e)}")
    finally:
        await file.seek(0) 