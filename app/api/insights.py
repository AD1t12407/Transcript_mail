from fastapi import APIRouter, HTTPException
from app.models.schema import KeyInsightsResponse
from app.services.insights import get_key_insights
import os

router = APIRouter()

@router.get("/get-key-insights/{filename}", response_model=KeyInsightsResponse)
async def get_insights(filename: str):
    """
    Get key insights from a previously uploaded text file.
    
    - **filename**: The name of the text file (without .txt extension)
    
    Returns:
    - **insights**: List of categorized insights
    - **error**: Error message if processing failed
    """
    # Construct the file path
    file_path = f"uploads/{filename}.txt"
    
    # Check if file exists
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Text file not found")
    
    try:
        # Read the text file
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
        
        # Get insights
        return await get_key_insights(text)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 