import os
import json
import dotenv
import asyncio
from openai import AsyncOpenAI
from app.core.config import settings
from app.models.schema import KeyInsight, KeyInsightsResponse


dotenv.load_dotenv()

API_KEY = dotenv.get_key(".env", "OPENAI_API_KEY")


client = AsyncOpenAI(api_key=API_KEY) 

async def get_key_insights(text: str) -> KeyInsightsResponse:
    """
    Get key insights from text using OpenAI.
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
        
        return KeyInsightsResponse(insights=insights, error=None)
        
    except Exception as e:
        return KeyInsightsResponse(insights=[], error=str(e)) 
    
    
