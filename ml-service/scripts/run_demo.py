"""
End-to-End Demo Script for Bovine Mastitis Early Risk Prediction.

Usage:
  python scripts/run_demo.py

Loads mock sensor telemetry (data/mock_sensor_data.json) and runs it through the exact
same ML prediction pipeline used by the FastAPI service.
"""

import os
import sys
import json
import logging

# Add project root directory to python path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.services.prediction_service import PredictionService
from app.config import settings

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


def run_demo():
    print("\n" + "=" * 70)
    print("      BOVINE MASTITIS EARLY RISK PREDICTION - DEMO EXECUTION      ")
    print("=" * 70 + "\n")

    # 1. Initialize prediction service & load model artifacts
    service = PredictionService.get_instance()
    print("[1/3] Loading ML model artifacts and preprocessor...")
    success = service.initialize()
    if not success:
        print("\n[ERROR] Model artifacts not found. Automatically running training script...")
        from training.train import train_pipeline
        train_pipeline()
        service.initialize()

    mock_file = settings.MOCK_DATA_PATH
    print(f"[2/3] Reading mock sensor payload from: {mock_file}")

    # 2. Run prediction through prediction service
    print("[3/3] Running prediction through ML inference pipeline...\n")
    response = service.predict_mock(mock_file)

    # 3. Print formatted output
    print("=" * 70)
    print("                    PREDICTION RESULT SUMMARY                    ")
    print("=" * 70)
    print(f"Animal ID            : {response.animal_id}")
    print(f"Prediction Timestamp : {response.prediction_timestamp}")
    print(f"Prediction Window    : {response.prediction.prediction_window}")
    print(f"Risk Score           : {response.prediction.risk_score} ({response.prediction.risk_percentage}%)")
    print(f"Risk Level Category  : {response.prediction.risk_level}")
    print(f"Model Version        : {response.model_version}")
    print("-" * 70)
    print("TOP CONTRIBUTING RISK FACTORS (SHAP / Feature Impact):")
    for idx, factor in enumerate(response.risk_factors, 1):
        direction = "↑ Increases Risk" if factor.impact == "positive" else "↓ Decreases Risk"
        print(f"  {idx}. {factor.feature:<25} | {direction:<18} | Importance: {factor.importance}")

    print("-" * 70)
    print("RECOMMENDED DECISION-SUPPORT ACTIONS:")
    for idx, rec in enumerate(response.recommendations, 1):
        print(f"  {idx}. {rec}")

    print("-" * 70)
    print(f"DISCLAIMER: {response.disclaimer}")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    run_demo()
