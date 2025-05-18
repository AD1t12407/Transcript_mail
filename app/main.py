from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import upload, insights, mail_draft

app = FastAPI(
    title="Transcript Processor",
    description="API for processing PDF and text files",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(insights.router, prefix="/api", tags=["insights"])
app.include_router(mail_draft.router, prefix="/api", tags=["mail"]) 