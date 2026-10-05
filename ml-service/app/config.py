import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env if present
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


class Settings:
    """
    Application configuration settings loaded from environment variables or defaults.
    """
    SERVICE_NAME: str = os.getenv("SERVICE_NAME", "mastitis-ml-service")
    ML_SERVICE_HOST: str = os.getenv("ML_SERVICE_HOST", "0.0.0.0")
    ML_SERVICE_PORT: int = int(os.getenv("ML_SERVICE_PORT", "8000"))
    
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    MODEL_PATH: str = os.getenv("MODEL_PATH", str(BASE_DIR / "models" / "mastitis_model.joblib"))
    PREPROCESSOR_PATH: str = os.getenv("PREPROCESSOR_PATH", str(BASE_DIR / "models" / "preprocessor.joblib"))
    METADATA_PATH: str = os.getenv("METADATA_PATH", str(BASE_DIR / "models" / "model_metadata.json"))
    MOCK_DATA_PATH: str = os.getenv("MOCK_DATA_PATH", str(BASE_DIR / "data" / "mock_sensor_data.json"))
    
    # Risk thresholds (configurable, default values for early warning model)
    RISK_THRESHOLD_LOW: float = float(os.getenv("RISK_THRESHOLD_LOW", "0.25"))
    RISK_THRESHOLD_MODERATE: float = float(os.getenv("RISK_THRESHOLD_MODERATE", "0.50"))
    RISK_THRESHOLD_HIGH: float = float(os.getenv("RISK_THRESHOLD_HIGH", "0.75"))
    
    MODEL_VERSION: str = os.getenv("MODEL_VERSION", "1.0.0-demo")
    PREDICTION_WINDOW: str = os.getenv("PREDICTION_WINDOW", "7-14 days")


settings = Settings()
