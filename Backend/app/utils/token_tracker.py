import tiktoken
import json
import os
from datetime import datetime
from typing import Dict, Any

# GPT-3.5-turbo pricing per 1K tokens (as of 2024)
PRICING = {
    "gpt-3.5-turbo": {
        "input": 0.0015,  # $0.0015 per 1K tokens
        "output": 0.002   # $0.002 per 1K tokens
    }
}

# INR conversion rate (you might want to update this periodically)
USD_TO_INR = 83.0  # 1 USD = 83 INR

def count_tokens(text: str, model: str = "gpt-3.5-turbo") -> int:
    """Count the number of tokens in a text string."""
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")  # fallback encoding
    return len(encoding.encode(text))

def calculate_cost(input_tokens: int, output_tokens: int, model: str = "gpt-3.5-turbo") -> Dict[str, float]:
    """Calculate the cost in USD and INR."""
    if model not in PRICING:
        raise ValueError(f"Pricing not available for model: {model}")
    
    input_cost = (input_tokens / 1000) * PRICING[model]["input"]
    output_cost = (output_tokens / 1000) * PRICING[model]["output"]
    total_cost_usd = input_cost + output_cost
    total_cost_inr = total_cost_usd * USD_TO_INR
    
    return {
        "input_cost_usd": round(input_cost, 6),
        "output_cost_usd": round(output_cost, 6),
        "total_cost_usd": round(total_cost_usd, 6),
        "total_cost_inr": round(total_cost_inr, 2)
    }

def log_token_usage(
    operation: str,
    model: str,
    input_tokens: int,
    output_tokens: int,
    costs: Dict[str, float],
    metadata: Dict[str, Any] = None
) -> None:
    """Log token usage and costs to a JSON file."""
    log_dir = "logs"
    os.makedirs(log_dir, exist_ok=True)
    
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "operation": operation,
        "model": model,
        "tokens": {
            "input": input_tokens,
            "output": output_tokens,
            "total": input_tokens + output_tokens
        },
        "costs": costs,
        "metadata": metadata or {}
    }
    
    log_file = os.path.join(log_dir, "token_usage.jsonl")
    
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(log_entry) + "\n") 