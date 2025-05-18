from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Transcript Processor"
    
    # File Upload Settings
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".txt"]
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # Email Settings
    EMAIL_TESTING_MODE: bool = True  # Set to False to actually send emails
    SMTP_SERVER: str = "smtp.gmail.com"  # Replace with your SMTP server
    SMTP_PORT: int = 587  # Standard port for TLS
    SMTP_USE_TLS: bool = True
    SMTP_USERNAME: str = "aditinarayn24@gmail.com"  # Your email username/address
    SMTP_PASSWORD: str = "lisp cuxf lywm toeh"# Your email password or app password
    
    class Config:
        case_sensitive = True

settings = Settings() 