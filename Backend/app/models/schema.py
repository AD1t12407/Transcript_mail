from pydantic import BaseModel, Field, EmailStr
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

class MailDraftResponse(BaseModel):
    subject: str = Field(..., description="Email subject line")
    greeting: str = Field(..., description="Opening greeting")
    body: str = Field(..., description="Main content of the email")
    closing: str = Field(..., description="Closing line")
    signature: str = Field(..., description="Professional signature")
    error: Optional[str] = Field(None, description="Error message if processing failed")

class EmailSendRequest(BaseModel):
    to: EmailStr = Field(..., description="Recipient email address")
    from_email: EmailStr = Field(..., description="Sender email address")
    subject: str = Field(..., description="Email subject line")
    content: str = Field(..., description="Email content")

class EmailSendResponse(BaseModel):
    success: bool = Field(..., description="Whether the email was sent successfully")
    message: str = Field(..., description="Status message")
    error: Optional[str] = Field(None, description="Error message if sending failed") 