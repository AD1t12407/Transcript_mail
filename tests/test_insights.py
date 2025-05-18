import pytest
from fastapi.testclient import TestClient
from app.main import app
import os
import json

client = TestClient(app)

def test_get_insights_file_not_found():
    """Test getting insights for a non-existent file."""
    response = client.get("/api/get-key-insights/nonexistent")
    assert response.status_code == 404
    assert response.json()["detail"] == "Text file not found"

def test_get_insights_success():
    """Test getting insights for a valid text file."""
    # Create a test text file
    os.makedirs("uploads", exist_ok=True)
    test_text = "This is a test document. It contains important information about testing."
    with open("uploads/test.txt", "w", encoding="utf-8") as f:
        f.write(test_text)
    
    try:
        response = client.get("/api/get-key-insights/test")
        assert response.status_code == 200
        
        data = response.json()
        assert "insights" in data
        assert isinstance(data["insights"], list)
        assert len(data["insights"]) > 0
        
        # Check structure of insights
        for insight in data["insights"]:
            assert "category" in insight
            assert "content" in insight
            assert isinstance(insight["content"], list)
    
    finally:
        # Clean up
        if os.path.exists("uploads/test.txt"):
            os.remove("uploads/test.txt") 