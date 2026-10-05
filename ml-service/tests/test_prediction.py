import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.prediction_service import PredictionService

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_model():
    """
    Ensures model artifacts are loaded or generated before running prediction tests.
    """
    service = PredictionService.get_instance()
    if not service.is_model_loaded:
        from training.train import train_pipeline
        train_pipeline()
        service.initialize()


def test_predict_valid_request():
    payload = {
        "animal_id": "C102",
        "timestamp": "2026-10-05T12:00:00Z",
        "age": 4.5,
        "breed": "Holstein-Friesian",
        "lactation_number": 2,
        "previous_mastitis": 1,
        "vaccination_status": "UP_TO_DATE",
        "milk_yield": 21.2,
        "somatic_cell_count": 520.0,
        "milk_temperature": 39.4,
        "milk_conductivity": 7.1,
        "milk_ph": 6.9,
        "body_temperature": 39.3,
        "activity_level": 390.0,
        "rumination": 280.0,
        "feeding_behavior": 190.0,
        "environmental_temperature": 29.0,
        "humidity": 68.0,
        "farm_hygiene_score": 6.5,
        "housing_condition_score": 7.5,
        "milking_frequency": 2,
        "historical_readings": [
            {
                "timestamp": "2026-10-01T12:00:00Z",
                "somatic_cell_count": 180.0,
                "milk_yield": 29.0,
                "body_temperature": 38.4,
                "milk_conductivity": 5.2,
                "activity_level": 580.0,
                "rumination": 480.0
            }
        ]
    }

    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["animal_id"] == "C102"
    assert "prediction" in data
    assert "risk_score" in data["prediction"]
    assert 0.0 <= data["prediction"]["risk_score"] <= 1.0
    assert data["prediction"]["risk_level"] in ["NO_RISK", "LOW", "MODERATE", "HIGH"]
    assert "risk_factors" in data
    assert isinstance(data["risk_factors"], list)
    assert "recommendations" in data
    assert isinstance(data["recommendations"], list)
    assert "disclaimer" in data


def test_predict_invalid_request():
    # Missing required fields like age, milk_yield, etc.
    invalid_payload = {
        "animal_id": "C999",
        "somatic_cell_count": 90000.0  # Invalid range validation (> 10000)
    }

    response = client.post("/predict", json=invalid_payload)
    assert response.status_code == 422  # Unprocessable Entity (Validation error)


def test_predict_mock_endpoint():
    response = client.post("/predict/mock")
    assert response.status_code == 200
    data = response.json()
    assert "animal_id" in data
    assert "prediction" in data
    assert "risk_score" in data["prediction"]
