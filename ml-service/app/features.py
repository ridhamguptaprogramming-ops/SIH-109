from typing import Dict, Any, List
import pandas as pd
import numpy as np


def compute_temporal_features(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes temporal and trend features from current telemetry + historical readings.
    Returns a flattened dictionary containing all original features plus calculated temporal features.
    """
    row = data.copy()
    historical_readings: List[Dict[str, Any]] = row.pop("historical_readings", []) or []

    # Current baseline values
    scc = float(row.get("somatic_cell_count", 0.0))
    yield_val = float(row.get("milk_yield", 0.0))
    rumination = float(row.get("rumination", 0.0))
    activity = float(row.get("activity_level", 0.0))
    body_temp = float(row.get("body_temperature", 0.0))
    conductivity = float(row.get("milk_conductivity", 0.0))

    if historical_readings and isinstance(historical_readings, list) and len(historical_readings) > 0:
        # Sort historical readings by timestamp if possible
        try:
            hist_df = pd.DataFrame(historical_readings)
            if "timestamp" in hist_df.columns:
                hist_df["timestamp"] = pd.to_datetime(hist_df["timestamp"])
                hist_df = hist_df.sort_values("timestamp")
            
            # Historical SCC series
            scc_hist = hist_df["somatic_cell_count"].dropna().values if "somatic_cell_count" in hist_df else np.array([])
            yield_hist = hist_df["milk_yield"].dropna().values if "milk_yield" in hist_df else np.array([])
            rumination_hist = hist_df["rumination"].dropna().values if "rumination" in hist_df else np.array([])
            activity_hist = hist_df["activity_level"].dropna().values if "activity_level" in hist_df else np.array([])
            temp_hist = hist_df["body_temperature"].dropna().values if "body_temperature" in hist_df else np.array([])
            cond_hist = hist_df["milk_conductivity"].dropna().values if "milk_conductivity" in hist_df else np.array([])

            # SCC averages & change
            scc_3d_avg = float(np.mean(scc_hist[-3:])) if len(scc_hist) > 0 else scc
            scc_7d_avg = float(np.mean(scc_hist[-7:])) if len(scc_hist) > 0 else scc
            scc_change_pct = float(((scc - scc_3d_avg) / (scc_3d_avg + 1e-5)) * 100.0)

            # Milk yield averages & change
            yield_3d_avg = float(np.mean(yield_hist[-3:])) if len(yield_hist) > 0 else yield_val
            yield_7d_avg = float(np.mean(yield_hist[-7:])) if len(yield_hist) > 0 else yield_val
            yield_change_pct = float(((yield_val - yield_3d_avg) / (yield_3d_avg + 1e-5)) * 100.0)

            # Rumination change
            rum_avg = float(np.mean(rumination_hist[-3:])) if len(rumination_hist) > 0 else rumination
            rumination_change_pct = float(((rumination - rum_avg) / (rum_avg + 1e-5)) * 100.0)

            # Activity change
            act_avg = float(np.mean(activity_hist[-3:])) if len(activity_hist) > 0 else activity
            activity_change_pct = float(((activity - act_avg) / (act_avg + 1e-5)) * 100.0)

            # Temperature and Conductivity trends
            temp_avg = float(np.mean(temp_hist[-3:])) if len(temp_hist) > 0 else body_temp
            temperature_trend = float(body_temp - temp_avg)

            cond_avg = float(np.mean(cond_hist[-3:])) if len(cond_hist) > 0 else conductivity
            conductivity_trend = float(conductivity - cond_avg)

        except Exception:
            # Fallback if parsing fails
            scc_3d_avg = scc
            scc_7d_avg = scc
            scc_change_pct = 0.0
            yield_3d_avg = yield_val
            yield_7d_avg = yield_val
            yield_change_pct = 0.0
            rumination_change_pct = 0.0
            activity_change_pct = 0.0
            temperature_trend = 0.0
            conductivity_trend = 0.0
    else:
        # Default single-point feature values when historical array is empty
        scc_3d_avg = scc
        scc_7d_avg = scc
        scc_change_pct = 0.0
        yield_3d_avg = yield_val
        yield_7d_avg = yield_val
        yield_change_pct = 0.0
        rumination_change_pct = 0.0
        activity_change_pct = 0.0
        temperature_trend = 0.0
        conductivity_trend = 0.0

    row["scc_3d_avg"] = scc_3d_avg
    row["scc_7d_avg"] = scc_7d_avg
    row["scc_change_pct"] = scc_change_pct
    row["milk_yield_3d_avg"] = yield_3d_avg
    row["milk_yield_7d_avg"] = yield_7d_avg
    row["milk_yield_change_pct"] = yield_change_pct
    row["rumination_change_pct"] = rumination_change_pct
    row["activity_change_pct"] = activity_change_pct
    row["temperature_trend"] = temperature_trend
    row["conductivity_trend"] = conductivity_trend

    return row
