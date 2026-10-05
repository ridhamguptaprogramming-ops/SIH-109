# ML Service - Data Directory

This directory contains mock input data and synthetic datasets used for local development, testing, and pipeline verification.

## Contents

- `mock_sensor_data.json`: Standardized test payload mimicking real-world sensor telemetry sent by the IoT backend, including current animal readings and 4-day historical time-series telemetry.

## Important Note on Data

The mock payload provided here is for baseline testing and API contract validation. Synthetic datasets generated in `training/` are explicitly intended for DEMO / PIPELINE VERIFICATION ONLY.

When real farm sensor and diagnostic data becomes available:
1. Replace synthetic dataset in `data/` or `training/` with real labelled CSV / Parquet data.
2. Ensure timestamps and animal IDs are formatted according to the schema in `app/schemas.py`.
