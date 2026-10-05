import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.schemas import AnimalPredictionInput, PredictionResponse, HealthResponse
from app.services.prediction_service import PredictionService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI Lifespan context manager.
    Loads ML model artifacts into memory on startup.
    """
    logger.info("Initializing ML Service & loading model artifacts...")
    service = PredictionService.get_instance()
    success = service.initialize()
    if success:
        logger.info("Model artifacts loaded successfully on startup.")
    else:
        logger.warning(
            "Model artifacts could not be loaded on startup. "
            "Run training script (python training/train.py) to generate models."
        )
    yield
    logger.info("Shutting down ML Service...")


app = FastAPI(
    title="Bovine Mastitis Early Risk Prediction ML Service",
    description=(
        "Production-ready FastAPI service providing AI-enabled early risk forecasting (7-14 days) "
        "for bovine mastitis based on IoT sensor data, milk parameters, and historical temporal features."
    ),
    version=settings.MODEL_VERSION,
    lifespan=lifespan
)

# Enable CORS for backend/frontend integration testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def get_health():
    """
    Health check endpoint returning service status and model loading state.
    """
    service = PredictionService.get_instance()
    return HealthResponse(
        status="ok",
        service=settings.SERVICE_NAME,
        model_loaded=service.is_model_loaded,
        model_version=settings.MODEL_VERSION
    )


@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict(input_data: AnimalPredictionInput):
    """
    Predict mastitis risk for an individual animal given current and optional historical sensor telemetry.
    """
    service = PredictionService.get_instance()
    if not service.is_model_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML Model is not loaded. Please ensure the model has been trained and saved."
        )

    try:
        prediction_result = service.predict(input_data)
        return prediction_result
    except Exception as e:
        logger.exception("Error occurred during prediction processing.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction error: {str(e)}"
        )


@app.post("/predict/mock", response_model=PredictionResponse, tags=["Prediction Mock"])
async def predict_mock():
    """
    Test endpoint running mock sensor data through the EXACT SAME prediction pipeline.
    Useful for backend and frontend integration testing before real data feeds are attached.
    """
    service = PredictionService.get_instance()
    if not service.is_model_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML Model is not loaded. Please train the demo model first."
        )

    try:
        prediction_result = service.predict_mock(settings.MOCK_DATA_PATH)
        return prediction_result
    except Exception as e:
        logger.exception("Error occurred during mock prediction processing.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Mock prediction error: {str(e)}"
        )
