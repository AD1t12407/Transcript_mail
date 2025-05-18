import pytest
from httpx import AsyncClient
from fastapi import status
from app.main import app
import os

@pytest.fixture
def test_files_dir():
    return os.path.join(os.path.dirname(__file__), "test_files")

@pytest.fixture
def sample_txt_path(test_files_dir):
    return os.path.join(test_files_dir, "sample.txt")

@pytest.fixture
def sample_pdf_path(test_files_dir):
    return os.path.join(test_files_dir, "sample.pdf")

# Test uploading a txt file I want to log the speed processing

@pytest.mark.asyncio
async def test_upload_txt_file(sample_txt_path):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        with open(sample_txt_path, "rb") as f:
            response = await ac.post("/api/upload", files={"file": ("sample.txt", f, "text/plain")})
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "text" in data
        assert data["filename"] == "sample.txt"
        assert data["file_type"] == "txt"
        assert data["error"] is None
        

# Test uploading a pdf file
@pytest.mark.asyncio
async def test_upload_pdf_file(sample_pdf_path):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        with open(sample_pdf_path, "rb") as f:
            response = await ac.post("/api/upload", files={"file": ("sample.pdf", f, "application/pdf")})
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "text" in data
        assert data["filename"] == "sample.pdf"
        assert data["file_type"] == "pdf"
        assert data["error"] is None


# Test uploading an invalid file type
@pytest.mark.asyncio
async def test_upload_invalid_file():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Create a dummy image file
        dummy_content = b"dummy image content"
        response = await ac.post(
            "/api/upload",
            files={"file": ("sample.jpg", dummy_content, "image/jpeg")}
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "File type not allowed" in response.json()["detail"]

@pytest.mark.asyncio
async def test_upload_no_file():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/upload")
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY 