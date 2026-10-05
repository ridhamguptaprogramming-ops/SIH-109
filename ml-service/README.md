# Bovine Mastitis Early Risk Prediction ML Service

An end-to-end Machine Learning / Artificial Intelligence microservice for early risk forecasting (7–14 days in advance) of bovine mastitis before clinical symptoms become visible.

---

## 📌 1. What the ML Service Does

Bovine mastitis is a costly inflammatory disease affecting dairy cows. Early detection during the subclinical phase allows farm managers to take preventive actions before milk production severely drops or irreversible udder damage occurs.

This ML Service provides:
- **Individual Animal Risk Forecasting**: Probabilistic risk estimation (0–100%) for mastitis onset over a 7–14 day forecast window.
- **Risk Classification**: Configurable categorization into `NO_RISK`, `LOW`, `MODERATE`, or `HIGH`.
- **Temporal Feature Engineering**: Automated extraction of rolling 3-day/7-day trends for Somatic Cell Count (SCC), milk yield, rumination, activity, and milk conductivity.
- **Explainability (SHAP)**: Identifies the top positive (risk-increasing) and negative (risk-reducing) physiological factors per prediction.
- **Decision-Support Recommendations**: Conservative, non-diagnostic action guidelines based on predicted risk level and physiological anomalies.
- **Backend-Agnostic REST API**: FastAPI interface ready for integration with IoT backend systems.

---

## 🏗️ 2. Architecture & Integration Flow

The production system architecture follows a decoupled microservices pattern:

```
Hardware / IoT Sensors
         │
         ▼
  Node.js / Express Backend
         │
         ▼ (POST /predict - JSON Payload)
   FastAPI ML Service
         │
         ▼ (Preprocessing + XGBoost + SHAP)
   Prediction Result JSON
         │
         ▼
  Node.js / Express Backend
         │
         ▼
  Frontend React Dashboard
```

> **Note**: The ML service operates completely independently. During development while the backend is under construction, test data and mock endpoints (`POST /predict/mock`) allow full testing without relying on backend services.

---

## 📁 3. Folder Structure

```
ml-service/
├── app/
│   ├── __init__.py          # App package initialization
│   ├── main.py              # FastAPI application & REST route handlers
│   ├── config.py            # Environment configuration settings
│   ├── schemas.py           # Pydantic input/output validation schemas
│   ├── predictor.py         # Model loading & inference engine
│   ├── preprocessing.py     # Feature preprocessor pipeline (scaling, encoding, imputation)
│   ├── features.py          # Time-series temporal feature engineering
│   ├── explainability.py    # SHAP feature importance calculation
│   ├── recommendations.py   # Conservative rule-based recommendation engine
│   └── services/
│       ├── __init__.py
│       └── prediction_service.py # Singleton service manager for ML operations
│
├── data/
│   ├── mock_sensor_data.json  # Sample input payload for testing
│   └── README.md              # Data documentation
│
├── training/
│   ├── train.py                 # Time-aware training & model selection script
│   ├── evaluate.py              # Model evaluation metrics & summary reporter
│   ├── generate_demo_dataset.py # Synthetic time-series demo dataset generator
│   └── README.md                # Training documentation
│
├── models/
│   ├── mastitis_model.joblib   # Serialized trained model artifact
│   ├── preprocessor.joblib     # Serialized feature preprocessor pipeline
│   ├── model_metadata.json     # Model version & evaluation metadata
│   └── .gitkeep
│
├── tests/
│   ├── test_health.py       # Pytest unit test for /health endpoint
│   ├── test_prediction.py   # Pytest unit tests for /predict and /predict/mock
│   └── test_preprocessing.py # Pytest unit tests for temporal feature pipeline
│
├── scripts/
│   └── run_demo.py          # Terminal CLI script for end-to-end demo execution
│
├── requirements.txt         # Python dependencies list
├── .env.example             # Template for environment variables
├── .gitignore               # Git ignore patterns
├── Dockerfile               # Container deployment configuration
└── README.md                # Project documentation
```

---

## ⚙️ 4. Installation & Virtual Environment Setup

Ensure Python 3.11+ is installed.

```bash
# 1. Navigate to ml-service directory
cd ml-service

# 2. Create virtual environment
python3 -m venv .venv

# 3. Activate virtual environment
# On macOS/Linux:
source .venv/bin/activate
# On Windows:
# .venv\Scripts\activate

# 4. Install dependencies
pip install -r requirements.txt
```

---

## 🧪 5. Generating Demo Dataset & Training the Model

Before running predictions, generate the synthetic training dataset and train the baseline/XGBoost models.

### Step 1: Generate Demo Dataset
```bash
python training/generate_demo_dataset.py --cows 60 --days 30
```

> ⚠️ **DEMO DATASET DISCLAIMER**: The synthetic dataset generated is **for pipeline testing and demonstration purposes only**. Synthetic labels (`mastitis_risk_7_14_days`) are not medically validated.

### Step 2: Run Model Training & Selection
```bash
python training/train.py
```

This will:
- Compute time-aware temporal features (rolling SCC, milk yield, rumination, temperature trends).
- Perform a **time-aware train/test split** (75% past dates for training, 25% future dates for testing) to prevent future data leakage.
- Handle class imbalance using `scale_pos_weight` for XGBoost.
- Train both `LogisticRegression` baseline and `XGBoostClassifier`.
- Print evaluation comparison metrics (Accuracy, Precision, Recall, F1, ROC-AUC, PR-AUC, Confusion Matrix).
- Select the best performing model and export serialized artifacts to `models/`.

---

## 🚀 6. Starting FastAPI & Testing Endpoints

### Start Uvicorn Web Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API docs will be available interactively at: `http://localhost:8000/docs`

### 1. Test Health Endpoint (`GET /health`)
```bash
curl -X GET http://localhost:8000/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "service": "mastitis-ml-service",
  "model_loaded": true,
  "model_version": "1.0.0-demo"
}
```

### 2. Test Prediction via Mock Endpoint (`POST /predict/mock`)
```bash
curl -X POST http://localhost:8000/predict/mock
```

### 3. Test Prediction with Sample JSON Payload (`POST /predict`)
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

**Sample Prediction Output**:
```json
{
  "animal_id": "C102",
  "prediction": {
    "risk_score": 0.8642,
    "risk_percentage": 86.42,
    "risk_level": "HIGH",
    "prediction_window": "7-14 days"
  },
  "risk_factors": [
    {
      "feature": "somatic_cell_count",
      "impact": "positive",
      "importance": 0.35
    },
    {
      "feature": "milk_conductivity",
      "impact": "positive",
      "importance": 0.28
    }
  ],
  "recommendations": [
    "Increase individual animal monitoring frequency to 2-3 times daily.",
    "Inspect udder visually and perform California Mastitis Test (CMT) or foremilk examination.",
    "Consider isolating milk from bulk tank pending clinical evaluation.",
    "Schedule immediate veterinary examination for diagnostic confirmation."
  ],
  "model_version": "1.0.0-demo",
  "prediction_timestamp": "2026-10-05T16:00:00Z",
  "disclaimer": "Notice: This prediction is an AI decision-support estimation for early risk warning and NOT a formal veterinary diagnosis."
}
```

---

## 🖥️ 7. Running the End-to-End Demo Script

You can execute a complete terminal demonstration using:

```bash
python scripts/run_demo.py
```

This reads `data/mock_sensor_data.json` and runs it through the exact same inference pipeline, printing a formatted console report.

---

## 🔌 8. Backend Integration Guide

When the Node.js/Express backend is ready, it can invoke the ML Service using standard HTTP REST requests.

### Example Node.js / Express Integration Code (`backend/src/services/mlService.js`)

```javascript
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Sends telemetry data to ML Service for early mastitis risk prediction.
 */
async function getMastitisRiskPrediction(animalTelemetry) {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, {
      animal_id: animalTelemetry.animalId,
      timestamp: animalTelemetry.timestamp,
      age: animalTelemetry.age,
      breed: animalTelemetry.breed || 'Holstein',
      lactation_number: animalTelemetry.lactationNumber || 1,
      previous_mastitis: animalTelemetry.previousMastitisCount || 0,
      vaccination_status: animalTelemetry.vaccinationStatus || 'UP_TO_DATE',
      milk_yield: animalTelemetry.milkYield,
      somatic_cell_count: animalTelemetry.somaticCellCount,
      milk_temperature: animalTelemetry.milkTemperature,
      milk_conductivity: animalTelemetry.milkConductivity,
      milk_ph: animalTelemetry.milkPh || 6.6,
      body_temperature: animalTelemetry.bodyTemperature,
      activity_level: animalTelemetry.activityLevel,
      rumination: animalTelemetry.rumination,
      feeding_behavior: animalTelemetry.feedingBehavior || 200,
      environmental_temperature: animalTelemetry.envTemp || 25,
      humidity: animalTelemetry.humidity || 60,
      farm_hygiene_score: animalTelemetry.farmHygiene || 7.5,
      housing_condition_score: animalTelemetry.housingScore || 7.5,
      milking_frequency: animalTelemetry.milkingFrequency || 2,
      historical_readings: animalTelemetry.historicalReadings || []
    });

    return response.data;
  } catch (error) {
    console.error('Error contacting ML Service:', error.response?.data || error.message);
    throw new Error('ML Prediction Service unavailable');
  }
}

module.exports = { getMastitisRiskPrediction };
```

---

## 🧪 9. Running Automated Tests

Run unit and integration tests using `pytest`:

```bash
pytest
```

---

## 🐳 10. Docker Deployment

To build and run the ML Service inside a container:

```bash
# Build Docker image
docker build -t mastitis-ml-service .

# Run Docker container on port 8000
docker run -d -p 8000:8000 --name mastitis-ml mastitis-ml-service
```

---

## ⚠️ 11. Model Limitations & Real-World Validation Requirements

1. **Synthetic Baseline Model**: The current model is trained on synthetic data for pipeline verification. It cannot be used for clinical diagnosis.
2. **7–14 Day Target Validation**: True 7–14 day forecasting accuracy requires long-term longitudinal real-world sensor datasets validated against clinical veterinary records (CMT or bacterial culture diagnostic tests).
3. **Replacing Synthetic Data with Real Data**:
   - Save real farm sensor logs to CSV/Parquet formatted according to the schema in `app/schemas.py`.
   - Re-run `python training/train.py` pointing to the real dataset path.
   - Re-calibrate probability thresholds in `.env` (`RISK_THRESHOLD_LOW`, `RISK_THRESHOLD_MODERATE`, `RISK_THRESHOLD_HIGH`).
