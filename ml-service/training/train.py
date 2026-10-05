"""
Model Training and Model Selection Pipeline for Bovine Mastitis Early Risk Prediction.

This script executes:
1. Dataset loading and verification.
2. Time-aware feature engineering (temporal aggregation per animal).
3. Leakage-free time-aware train/test data splitting.
4. Class imbalance handling.
5. Training Baseline model (Logistic Regression) vs XGBoost Classifier.
6. Rigorous metric evaluation (Precision, Recall, F1, ROC-AUC, PR-AUC).
7. Best model selection and artifact export (model, preprocessor, metadata).
"""

import os
import json
import logging
from datetime import datetime
import pandas as pd
import numpy as np
import joblib

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import HistGradientBoostingClassifier, GradientBoostingClassifier

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except (ImportError, Exception) as e:
    logger.warning(f"XGBoost library import unavailable ({e}). Falling back to HistGradientBoostingClassifier.")
    XGBOOST_AVAILABLE = False

import sys
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.preprocessing import MastitisPreprocessor
from training.generate_demo_dataset import generate_demo_dataset
from training.evaluate import evaluate_model_performance, print_evaluation_summary
DATASET_PATH = os.path.join(BASE_DIR, "data", "demo_mastitis_dataset.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")


def build_temporal_feature_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes time-aware rolling window features for historical telemetry per animal to prevent data leakage.
    """
    df = df.sort_values(by=["animal_id", "date"]).reset_index(drop=True)
    
    # Group by animal_id to calculate past rolling 3-day and 7-day averages (excluding current observation)
    grouped = df.groupby("animal_id")

    df["scc_3d_avg"] = grouped["somatic_cell_count"].transform(lambda x: x.shift(1).rolling(3, min_periods=1).mean()).fillna(df["somatic_cell_count"])
    df["scc_7d_avg"] = grouped["somatic_cell_count"].transform(lambda x: x.shift(1).rolling(7, min_periods=1).mean()).fillna(df["somatic_cell_count"])
    df["scc_change_pct"] = ((df["somatic_cell_count"] - df["scc_3d_avg"]) / (df["scc_3d_avg"] + 1e-5)) * 100.0

    df["milk_yield_3d_avg"] = grouped["milk_yield"].transform(lambda x: x.shift(1).rolling(3, min_periods=1).mean()).fillna(df["milk_yield"])
    df["milk_yield_7d_avg"] = grouped["milk_yield"].transform(lambda x: x.shift(1).rolling(7, min_periods=1).mean()).fillna(df["milk_yield"])
    df["milk_yield_change_pct"] = ((df["milk_yield"] - df["milk_yield_3d_avg"]) / (df["milk_yield_3d_avg"] + 1e-5)) * 100.0

    df["rumination_3d_avg"] = grouped["rumination"].transform(lambda x: x.shift(1).rolling(3, min_periods=1).mean()).fillna(df["rumination"])
    df["rumination_change_pct"] = ((df["rumination"] - df["rumination_3d_avg"]) / (df["rumination_3d_avg"] + 1e-5)) * 100.0

    df["activity_3d_avg"] = grouped["activity_level"].transform(lambda x: x.shift(1).rolling(3, min_periods=1).mean()).fillna(df["activity_level"])
    df["activity_change_pct"] = ((df["activity_level"] - df["activity_3d_avg"]) / (df["activity_3d_avg"] + 1e-5)) * 100.0

    df["temp_3d_avg"] = grouped["body_temperature"].transform(lambda x: x.shift(1).rolling(3, min_periods=1).mean()).fillna(df["body_temperature"])
    df["temperature_trend"] = df["body_temperature"] - df["temp_3d_avg"]

    df["cond_3d_avg"] = grouped["milk_conductivity"].transform(lambda x: x.shift(1).rolling(3, min_periods=1).mean()).fillna(df["milk_conductivity"])
    df["conductivity_trend"] = df["milk_conductivity"] - df["cond_3d_avg"]

    return df


def train_pipeline(data_path: str = DATASET_PATH, models_dir: str = MODELS_DIR):
    os.makedirs(models_dir, exist_ok=True)

    # 1. Load or generate dataset
    if not os.path.exists(data_path):
        logger.info(f"Dataset not found at {data_path}. Generating synthetic demo dataset...")
        df = generate_demo_dataset(num_cows=60, days=30, output_path=data_path)
    else:
        logger.info(f"Loading dataset from {data_path}...")
        df = pd.read_csv(data_path)

    # Target column
    target_col = "mastitis_risk_7_14_days"
    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' missing from dataset.")

    # 2. Time-aware feature engineering
    logger.info("Computing time-aware temporal features...")
    df = build_temporal_feature_dataset(df)

    # 3. Time-aware Data Splitting (Avoid data leakage by splitting on date)
    df["date"] = pd.to_datetime(df["date"])
    dates = df["date"].sort_values().unique()
    split_idx = int(len(dates) * 0.75)
    split_date = dates[split_idx]

    logger.info(f"Performing time-aware train/test split. Train dates <= {split_date.strftime('%Y-%m-%d')}, Test dates > {split_date.strftime('%Y-%m-%d')}")

    train_df = df[df["date"] <= split_date].copy()
    test_df = df[df["date"] > split_date].copy()

    y_train = train_df[target_col].values
    y_test = test_df[target_col].values

    # 4. Preprocessing Pipeline Fitting
    logger.info("Fitting feature preprocessor...")
    preprocessor = MastitisPreprocessor()
    X_train_proc = preprocessor.fit_transform(train_df)
    X_test_proc = preprocessor.transform(test_df)

    # Save preprocessor artifact early
    preprocessor_path = os.path.join(models_dir, "preprocessor.joblib")
    preprocessor.save(preprocessor_path)
    logger.info(f"Preprocessor saved to {preprocessor_path}")

    # 5. Handle class imbalance
    num_neg = np.sum(y_train == 0)
    num_pos = np.sum(y_train == 1)
    scale_pos_weight = float(num_neg / max(1, num_pos))
    logger.info(f"Class distribution: {num_neg} negative, {num_pos} positive. Calculated scale_pos_weight={scale_pos_weight:.2f}")

    # 6. Model 1: Baseline Logistic Regression
    logger.info("Training Baseline Model: Logistic Regression...")
    baseline_model = LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42)
    baseline_model.fit(X_train_proc, y_train)
    baseline_metrics = evaluate_model_performance("Baseline_LogisticRegression", baseline_model, X_test_proc, y_test)

    # 7. Model 2: XGBoost / Gradient Boosting Classifier
    logger.info("Training Advanced Model (XGBoost / Gradient Boosting)...")
    if XGBOOST_AVAILABLE:
        adv_model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.05,
            scale_pos_weight=scale_pos_weight,
            random_state=42,
            eval_metric="logloss"
        )
        adv_model_name = "XGBoost"
    else:
        adv_model = HistGradientBoostingClassifier(
            max_iter=100,
            max_depth=5,
            learning_rate=0.05,
            random_state=42
        )
        adv_model_name = "GradientBoosting"

    adv_model.fit(X_train_proc, y_train)
    adv_metrics = evaluate_model_performance(adv_model_name, adv_model, X_test_proc, y_test)

    # 8. Compare models & display evaluation summary
    all_metrics = {
        "Baseline_LogisticRegression": baseline_metrics,
        adv_model_name: adv_metrics
    }
    print_evaluation_summary(all_metrics)

    # 9. Model Selection: Select model with best F1 / Recall score
    selected_name = adv_model_name if adv_metrics["f1_score"] >= baseline_metrics["f1_score"] else "Baseline_LogisticRegression"
    selected_model = adv_model if selected_name == adv_model_name else baseline_model
    selected_metrics = adv_metrics if selected_name == adv_model_name else baseline_metrics
    logger.info(f"Selected Model: {selected_name} (F1 Score: {selected_metrics['f1_score']})")

    # 10. Save Selected Model and Metadata
    model_path = os.path.join(models_dir, "mastitis_model.joblib")
    joblib.dump(selected_model, model_path)
    logger.info(f"Selected model saved to {model_path}")

    metadata = {
        "model_type": selected_name,
        "model_version": "1.0.0-demo",
        "training_timestamp": datetime.utcnow().isoformat() + "Z",
        "dataset_type": "SYNTHETIC_DEMO_DATASET",
        "prediction_window": "7-14 days",
        "metrics": selected_metrics,
        "all_model_evaluations": all_metrics,
        "feature_names": preprocessor.feature_names,
        "train_samples": len(train_df),
        "test_samples": len(test_df),
        "split_strategy": f"Time-aware split at {split_date.strftime('%Y-%m-%d')}"
    }

    metadata_path = os.path.join(models_dir, "model_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    logger.info(f"Model metadata saved to {metadata_path}")
    print(f"\nTraining pipeline completed successfully. Artifacts exported to '{models_dir}'.")
    return selected_model, preprocessor, metadata


if __name__ == "__main__":
    train_pipeline()
