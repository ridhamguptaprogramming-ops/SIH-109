import json
import os
import logging
from typing import Dict, Any, Optional

from app.predictor import MastitisPredictor
from app.schemas import AnimalPredictionInput, PredictionResponse

logger = logging.getLogger(__name__)


class PredictionService:
    """
    Singleton service wrapper managing the MastitisPredictor lifecycle.
    Used by FastAPI routes to serve predictions.
    """

    _instance: Optional["PredictionService"] = None

    def __init__(self):
        self.predictor = MastitisPredictor()

    @classmethod
    def get_instance(cls) -> "PredictionService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def initialize(self) -> bool:
        """
        Loads ML model artifacts.
        """
        return self.predictor.load_artifacts()

    @property
    def is_model_loaded(self) -> bool:
        return self.predictor.is_loaded

    def predict(self, input_data: AnimalPredictionInput) -> PredictionResponse:
        """
        Executes prediction using the loaded model.
        """
        if not self.is_model_loaded:
            raise RuntimeError("ML service model is not loaded. Please train or load model artifacts first.")
        return self.predictor.predict(input_data)

    def predict_mock(self, mock_file_path: str) -> PredictionResponse:
        """
        Loads mock sensor data from JSON file and runs it through the EXACT SAME prediction pipeline.
        No separate/fake prediction path is used.
        """
        if not os.path.exists(mock_file_path):
            raise FileNotFoundError(f"Mock data file not found at path: {mock_file_path}")

        with open(mock_file_path, "r") as f:
            mock_data = json.load(f)

        # Handle list of mock records or single dict
        if isinstance(mock_data, list) and len(mock_data) > 0:
            sample = mock_data[0]
        elif isinstance(mock_data, dict):
            sample = mock_data
        else:
            raise ValueError("Mock JSON file must contain a dictionary or non-empty list of dictionaries.")

        validated_input = AnimalPredictionInput(**sample)
        return self.predict(validated_input)
