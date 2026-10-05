import json
import logging
from typing import Dict, Any
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
)

logger = logging.getLogger(__name__)


def evaluate_model_performance(model_name: str, model: Any, X_test: Any, y_test: Any) -> Dict[str, Any]:
    """
    Evaluates a trained classifier on test data and returns a dictionary of evaluation metrics.
    """
    y_pred = model.predict(X_test)
    
    if hasattr(model, "predict_proba"):
        y_prob = model.predict_proba(X_test)
        y_score = y_prob[:, 1] if y_prob.shape[1] > 1 else y_prob[:, 0]
    else:
        y_score = y_pred

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    
    try:
        roc_auc = float(roc_auc_score(y_test, y_score))
    except Exception:
        roc_auc = 0.0

    try:
        pr_auc = float(average_precision_score(y_test, y_score))
    except Exception:
        pr_auc = 0.0

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = [int(val) for val in cm.ravel()] if cm.shape == (2, 2) else (0, 0, 0, 0)

    metrics = {
        "model_name": model_name,
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "pr_auc": round(pr_auc, 4),
        "confusion_matrix": {
            "true_negatives": tn,
            "false_positives": fp,
            "false_negatives": fn,
            "true_positives": tp,
        },
        "evaluation_type": "DEMO_SYNTHETIC_EVALUATION"
    }

    return metrics


def print_evaluation_summary(metrics_dict: Dict[str, Dict[str, Any]]):
    """
    Prints a formatted side-by-side comparison table of evaluation results.
    """
    model_names = list(metrics_dict.keys())
    print("\n" + "=" * 75)
    print("           MODEL EVALUATION METRICS COMPARISON           ")
    print("=" * 75)

    headers = [f"{m:<22}" for m in model_names]
    header_str = " | ".join(headers)
    print(f"{'Metric':<20} | {header_str}")
    print("-" * 75)

    for metric_key in ["accuracy", "precision", "recall", "f1_score", "roc_auc", "pr_auc"]:
        vals = [f"{str(metrics_dict[m].get(metric_key, 'N/A')):<22}" for m in model_names]
        val_str = " | ".join(vals)
        print(f"{metric_key:<20} | {val_str}")

    print("-" * 75)
    print("Confusion Matrix (TN, FP, FN, TP):")
    for m in model_names:
        print(f"  {m:<28}: {metrics_dict[m].get('confusion_matrix', {})}")
    print("=" * 75 + "\n")
