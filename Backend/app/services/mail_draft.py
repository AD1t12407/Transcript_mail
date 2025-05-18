import os
import json
import smtplib
from openai import AsyncOpenAI
from app.models.schema import MailDraftResponse, EmailSendResponse
from app.utils.decorators import track_token_usage
import dotenv
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings

dotenv.load_dotenv()
API_KEY = dotenv.get_key(".env", "OPENAI_API_KEY")
client = AsyncOpenAI(api_key=API_KEY)

def save_mail_draft_json(draft: MailDraftResponse, filename: str) -> str:
    """Save mail draft to a JSON file."""
    os.makedirs("uploads", exist_ok=True)
    json_filename = f"uploads/{filename}_mail.json"
    
    draft_dict = draft.model_dump()
    with open(json_filename, "w", encoding="utf-8") as f:
        json.dump(draft_dict, f, indent=2)
    
    return json_filename

@track_token_usage("get_mail_draft")
async def get_mail_draft(text: str, filename: str) -> MailDraftResponse:
    """Generate a professional email draft based on the transcript content."""
    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": """Create a professional email draft based on the following transcript text.
                    Format the response as JSON with the following fields:
                    - subject: A concise and professional email subject line
                    - greeting: An appropriate opening greeting
                    - body: The main content of the email, summarizing key points and actions
                    - closing: A professional closing line
                    - signature: An appropriate signature
                    
                    Make the email professional, concise, and focused on the key information from the transcript."""
                },
                {
                    "role": "user",
                    "content": text
                }
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        
        draft_response = MailDraftResponse(
            subject=result["subject"],
            greeting=result["greeting"],
            body=result["body"],
            closing=result["closing"],
            signature=result["signature"],
            error=None
        )
        
        return draft_response
        
    except Exception as e:
        return MailDraftResponse(
            subject="",
            greeting="",
            body="",
            closing="",
            signature="",
            error=str(e)
        )

@track_token_usage("update_mail_draft")
async def update_mail_draft(text: str, filename: str, suggested_changes: str) -> MailDraftResponse:
    """Update email draft based on suggested changes."""
    try:
        # Get current draft as context
        current_draft = await get_mail_draft(text, filename)
        current_draft_json = {
            "subject": current_draft.subject,
            "greeting": current_draft.greeting,
            "body": current_draft.body,
            "closing": current_draft.closing,
            "signature": current_draft.signature
        }
        
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": """You are an assistant that helps improve email drafts.
                    Given the original transcript, current email draft, and suggested changes,
                    provide an updated email draft.
                    
                    Format the response as JSON with the following fields:
                    - subject: A concise and professional email subject line
                    - greeting: An appropriate opening greeting
                    - body: The main content of the email
                    - closing: A professional closing line
                    - signature: An appropriate signature
                    
                    Apply the suggested changes while maintaining professionalism and clarity."""
                },
                {
                    "role": "user",
                    "content": f"Original transcript:\n{text}\n\nCurrent draft:\n{json.dumps(current_draft_json, indent=2)}\n\nSuggested changes:\n{suggested_changes}"
                }
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        
        draft_response = MailDraftResponse(
            subject=result["subject"],
            greeting=result["greeting"],
            body=result["body"],
            closing=result["closing"],
            signature=result["signature"],
            error=None
        )
        
        return draft_response
        
    except Exception as e:
        return MailDraftResponse(
            subject="",
            greeting="",
            body="",
            closing="",
            signature="",
            error=str(e)
        )

async def send_email(to_email: str, from_email: str, subject: str, content: str) -> EmailSendResponse:
    """
    Send an email using the specified SMTP server.
    
    In a production environment, you would use a secure email service or library.
    This is a simple implementation for demonstration purposes.
    """
    try:
        # In a real application, you would use environment variables for email configuration
        # and implement proper authentication and security
        
        if settings.EMAIL_TESTING_MODE:
            # In testing mode, just log the email instead of actually sending it
            email_log = {
                "to": to_email,
                "from": from_email,
                "subject": subject,
                "content": content
            }
            
            # Create logs directory if it doesn't exist
            os.makedirs("logs", exist_ok=True)
            
            # Log the email details to a file
            log_file = f"logs/email_log_{to_email.replace('@', '_at_')}.json"
            with open(log_file, "w") as f:
                json.dump(email_log, f, indent=2)
                
            return EmailSendResponse(
                success=True,
                message=f"Email logged (testing mode) to {log_file}",
                error=None
            )
        
        # For actual email sending (not used in testing mode)
        message = MIMEMultipart()
        message["From"] = from_email
        message["To"] = to_email
        message["Subject"] = subject
        
        # Add body to email
        message.attach(MIMEText(content, "plain"))
        
        # Create SMTP session
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
                
            if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                
            server.send_message(message)
            
        return EmailSendResponse(
            success=True,
            message=f"Email sent successfully to {to_email}",
            error=None
        )
        
    except Exception as e:
        return EmailSendResponse(
            success=False,
            message="Failed to send email",
            error=str(e)
        ) 