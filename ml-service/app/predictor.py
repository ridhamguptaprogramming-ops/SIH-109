import os
import json
import logging
from datetime import datetime
from typing import Dict, Any, Tuple, Optional
import joblib
import pandas as pd
import numpy as np

from app.config import settings
from app.schemas import AnimalPredictionInput, PredictionResponse, PredictionDetail, RiskFactor
from app.preprocessing import MastitisPreprocessor
from app.explainability import SHAPExplainerService
from app.recommendations import RecommendationEngine

logger = logging.getLogger(__name__)


class MastitisPredictor:
    """
    Inference predictor encapsulating model loading, feature preprocessing,
    risk scoring, SHAP explainability, and recommendation generation.
    """

    def __init__(
        self,
        model_path: str = settings.MODEL_PATH,
        preprocessor_path: str = settings.PREPROCESSOR_PATH,
        metadata_path: str = settings.METADATA_PATH,
    ):
        self.model_path = model_path
        self.preprocessor_path = preprocessor_path
        self.metadata_path = metadata_path
        
        self.model: Optional[Any] = None
        self.preprocessor: Optional[MastitisPreprocessor] = None
        self.metadata: Dict[str, Any] = {}
        self.explainer_service: Optional[SHAPExplainerService] = None

    def load_artifacts(self) -> bool:
        """
        Loads pre-trained model, preprocessor pipeline, and metadata from disk.
        Returns True if successful, False otherwise.
        """
        try:
            if not os.path.exists(self.model_path):
                logger.error(f"Model file not found at path: {self.model_path}")
                return False

            if not os.path.exists(self.preprocessor_path):
                logger.error(f"Preprocessor file not found at path: {self.preprocessor_path}")
                return False

            logger.info(f"Loading model from {self.model_path}...")
            self.model = joblib.load(self.model_path)

            logger.info(f"Loading preprocessor from {self.preprocessor_path}...")
            self.preprocessor = MastitisPreprocessor.load(self.preprocessor_path)

            if os.path.exists(self.metadata_path):
                with open(self.metadata_path, "r") as f:
                    self.metadata = json.load(f)

            # Initialize SHAP service
            feature_names = getattr(self.preprocessor, "feature_names", [])
            self.explainer_service = SHAPExplainerService(self.model, feature_names)

            logger.info("All ML model artifacts loaded successfully.")
            return True

        except Exception as e:
            logger.exception(f"Failed to load ML model artifacts: {e}")
            return False

    @property
    def is_loaded(self) -> bool:
        return self.model is not None and self.preprocessor is not None

    def determine_risk_level(self, score: float) -> str:
        """
        Categorizes continuous risk score into configured risk levels.
        """
        if score < settings.RISK_THRESHOLD_LOW:
            return "NO_RISK"
        elif score < settings.RISK_THRESHOLD_MODERATE:
            return "LOW"
        elif score < settings.RISK_THRESHOLD_HIGH:
            return "MODERATE"
        else:
            return "HIGH"

    def predict(self, input_data: AnimalPredictionInput) -> PredictionResponse:
        """
        Runs complete inference pipeline for a given AnimalPredictionInput.
        """
        if not self.is_loaded:
            raise RuntimeError("ML Model is not loaded. Ensure artifacts are present and load_artifacts() was called.")

        # Convert input Pydantic schema to dict
        raw_dict = input_data.model_dump() if hasattr(input_data, "model_dump") else input_data.dict()
        animal_id = raw_dict.get("animal_id", "UNKNOWN")

        # 1. Preprocess data (including temporal feature engineering)
        processed_df = self.preprocessor.transform([raw_dict])

        # 2. Model prediction (probabilistic output)
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(processed_df)
            risk_score = float(probs[0][1]) if probs.shape[1] > 1 else float(probs[0][0])
        else:
            # Fallback to decision function or binary output if predict_proba unavailable
            preds = self.model.predict(processed_df)
            risk_score = float(preds[0])

        # Clip risk score between 0.00 and 1.00
        risk_score = float(np.clip(risk_score, 0.0, 1.0))
        risk_percentage = round(risk_score * 100.0, 2)
        risk_level = self.determine_risk_level(risk_score)

        # 3. Explainability using SHAP
        risk_factors: list[RiskFactor] = []
        if self.explainer_service:
            risk_factors = self.explainer_service.explain_instance(processed_df, top_n=4)

        # 4. Actionable recommendations
        recommendations = RecommendationEngine.generate_recommendations(risk_level, risk_factors)

        model_version = self.metadata.get("model_version", settings.MODEL_VERSION)
        prediction_window = self.metadata.get("prediction_window", settings.PREDICTION_WINDOW)

        prediction_detail = PredictionDetail(
            risk_score=round(risk_score, 4),
            risk_percentage=risk_percentage,
            risk_level=risk_level,
            prediction_window=prediction_window
        )

        return PredictionResponse(
            animal_id=animal_id,
            prediction=prediction_detail,
            risk_factors=risk_factors,
            recommendations=recommendations,
            model_version=model_version,
            prediction_timestamp=datetime.utcnow().isoformat() + "Z"
        )
