from fastapi import APIRouter, HTTPException, Body
from app.models.schema import MailDraftResponse, EmailSendRequest, EmailSendResponse
from app.services.mail_draft import get_mail_draft, update_mail_draft, send_email
import os

router = APIRouter()

@router.get("/get-mail-draft/{filename}", response_model=MailDraftResponse)
async def get_draft(filename: str):
    """
    Get a professional email draft from a previously uploaded text file.
    
    - **filename**: The name of the text file (without .txt extension)
    
    Returns:
    - **subject**: Email subject line
    - **greeting**: Opening greeting
    - **body**: Main content
    - **closing**: Closing line
    - **signature**: Professional signature
    - **error**: Error message if processing failed
    """
    file_path = f"uploads/{filename}.txt"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Text file not found")
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
        return await get_mail_draft(text, filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/update-mail-draft/{filename}", response_model=MailDraftResponse)
async def update_draft(filename: str, suggested_changes: str = Body(..., embed=True)):
    """
    Update the email draft based on suggested changes.
    
    - **filename**: The name of the text file (without .txt extension)
    - **suggested_changes**: Text describing the suggested changes
    
    Returns:
    - **subject**: Updated email subject line
    - **greeting**: Updated opening greeting
    - **body**: Updated main content
    - **closing**: Updated closing line
    - **signature**: Updated professional signature
    - **error**: Error message if processing failed
    """
    file_path = f"uploads/{filename}.txt"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Text file not found")
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
        return await update_mail_draft(text, filename, suggested_changes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/send-email", response_model=EmailSendResponse)
async def send_email_route(request: EmailSendRequest):
    """
    Send an email using the provided details.
    
    - **to**: Recipient email address
    - **from**: Sender email address
    - **subject**: Email subject line
    - **content**: Email content including greeting, body, closing, and signature
    
    Returns:
    - **success**: Whether the email was sent successfully
    - **message**: Status message
    - **error**: Error message if sending failed
    """
    try:
        result = await send_email(
            to_email=request.to,
            from_email=request.from_email,
            subject=request.subject,
            content=request.content
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 