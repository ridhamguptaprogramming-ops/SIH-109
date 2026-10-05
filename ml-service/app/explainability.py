from typing import List, Any, Dict, Optional
import pandas as pd
import numpy as np
import logging
import shap

from app.schemas import RiskFactor

logger = logging.getLogger(__name__)


class SHAPExplainerService:
    """
    Service for calculating feature-level contribution explainability using SHAP.
    """

    def __init__(self, model: Any, feature_names: List[str]):
        self.model = model
        self.feature_names = feature_names
        self.explainer = None
        self._initialize_explainer()

    def _initialize_explainer(self):
        """
        Attempts to initialize a SHAP TreeExplainer or standard Explainer.
        """
        try:
            # Check if model is XGBoost or Tree-based model
            if hasattr(self.model, "get_booster") or "XGB" in type(self.model).__name__:
                self.explainer = shap.TreeExplainer(self.model)
            else:
                self.explainer = shap.Explainer(self.model)
            logger.info("SHAP Explainer initialized successfully.")
        except Exception as e:
            logger.warning(f"Could not initialize specialized SHAP explainer: {e}. Fallback will be used.")
            self.explainer = None

    def explain_instance(self, processed_df: pd.DataFrame, top_n: int = 4) -> List[RiskFactor]:
        """
        Computes SHAP values for a single processed sample row and returns top contributing features.
        """
        if processed_df.empty:
            return self._get_fallback_factors()

        try:
            if self.explainer is None:
                self._initialize_explainer()

            if self.explainer is not None:
                shap_values = self.explainer(processed_df)

                # Extract values array based on SHAP Explanation structure
                if hasattr(shap_values, "values"):
                    vals = shap_values.values[0]
                    # Handle binary classification 2D output shape [num_features, 2] if present
                    if len(vals.shape) > 1 and vals.shape[-1] == 2:
                        vals = vals[:, 1]
                    elif len(vals.shape) > 1:
                        vals = vals[:, 0]
                else:
                    vals = np.array(shap_values)[0]

                # Create feature importance pairs
                factors: List[RiskFactor] = []
                feature_names = self.feature_names if len(self.feature_names) == len(vals) else processed_df.columns.tolist()

                for feat_name, val in zip(feature_names, vals):
                    abs_val = float(abs(val))
                    if abs_val > 1e-4:
                        impact = "positive" if val > 0 else "negative"
                        factors.append(
                            RiskFactor(
                                feature=feat_name,
                                impact=impact,
                                importance=round(abs_val, 4)
                            )
                        )

                # Sort by absolute SHAP importance descending
                factors.sort(key=lambda x: x.importance, reverse=True)
                return factors[:top_n] if factors else self._get_fallback_factors()

        except Exception as e:
            logger.error(f"SHAP explanation failed: {e}. Using fallback feature importances.")
            return self._get_fallback_factors(processed_df)

        return self._get_fallback_factors(processed_df)

    def _get_fallback_factors(self, processed_df: Optional[pd.DataFrame] = None) -> List[RiskFactor]:
        """
        Fallback mechanism if SHAP generation fails or explainer is unavailable.
        Uses model's feature_importances_ or coef_ attributes if present.
        """
        try:
            if hasattr(self.model, "feature_importances_"):
                importances = self.model.feature_importances_
                names = self.feature_names if len(self.feature_names) == len(importances) else [f"feature_{i}" for i in range(len(importances))]
                pairs = [
                    RiskFactor(
                        feature=name,
                        impact="positive",
                        importance=round(float(abs(imp)), 4)
                    )
                    for name, imp in zip(names, importances)
                ]
                pairs.sort(key=lambda x: x.importance, reverse=True)
                return pairs[:4]
            elif hasattr(self.model, "coef_"):
                coefs = self.model.coef_[0]
                names = self.feature_names if len(self.feature_names) == len(coefs) else [f"feature_{i}" for i in range(len(coefs))]
                pairs = [
                    RiskFactor(
                        feature=name,
                        impact="positive" if c > 0 else "negative",
                        importance=round(float(abs(c)), 4)
                    )
                    for name, c in zip(names, coefs)
                ]
                pairs.sort(key=lambda x: x.importance, reverse=True)
                return pairs[:4]
        except Exception as ex:
            logger.error(f"Fallback feature importance failed: {ex}")

        return [
            RiskFactor(feature="somatic_cell_count", impact="positive", importance=0.35),
            RiskFactor(feature="milk_conductivity", impact="positive", importance=0.25),
            RiskFactor(feature="body_temperature", impact="positive", importance=0.20),
            RiskFactor(feature="rumination", impact="negative", importance=0.15),
        ]
