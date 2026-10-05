import pytest
import pandas as pd
from app.features import compute_temporal_features
from app.preprocessing import MastitisPreprocessor


def test_compute_temporal_features_with_history():
    sample = {
        "animal_id": "C101",
        "somatic_cell_count": 500.0,
        "milk_yield": 20.0,
        "body_temperature": 39.2,
        "milk_conductivity": 6.8,
        "rumination": 300.0,
        "activity_level": 400.0,
        "historical_readings": [
            {"timestamp": "2026-10-01", "somatic_cell_count": 200.0, "milk_yield": 25.0, "body_temperature": 38.5, "milk_conductivity": 5.2, "rumination": 450.0, "activity_level": 550.0},
            {"timestamp": "2026-10-02", "somatic_cell_count": 250.0, "milk_yield": 24.0, "body_temperature": 38.6, "milk_conductivity": 5.5, "rumination": 430.0, "activity_level": 520.0},
            {"timestamp": "2026-10-03", "somatic_cell_count": 300.0, "milk_yield": 22.0, "body_temperature": 38.8, "milk_conductivity": 6.0, "rumination": 380.0, "activity_level": 480.0},
        ]
    }

    result = compute_temporal_features(sample)

    assert "scc_3d_avg" in result
    assert "scc_change_pct" in result
    assert "milk_yield_3d_avg" in result
    assert "milk_yield_change_pct" in result
    assert "temperature_trend" in result
    assert "conductivity_trend" in result
    assert result["scc_change_pct"] > 0  # 500 vs average 250 -> positive percentage change


def test_compute_temporal_features_without_history():
    sample = {
        "animal_id": "C102",
        "somatic_cell_count": 200.0,
        "milk_yield": 25.0,
        "body_temperature": 38.5,
        "milk_conductivity": 5.2,
        "rumination": 450.0,
        "activity_level": 550.0,
        "historical_readings": []
    }

    result = compute_temporal_features(sample)
    assert result["scc_3d_avg"] == 200.0
    assert result["scc_change_pct"] == 0.0
    assert result["temperature_trend"] == 0.0


def test_preprocessor_fit_transform():
    raw_samples = [
        {
            "animal_id": "C101",
            "age": 4.0,
            "breed": "Holstein",
            "lactation_number": 2,
            "previous_mastitis": 0,
            "vaccination_status": "UP_TO_DATE",
            "milk_yield": 25.0,
            "somatic_cell_count": 150.0,
            "milk_temperature": 38.5,
            "milk_conductivity": 5.2,
            "milk_ph": 6.6,
            "body_temperature": 38.4,
            "activity_level": 550.0,
            "rumination": 480.0,
            "feeding_behavior": 240.0,
            "environmental_temperature": 25.0,
            "humidity": 60.0,
            "farm_hygiene_score": 8.0,
            "housing_condition_score": 8.0,
            "milking_frequency": 2,
            "historical_readings": []
        }
    ]

    preprocessor = MastitisPreprocessor()
    transformed_df = preprocessor.fit_transform(raw_samples)
    assert isinstance(transformed_df, pd.DataFrame)
    assert not transformed_df.empty
    assert len(preprocessor.feature_names) == transformed_df.shape[1]
