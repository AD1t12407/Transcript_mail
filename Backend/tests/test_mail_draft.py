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
MAIL_JSON_PATH = os.path.join(UPLOADS_DIR, f"{TEST_FILENAME}_mail.json")

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
    if os.path.exists(MAIL_JSON_PATH):
        os.remove(MAIL_JSON_PATH)

def test_get_mail_draft_file_not_found():
    response = client.get("/api/get-mail-draft/nonexistent")
    assert response.status_code == 404
    assert response.json()["detail"] == "Text file not found"

def test_get_mail_draft_success(monkeypatch):
    # Mock OpenAI response
    async def mock_get_mail_draft(text, filename):
        from app.models.schema import MailDraftResponse
        return MailDraftResponse(
            subject="Test Subject",
            greeting="Dear Sir/Madam",
            body="This is a test email body.",
            closing="Best regards",
            signature="Test Signature",
            error=None
        )
    monkeypatch.setattr("app.services.mail_draft.get_mail_draft", mock_get_mail_draft)

    response = client.get(f"/api/get-mail-draft/{TEST_FILENAME}")
    assert response.status_code == 200
    data = response.json()
    assert "subject" in data
    assert "greeting" in data
    assert "body" in data
    assert "closing" in data
    assert "signature" in data
    # Check that JSON file was saved
    assert os.path.exists(MAIL_JSON_PATH)
    with open(MAIL_JSON_PATH, "r", encoding="utf-8") as f:
        saved = json.load(f)
    assert "subject" in saved

def test_update_mail_draft_file_not_found():
    response = client.post("/api/update-mail-draft/nonexistent", json={"suggested_changes": "Change something"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Text file not found"

def test_update_mail_draft_success(monkeypatch):
    # Mock OpenAI response
    async def mock_update_mail_draft(text, filename, suggested_changes):
        from app.models.schema import MailDraftResponse
        return MailDraftResponse(
            subject="Updated Subject",
            greeting="Dear Team",
            body="This is an updated email body.",
            closing="Regards",
            signature="Updated Signature",
            error=None
        )
    monkeypatch.setattr("app.services.mail_draft.update_mail_draft", mock_update_mail_draft)

    response = client.post(f"/api/update-mail-draft/{TEST_FILENAME}", json={"suggested_changes": "Change something"})
    assert response.status_code == 200
    data = response.json()
    
    
    
    