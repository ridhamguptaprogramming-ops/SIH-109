# ML Service - Model Training & Evaluation

This directory contains scripts for generating synthetic datasets, feature engineering, model training, evaluation, and artifact generation.

## Workflows

### 1. Generate Synthetic Dataset

```bash
python training/generate_demo_dataset.py --cows 60 --days 30 --output data/demo_mastitis_dataset.csv
```

> **Warning**: The synthetic dataset generated is explicitly labeled **DEMO / PIPELINE VERIFICATION ONLY**. The target labels (`mastitis_risk_7_14_days`) are synthetically calculated and are **NOT** medically validated.

### 2. Run Training Pipeline

```bash
python training/train.py
```

The training script executes the following steps:
1. Loads dataset or generates a synthetic dataset if not found.
2. Computes time-aware temporal features (rolling SCC, milk yield, rumination, activity, temperature trends) grouped per animal to avoid future data leakage.
3. Splits data using a time-aware boundary (75% past dates for training, 25% future dates for testing).
4. Handles class imbalance using `scale_pos_weight` for XGBoost and balanced class weights for Logistic Regression.
5. Trains both a baseline `LogisticRegression` model and an `XGBoostClassifier`.
6. Evaluates models on metrics: Accuracy, Precision, Recall, F1, ROC-AUC, PR-AUC, and Confusion Matrix.
7. Selects the superior model and exports serialized artifacts to `models/`:
   - `models/mastitis_model.joblib`: Serialized trained classifier model.
   - `models/preprocessor.joblib`: Serialized sklearn preprocessing transformer.
   - `models/model_metadata.json`: Model version, metrics, feature names, and split details.

### Data Splitting Strategy

Because early risk forecasting is a time-series task, standard random k-fold cross-validation or random train-test splitting causes **data leakage** (future sensor telemetry leaking into training set). We enforce a strictly **time-aware split** where training data contains past dates up to a threshold date, and evaluation is conducted strictly on subsequent future dates.
