from pydantic import BaseModel, Field
from typing import Optional, List

class TextExtractionResponse(BaseModel):
    text: str = Field(..., description="Extracted text content from the file")
    filename: str = Field(..., description="Original filename")
    file_type: str = Field(..., description="Type of file (pdf/txt)")
    error: Optional[str] = Field(None, description="Error message if extraction failed")
    saved_path: Optional[str] = Field(None, description="Path where the text file was saved")

class KeyInsight(BaseModel):
    category: str = Field(..., description="Category of the insight (e.g., 'Summary', 'Key Points', 'Action Items')")
    content: List[str] = Field(..., description="List of insights in this category")

class KeyInsightsResponse(BaseModel):
    insights: List[KeyInsight] = Field(..., description="List of categorized insights")
    error: Optional[str] = Field(None, description="Error message if processing failed") 