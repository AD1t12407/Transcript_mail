import os
import json
import dotenv
import asyncio
from openai import AsyncOpenAI
from app.core.config import settings
from app.models.schema import KeyInsight, KeyInsightsResponse
from app.utils.decorators import track_token_usage


dotenv.load_dotenv()

API_KEY = dotenv.get_key(".env", "OPENAI_API_KEY")


client = AsyncOpenAI(api_key=API_KEY) 

def save_insights_json(insights: KeyInsightsResponse, filename: str) -> str:
    """Save insights to a JSON file."""
    # Create uploads directory if it doesn't exist
    os.makedirs("uploads", exist_ok=True)
    
    # Generate JSON filename
    json_filename = f"uploads/{filename}.json"
    
    # Convert to dict and save
    insights_dict = insights.model_dump()
    with open(json_filename, "w", encoding="utf-8") as f:
        json.dump(insights_dict, f, indent=2)
    
    return json_filename

@track_token_usage("get_insights")
async def get_key_insights(text: str, filename: str) -> KeyInsightsResponse:
    """
    Get key insights from text using OpenAI and save to JSON.
    """
    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": """Analyze the following text and provide key insights in the following categories:
                    1. Summary - A brief overview of the main content
                    2. Key Points - Important points or findings
                    3. Action Items - Any tasks, recommendations, or next steps
                    
                    Format the response as a JSON object with categories as keys and arrays of insights as values."""
                },
                {
                    "role": "user",
                    "content": text
                }
            ],
            response_format={"type": "json_object"}
        )
        
        insights_data = json.loads(response.choices[0].message.content)
        
       
        
        
        # Convert the response to our schema format
        insights = [
            KeyInsight(category=category, content=content)
            for category, content in insights_data.items()
        ]
        
        insights_response = KeyInsightsResponse(insights=insights, error=None)
        
        # Save to JSON file
        save_insights_json(insights_response, filename)
        
        return insights_response
        
    except Exception as e:
        return KeyInsightsResponse(insights=[], error=str(e)) 
    
    
@track_token_usage("update_insights")
async def update_key_insights(text: str, filename: str, suggested_changes: str) -> KeyInsightsResponse:
    """
    Update insights based on suggested changes.
    """
    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": """You are an AI assistant that helps improve text analysis. 
                    Given the original text and suggested changes, provide updated insights in the following categories:
                    1. Summary - A brief overview of the main content
                    2. Key Points - Important points or findings
                    3. Action Items - Any tasks, recommendations, or next steps
                    
                    Consider the suggested changes while analyzing the text.
                    Format the response as a JSON object with categories as keys and arrays of insights as values."""
                },
                {
                    "role": "user",
                    "content": f"Original text:\n{text}\n\nSuggested changes:\n{suggested_changes}"
                }
            ],
            response_format={"type": "json_object"}
        )
        
        insights_data = json.loads(response.choices[0].message.content)
        
        # Convert the response to our schema format
        insights = [
            KeyInsight(category=category, content=content)
            for category, content in insights_data.items()
        ]
        
        insights_response = KeyInsightsResponse(insights=insights, error=None)
        
        # Save to JSON file (overwriting the old one)
        save_insights_json(insights_response, filename)
        
        return insights_response
        
    except Exception as e:
        return KeyInsightsResponse(insights=[], error=str(e)) 
    
    
