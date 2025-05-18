import os
import json
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

TEST_TEXT = "This is a test document. It contains important information about testing."
TEST_FILENAME = "testfile"
UPLOADS_DIR = "uploads"
TXT_PATH = os.path.join(UPLOADS_DIR, f"{TEST_FILENAME}.txt")
JSON_PATH = os.path.join(UPLOADS_DIR, f"{TEST_FILENAME}.json")

@pytest.fixture(autouse=True)
def setup_and_teardown():
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    # Write a test .txt file
    with open(TXT_PATH, "w", encoding="utf-8") as f:
        f.write(TEST_TEXT)
    yield
    # Cleanup
    if os.path.exists(TXT_PATH):
        os.remove(TXT_PATH)
    if os.path.exists(JSON_PATH):
        os.remove(JSON_PATH)

def test_get_insights_file_not_found():
    response = client.get("/api/get-key-insights/nonexistent")
    assert response.status_code == 404
    assert response.json()["detail"] == "Text file not found"

def test_get_insights_success(monkeypatch):
    # Mock OpenAI response
    def mock_get_key_insights(text, filename):
        from app.models.schema import KeyInsightsResponse, KeyInsight
        return KeyInsightsResponse(insights=[KeyInsight(category="Summary", content=["Test summary"])], error=None)
    monkeypatch.setattr("app.services.insights.get_key_insights", mock_get_key_insights)

    response = client.get(f"/api/get-key-insights/{TEST_FILENAME}")
    assert response.status_code == 200
    data = response.json()
    assert "insights" in data
    assert isinstance(data["insights"], list)
    assert data["insights"][0]["category"] == "Summary"
    # Check that JSON file was saved
    assert os.path.exists(JSON_PATH)
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        saved = json.load(f)
    assert "insights" in saved

def test_update_insights_file_not_found():
    response = client.post("/api/update-key-insights/nonexistent", json={"suggested_changes": "Change something"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Text file not found"

def test_update_insights_success(monkeypatch):
    # Mock OpenAI response
    def mock_update_key_insights(text, filename, suggested_changes):
        from app.models.schema import KeyInsightsResponse, KeyInsight
        return KeyInsightsResponse(insights=[KeyInsight(category="Summary", content=["Updated summary"]), KeyInsight(category="Key Points", content=["Point 1"])], error=None)
    monkeypatch.setattr("app.services.insights.update_key_insights", mock_update_key_insights)

    response = client.post(f"/api/update-key-insights/{TEST_FILENAME}", json={"suggested_changes": "Change something"})
    assert response.status_code == 200
    data = response.json()
    assert "insights" in data
    assert any(ins["category"] == "Summary" for ins in data["insights"])
    # Check that JSON file was overwritten
    assert os.path.exists(JSON_PATH)
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        saved = json.load(f)
    assert any(ins["category"] == "Summary" for ins in saved["insights"]) 