from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.schema import TextExtractionResponse
from app.services.extractor import extract_text_from_file

router = APIRouter()

@router.post("/upload", response_model=TextExtractionResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a PDF or TXT file and extract its text content.
    
    - **file**: The file to upload (PDF or TXT)
    
    Returns:
    - **text**: Extracted text content
    - **filename**: Original filename
    - **file_type**: Type of file (pdf/txt)
    - **error**: Error message if extraction failed
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
    
    result = await extract_text_from_file(file)
    
    if result["error"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return TextExtractionResponse(**result) 