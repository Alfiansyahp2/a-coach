from starlette.testclient import TestClient
from python_engine.main import app

client = TestClient(app)


def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data


def test_calculate_streak_endpoint():
    payload = {
        "activities": [
            {"start_date": "2026-11-08T01:33:00.000Z", "distance_meters": 10000}
        ],
        "workouts": [],
        "reference_date": "2026-11-08T12:00:00Z"
    }
    response = client.post("/calculate/streak", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["totalContributions"] == 1
    assert data["currentStreakWeeks"] == 1
    assert data["isFlameBurning"] is True
    assert data["heatTier"]["stage"] == 1
    assert data["heatTier"]["colorHex"] == "#EF4444"

