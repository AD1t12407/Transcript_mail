import functools
from typing import Callable, Any
from app.utils.token_tracker import count_tokens, calculate_cost, log_token_usage

def track_token_usage(operation_name: str):
    """
    Decorator to track token usage and costs for OpenAI API calls.
    
    Args:
        operation_name: Name of the operation (e.g., 'get_insights', 'update_insights')
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            # Extract text from args or kwargs
            text = kwargs.get('text', args[0] if args else None)
            if not text:
                raise ValueError("No text provided for token counting")
            
            # Count input tokens
            input_tokens = count_tokens(text)
            
            # Call the original function
            result = await func(*args, **kwargs)
            
            # Extract output text from result
            output_text = ""
            if hasattr(result, 'insights'):
                # Convert insights to string for token counting
                output_text = str(result.insights)
            
            # Count output tokens
            output_tokens = count_tokens(output_text)
            
            # Calculate costs
            costs = calculate_cost(input_tokens, output_tokens)
            
            # Log the usage
            log_token_usage(
                operation=operation_name,
                model="gpt-3.5-turbo",
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                costs=costs,
                metadata={
                    "filename": kwargs.get('filename'),
                    "suggested_changes": kwargs.get('suggested_changes')
                }
            )
            
            return result
        return wrapper
    return decorator 