from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import joblib

from app.features import compute_temporal_features

# Feature specifications
NUMERICAL_FEATURES = [
    "age",
    "lactation_number",
    "previous_mastitis",
    "milk_yield",
    "somatic_cell_count",
    "milk_temperature",
    "milk_conductivity",
    "milk_ph",
    "body_temperature",
    "activity_level",
    "rumination",
    "feeding_behavior",
    "environmental_temperature",
    "humidity",
    "farm_hygiene_score",
    "housing_condition_score",
    "milking_frequency",
    "scc_3d_avg",
    "scc_7d_avg",
    "scc_change_pct",
    "milk_yield_3d_avg",
    "milk_yield_7d_avg",
    "milk_yield_change_pct",
    "rumination_change_pct",
    "activity_change_pct",
    "temperature_trend",
    "conductivity_trend",
]

CATEGORICAL_FEATURES = [
    "breed",
    "vaccination_status",
]


class MastitisPreprocessor(BaseEstimator, TransformerMixin):
    """
    Custom sklearn-compatible preprocessor for Bovine Mastitis feature pipeline.
    Transforms raw input dictionaries/DataFrames into feature matrices ready for model inference.
    """

    def __init__(self):
        self.numerical_features = NUMERICAL_FEATURES
        self.categorical_features = CATEGORICAL_FEATURES
        self.column_transformer: Optional[ColumnTransformer] = None
        self.feature_names: List[str] = []

    def _prepare_df(self, X: Any) -> pd.DataFrame:
        """
        Converts input dict, list of dicts, or DataFrame into enriched DataFrame with temporal features.
        """
        if isinstance(X, dict):
            enriched = compute_temporal_features(X)
            df = pd.DataFrame([enriched])
        elif isinstance(X, list):
            enriched_list = [compute_temporal_features(item if isinstance(item, dict) else item.dict()) for item in X]
            df = pd.DataFrame(enriched_list)
        elif isinstance(X, pd.DataFrame):
            # If DataFrame contains historical_readings column, compute per row
            if "historical_readings" in X.columns:
                records = X.to_dict(orient="records")
                enriched_list = [compute_temporal_features(rec) for rec in records]
                df = pd.DataFrame(enriched_list)
            else:
                # Ensure all temporal columns exist
                df = X.copy()
                for col in self.numerical_features:
                    if col not in df.columns:
                        df[col] = 0.0
        else:
            raise ValueError(f"Unsupported input type for preprocessing: {type(X)}")

        # Ensure missing numerical/categorical columns are present with sensible defaults
        for col in self.numerical_features:
            if col not in df.columns:
                df[col] = 0.0

        for col in self.categorical_features:
            if col not in df.columns:
                df[col] = "UNKNOWN"

        return df

    def fit(self, X: Any, y=None):
        df = self._prepare_df(X)

        num_pipeline = Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ])

        cat_pipeline = Pipeline([
            ("imputer", SimpleImputer(strategy="constant", fill_value="UNKNOWN")),
            ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ])

        self.column_transformer = ColumnTransformer(
            transformers=[
                ("num", num_pipeline, self.numerical_features),
                ("cat", cat_pipeline, self.categorical_features),
            ]
        )

        self.column_transformer.fit(df)

        # Generate feature names output by transformer
        cat_encoder = self.column_transformer.named_transformers_["cat"].named_steps["encoder"]
        cat_feature_names = cat_encoder.get_feature_names_out(self.categorical_features).tolist()
        self.feature_names = self.numerical_features + cat_feature_names

        return self

    def transform(self, X: Any) -> pd.DataFrame:
        if self.column_transformer is None:
            raise RuntimeError("Preprocessor has not been fitted yet. Call fit() or load fit preprocessor.")
        df = self._prepare_df(X)
        transformed_array = self.column_transformer.transform(df)
        return pd.DataFrame(transformed_array, columns=self.feature_names)

    def fit_transform(self, X: Any, y=None, **fit_params) -> pd.DataFrame:
        return self.fit(X, y).transform(X)

    def save(self, filepath: str):
        joblib.dump(self, filepath)

    @classmethod
    def load(cls, filepath: str) -> "MastitisPreprocessor":
        return joblib.load(filepath)
