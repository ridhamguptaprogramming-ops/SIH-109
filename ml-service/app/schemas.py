from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class HistoricalReading(BaseModel):
    """
    Historical sensor/milking reading for a single past observation.
    """
    timestamp: str = Field(..., description="Timestamp of the observation (ISO format or YYYY-MM-DD)")
    somatic_cell_count: Optional[float] = Field(None, description="SCC reading (x1000 cells/mL)")
    milk_yield: Optional[float] = Field(None, description="Daily milk yield in kg or L")
    body_temperature: Optional[float] = Field(None, description="Body temperature in Celsius")
    milk_conductivity: Optional[float] = Field(None, description="Milk electrical conductivity in mS/cm")
    activity_level: Optional[float] = Field(None, description="Daily activity score / step count")
    rumination: Optional[float] = Field(None, description="Daily rumination time in minutes")


class AnimalPredictionInput(BaseModel):
    """
    Standardized API input schema for animal mastitis risk prediction.
    Supports single current reading + optional historical telemetry sequence.
    """
    animal_id: str = Field(..., description="Unique animal identifier (e.g. C102)")
    timestamp: Optional[str] = Field(
        default_factory=lambda: datetime.utcnow().isoformat(),
        description="Timestamp of observation"
    )
    
    # Animal Contextual / Demographic Features
    age: float = Field(..., ge=0, le=30, description="Age of the animal in years")
    breed: str = Field(default="Holstein", description="Breed of the bovine")
    lactation_number: int = Field(default=1, ge=1, le=15, description="Lactation cycle number")
    previous_mastitis: int = Field(default=0, ge=0, le=10, description="Number of past mastitis occurrences (0 if none)")
    vaccination_status: str = Field(default="UP_TO_DATE", description="Status of vaccinations")
    
    # Current Sensor / Milk Measurements
    milk_yield: float = Field(..., ge=0.0, le=100.0, description="Current milk yield in kg or liters")
    somatic_cell_count: float = Field(..., ge=0.0, le=10000.0, description="Somatic Cell Count (SCC) x1000 cells/mL")
    milk_temperature: float = Field(..., ge=20.0, le=45.0, description="Milk temperature in Celsius")
    milk_conductivity: float = Field(..., ge=1.0, le=20.0, description="Milk electrical conductivity in mS/cm")
    milk_ph: float = Field(..., ge=5.0, le=8.5, description="Milk pH value")
    body_temperature: float = Field(..., ge=35.0, le=43.0, description="Body temperature in Celsius")
    activity_level: float = Field(..., ge=0.0, le=20000.0, description="Daily activity level/steps index")
    rumination: float = Field(..., ge=0.0, le=1440.0, description="Daily rumination time in minutes")
    feeding_behavior: float = Field(..., ge=0.0, le=1440.0, description="Daily feeding duration in minutes")
    
    # Environmental & Farm Hygiene Context
    environmental_temperature: float = Field(..., ge=-30.0, le=60.0, description="Ambient temperature in Celsius")
    humidity: float = Field(..., ge=0.0, le=100.0, description="Relative ambient humidity percentage")
    farm_hygiene_score: float = Field(..., ge=1.0, le=10.0, description="Farm hygiene score (1=Poor, 10=Excellent)")
    housing_condition_score: float = Field(..., ge=1.0, le=10.0, description="Barn/Housing quality score (1-10)")
    milking_frequency: int = Field(default=2, ge=1, le=6, description="Milking frequency per day")
    
    # Optional Historical Data for Temporal Trend Extraction
    historical_readings: Optional[List[HistoricalReading]] = Field(
        default=[],
        description="Optional list of historical readings (3 to 14 days) for temporal feature calculation"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "animal_id": "C102",
                "timestamp": "2026-10-05T12:00:00Z",
                "age": 4.5,
                "breed": "Holstein-Friesian",
                "lactation_number": 2,
                "previous_mastitis": 1,
                "vaccination_status": "UP_TO_DATE",
                "milk_yield": 22.5,
                "somatic_cell_count": 480.0,
                "milk_temperature": 39.2,
                "milk_conductivity": 6.8,
                "milk_ph": 6.8,
                "body_temperature": 39.1,
                "activity_level": 420.0,
                "rumination": 310.0,
                "feeding_behavior": 210.0,
                "environmental_temperature": 28.5,
                "humidity": 65.0,
                "farm_hygiene_score": 7.0,
                "housing_condition_score": 8.0,
                "milking_frequency": 2,
                "historical_readings": [
                    {
                        "timestamp": "2026-10-02T12:00:00Z",
                        "somatic_cell_count": 210.0,
                        "milk_yield": 28.0,
                        "body_temperature": 38.5,
                        "milk_conductivity": 5.4,
                        "activity_level": 550.0,
                        "rumination": 460.0
                    },
                    {
                        "timestamp": "2026-10-03T12:00:00Z",
                        "somatic_cell_count": 290.0,
                        "milk_yield": 26.5,
                        "body_temperature": 38.6,
                        "milk_conductivity": 5.7,
                        "activity_level": 510.0,
                        "rumination": 420.0
                    },
                    {
                        "timestamp": "2026-10-04T12:00:00Z",
                        "somatic_cell_count": 380.0,
                        "milk_yield": 24.0,
                        "body_temperature": 38.9,
                        "milk_conductivity": 6.2,
                        "activity_level": 460.0,
                        "rumination": 360.0
                    }
                ]
            }
        }
    )


class RiskFactor(BaseModel):
    """
    Feature importance / contribution detail derived from SHAP or model coefficients.
    """
    feature: str = Field(..., description="Feature name")
    impact: str = Field(..., description="Impact direction: 'positive' (increases risk) or 'negative' (reduces risk)")
    importance: float = Field(..., description="Absolute or relative contribution score")


class PredictionDetail(BaseModel):
    """
    Core prediction metrics returned by the service.
    """
    risk_score: float = Field(..., description="Model estimated risk probability between 0.00 and 1.00")
    risk_percentage: float = Field(..., description="Model estimated risk percentage (0 to 100%)")
    risk_level: str = Field(..., description="Risk level category: NO_RISK, LOW, MODERATE, HIGH")
    prediction_window: str = Field(..., description="Forecast window (e.g., 7-14 days)")


class PredictionResponse(BaseModel):
    """
    Standard JSON API response contract.
    """
    animal_id: str
    prediction: PredictionDetail
    risk_factors: List[RiskFactor]
    recommendations: List[str]
    model_version: str
    prediction_timestamp: str
    disclaimer: str = (
        "Notice: This prediction is an AI decision-support estimation for early risk warning "
        "and NOT a formal veterinary diagnosis."
    )


class HealthResponse(BaseModel):
    """
    Health check endpoint response contract.
    """
    status: str
    service: str
    model_loaded: bool
    model_version: str
