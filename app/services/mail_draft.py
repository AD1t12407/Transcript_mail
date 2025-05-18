import os
import json
from openai import AsyncOpenAI
from app.models.schema import MailDraftResponse
from app.utils.decorators import track_token_usage
import dotenv

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
    """
    Generate a professional email draft from the text content.
    """
    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert email writer. Create a professional email draft based on the provided text.
                    The email should be well-structured with:
                    1. A clear subject line
                    2. Professional greeting
                    3. Well-organized body
                    4. Professional closing
                    
                    Format the response as a JSON object with these fields:
                    - subject: The email subject line
                    - greeting: The opening greeting
                    - body: The main content of the email
                    - closing: The closing line
                    - signature: A professional signature"""
                },
                {
                    "role": "user",
                    "content": text
                }
            ],
            response_format={"type": "json_object"}
        )
        
        draft_data = json.loads(response.choices[0].message.content)
        draft_response = MailDraftResponse(**draft_data, error=None)
        
        # Save to JSON file
        save_mail_draft_json(draft_response, filename)
        
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
    """
    Update the email draft based on suggested changes.
    """
    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert email writer. Update the email draft based on the suggested changes.
                    The email should maintain a professional structure with:
                    1. A clear subject line
                    2. Professional greeting
                    3. Well-organized body
                    4. Professional closing
                    
                    Consider the suggested changes while maintaining professionalism.
                    Format the response as a JSON object with these fields:
                    - subject: The email subject line
                    - greeting: The opening greeting
                    - body: The main content of the email
                    - closing: The closing line
                    - signature: A professional signature"""
                },
                {
                    "role": "user",
                    "content": f"Original text:\n{text}\n\nSuggested changes:\n{suggested_changes}"
                }
            ],
            response_format={"type": "json_object"}
        )
        
        draft_data = json.loads(response.choices[0].message.content)
        draft_response = MailDraftResponse(**draft_data, error=None)
        
        # Save to JSON file (overwriting the old one)
        save_mail_draft_json(draft_response, filename)
        
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