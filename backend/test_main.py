import os
import pytest
from fastapi import status
from fastapi.testclient import TestClient

# Import main after overriding DB_FILE configuration
import backend.main as main
from backend.main import app

@pytest.fixture(autouse=True)
def setup_test_db(monkeypatch, tmp_path):
    # Set DB_FILE to a temporary sqlite db path for isolation
    test_db = str(tmp_path / "test_backend.db")
    monkeypatch.setattr(main, "DB_FILE", test_db)
    main.init_db()
    yield

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def auth_headers(client):
    # Register and login a test user to get auth headers
    user_data = {"username": "testuser", "password": "password123"}
    register_response = client.post("/api/auth/register", json=user_data)
    assert register_response.status_code == status.HTTP_201_CREATED
    token = register_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

# --- Auth Tests ---
def test_register_success(client):
    response = client.post("/api/auth/register", json={"username": "newuser", "password": "securepassword"})
    assert response.status_code == status.HTTP_201_CREATED
    assert "access_token" in response.json()
    assert response.json()["username"] == "newuser"

def test_register_duplicate_username(client):
    user_data = {"username": "dupuser", "password": "password123"}
    client.post("/api/auth/register", json=user_data)
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "Username is already taken"

def test_login_success(client):
    user_data = {"username": "loginuser", "password": "password123"}
    client.post("/api/auth/register", json=user_data)
    response = client.post("/api/auth/login", json=user_data)
    assert response.status_code == status.HTTP_200_OK
    assert "access_token" in response.json()

def test_login_invalid_credentials(client):
    response = client.post("/api/auth/login", json={"username": "nonexistent", "password": "wrongpassword"})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Incorrect username or password"

# --- Profile CRUD Tests ---
def test_get_profile_unauthorized(client):
    response = client.get("/api/profile")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_save_and_get_profile_success(client, auth_headers):
    profile_data = {
        "transport": "ev",
        "food": "vegetarian",
        "electricity": 250.0,
        "shopping": 5.0,
        "waste": "full_recycling"
    }
    # Save profile
    save_response = client.post("/api/profile", json=profile_data, headers=auth_headers)
    assert save_response.status_code == status.HTTP_200_OK
    assert save_response.json()["message"] == "Profile synced successfully"

    # Fetch profile
    get_response = client.get("/api/profile", headers=auth_headers)
    assert get_response.status_code == status.HTTP_200_OK
    assert get_response.json()["profile"] == profile_data

# --- Recommendations CRUD Tests ---
def test_add_and_get_recommendations(client, auth_headers):
    rec_data = {
        "action": "Switch to LED bulbs",
        "reason": "Reduces electricity emissions.",
        "impact_score": 85
    }
    # Save recommendation
    save_response = client.post("/api/recommendations", json=rec_data, headers=auth_headers)
    assert save_response.status_code == status.HTTP_200_OK
    assert "id" in save_response.json()

    # Get recommendations
    get_response = client.get("/api/recommendations", headers=auth_headers)
    assert get_response.status_code == status.HTTP_200_OK
    recs = get_response.json()["recommendations"]
    assert len(recs) == 1
    assert recs[0]["action"] == "Switch to LED bulbs"

# --- Carbon History CRUD Tests ---
def test_add_and_get_history(client, auth_headers):
    history_data = {
        "total_emission": 4500.5,
        "carbon_score": 68
    }
    # Save history
    save_response = client.post("/api/history", json=history_data, headers=auth_headers)
    assert save_response.status_code == status.HTTP_200_OK

    # Get history
    get_response = client.get("/api/history", headers=auth_headers)
    assert get_response.status_code == status.HTTP_200_OK
    hist = get_response.json()["history"]
    assert len(hist) == 1
    assert hist[0]["total_emission"] == 4500.5

# --- Weekly Challenges CRUD Tests ---
def test_challenges_flow(client, auth_headers):
    challenge_data = {
        "challenge": "Walk instead of driving twice a week",
        "difficulty": "Low",
        "estimated_co2_reduction": "15 kg",
        "completion_reward": 150
    }
    # Add challenge
    add_response = client.post("/api/challenges", json=challenge_data, headers=auth_headers)
    assert add_response.status_code == status.HTTP_200_OK
    challenge_id = add_response.json()["id"]

    # Get challenges and verify it's not completed yet
    get_response = client.get("/api/challenges", headers=auth_headers)
    challenges = get_response.json()["challenges"]
    assert len(challenges) == 1
    assert challenges[0]["completed"] is False

    # Complete challenge
    complete_response = client.post(f"/api/challenges/{challenge_id}/complete", headers=auth_headers)
    assert complete_response.status_code == status.HTTP_200_OK

    # Get challenges and verify completion
    get_response = client.get("/api/challenges", headers=auth_headers)
    challenges = get_response.json()["challenges"]
    assert challenges[0]["completed"] is True

# --- Analytics Tests ---
def test_analytics_calculation(client, auth_headers):
    # Verify default state
    empty_response = client.get("/api/analytics", headers=auth_headers)
    assert empty_response.status_code == status.HTTP_200_OK
    assert empty_response.json()["averageEmission"] == 0.0

    # Add multiple history logs
    client.post("/api/history", json={"total_emission": 5000.0, "carbon_score": 60}, headers=auth_headers)
    client.post("/api/history", json={"total_emission": 4000.0, "carbon_score": 75}, headers=auth_headers)

    # Fetch analytics
    analytics_response = client.get("/api/analytics", headers=auth_headers)
    assert analytics_response.status_code == status.HTTP_200_OK
    data = analytics_response.json()
    assert data["averageEmission"] == 4500.0
    assert data["totalReduction"] == 1000.0
    assert data["currentCarbonScore"] == 75

# --- Calculate Emissions Endpoint Tests ---
def test_calculate_emissions(client):
    payload = {
        "transport": "hybrid",
        "food": "vegetarian",
        "electricity": 200.0,
        "shopping": 2.0,
        "waste": "partial_recycling"
    }
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == status.HTTP_200_OK
    report = response.json()["report"]
    # Transport hybrid = 1200
    assert report["transportEmission"]["yearly"] == 1200
    # Food vegetarian = 600
    assert report["foodEmission"]["yearly"] == 600
    # Energy electricity = 200 * 0.82 * 12 = 1968
    assert report["energyEmission"]["yearly"] == 1968

# --- Chatbot Endpoint Tests ---
def test_chat_success(client, monkeypatch):
    monkeypatch.setattr(main, "query_gemini", lambda user_prompt, system_prompt=None: "Mocked Gemini Response")
    chat_payload = {
        "message": "What is my biggest carbon source?",
        "profile": {
            "transport": "car",
            "food": "mixed",
            "electricity": 300,
            "shopping": 4,
            "waste": "no_recycling"
        },
        "emissions": {
            "transportEmission": {"yearly": 2400},
            "foodEmission": {"yearly": 1200},
            "energyEmission": {"yearly": 2952},
            "shoppingEmission": {"yearly": 480},
            "wasteEmission": {"yearly": 800},
            "totalEmission": {"yearly": 7832}
        },
        "recommendations": []
    }
    response = client.post("/api/chat", json=chat_payload)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["response"] == "Mocked Gemini Response"
    assert response.json()["source"] == "gemini"

def test_chat_fallback(client, monkeypatch):
    monkeypatch.setattr(main, "query_gemini", lambda user_prompt, system_prompt=None: None)
    chat_payload = {
        "message": "What is my biggest carbon source?",
        "profile": {
            "transport": "car",
            "food": "mixed",
            "electricity": 300,
            "shopping": 4,
            "waste": "no_recycling"
        },
        "emissions": {
            "transportEmission": {"yearly": 2400},
            "foodEmission": {"yearly": 1200},
            "energyEmission": {"yearly": 2952},
            "shoppingEmission": {"yearly": 480},
            "wasteEmission": {"yearly": 800},
            "totalEmission": {"yearly": 7832}
        },
        "recommendations": []
    }
    response = client.post("/api/chat", json=chat_payload)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["response"] is None
    assert response.json()["source"] == "fallback"
