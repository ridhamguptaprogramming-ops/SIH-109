"""
Synthetic Demo Dataset Generator for Bovine Mastitis Early Risk Prediction.

IMPORTANT NOTICE:
This script generates SYNTHETIC/DEMO data ONLY for pipeline testing, model baseline training,
and API validation. The generated labels and feature relationships ARE NOT scientifically or
medically validated and MUST NOT be claimed as real-world predictive performance metrics.
"""

import os
import argparse
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_demo_dataset(num_cows: int = 50, days: int = 30, seed: int = 42, output_path: str = "data/demo_mastitis_dataset.csv"):
    np.random.seed(seed)
    records = []
    
    start_date = datetime(2026, 9, 1)
    breeds = ["Holstein-Friesian", "Jersey", "Guernsey", "Ayrshire"]
    vax_statuses = ["UP_TO_DATE", "PENDING", "EXPIRED"]

    print(f"Generating synthetic dataset for {num_cows} animals over {days} days...")

    for cow_idx in range(1, num_cows + 1):
        cow_id = f"C{cow_idx:03d}"
        age = round(float(np.random.uniform(2.0, 7.5)), 1)
        breed = np.random.choice(breeds, p=[0.6, 0.2, 0.1, 0.1])
        lactation = int(np.random.randint(1, 5))
        prev_mastitis = int(np.random.choice([0, 1, 2], p=[0.7, 0.2, 0.1]))
        vax = np.random.choice(vax_statuses, p=[0.85, 0.10, 0.05])
        
        farm_hygiene = round(float(np.random.uniform(5.0, 9.5)), 1)
        housing_cond = round(float(np.random.uniform(5.0, 9.5)), 1)
        milking_freq = int(np.random.choice([2, 3], p=[0.8, 0.2]))

        # Individual baseline values
        base_scc = np.random.uniform(100.0, 250.0)
        base_yield = np.random.uniform(22.0, 32.0)
        base_temp = np.random.uniform(38.2, 38.7)
        base_cond = np.random.uniform(4.8, 5.5)
        base_rumination = np.random.uniform(420.0, 520.0)
        base_activity = np.random.uniform(500.0, 650.0)

        # Randomly assign whether this cow will develop subclinical risk onset during the period
        develops_infection = np.random.rand() < 0.25
        infection_start_day = np.random.randint(10, days - 7) if develops_infection else 999

        for day in range(days):
            current_date = start_date + timedelta(days=day)
            timestamp_str = current_date.strftime("%Y-%m-%dT12:00:00Z")

            # Introduce progressive physiological stress / inflammation if infected
            if day >= infection_start_day:
                progress = (day - infection_start_day + 1) / 5.0
                scc = base_scc + (progress * np.random.uniform(150.0, 300.0)) + np.random.normal(0, 20)
                milk_yield = base_yield - (progress * np.random.uniform(1.5, 3.5)) + np.random.normal(0, 0.5)
                body_temp = base_temp + (progress * np.random.uniform(0.3, 0.8)) + np.random.normal(0, 0.05)
                milk_cond = base_cond + (progress * np.random.uniform(0.4, 1.0)) + np.random.normal(0, 0.1)
                rumination = base_rumination - (progress * np.random.uniform(30.0, 70.0)) + np.random.normal(0, 10)
                activity = base_activity - (progress * np.random.uniform(20.0, 50.0)) + np.random.normal(0, 15)
            else:
                scc = base_scc + np.random.normal(0, 25)
                milk_yield = base_yield + np.random.normal(0, 1.0)
                body_temp = base_temp + np.random.normal(0, 0.1)
                milk_cond = base_cond + np.random.normal(0, 0.15)
                rumination = base_rumination + np.random.normal(0, 15)
                activity = base_activity + np.random.normal(0, 20)

            scc = float(max(50.0, min(3000.0, scc)))
            milk_yield = float(max(5.0, min(50.0, milk_yield)))
            body_temp = float(max(36.5, min(41.5, body_temp)))
            milk_cond = float(max(3.0, min(12.0, milk_cond)))
            rumination = float(max(100.0, min(800.0, rumination)))
            activity = float(max(100.0, min(1200.0, activity)))
            milk_temp = round(body_temp + np.random.normal(0.1, 0.05), 2)
            milk_ph = round(float(6.5 + (0.0003 * scc) + np.random.normal(0, 0.05)), 2)
            milk_ph = float(max(6.2, min(7.5, milk_ph)))
            feeding_behavior = round(float(rumination * 0.5 + np.random.normal(0, 10)), 1)

            env_temp = round(float(22.0 + np.sin(day / 5.0) * 5.0 + np.random.normal(0, 1.5)), 1)
            humidity = round(float(60.0 + np.cos(day / 5.0) * 10.0 + np.random.normal(0, 3.0)), 1)

            # Synthetic target label calculation (Early Risk Warning in 7-14 days)
            # High SCC, high conductivity, drop in milk yield, high body temp, previous history raise probability
            risk_score_raw = (
                (0.0015 * scc) +
                (0.25 * (milk_cond - 5.5)) +
                (0.6 * (body_temp - 38.5)) +
                (-0.003 * (rumination - 450.0)) +
                (0.3 * prev_mastitis) +
                (-0.05 * (farm_hygiene - 7.0))
            )
            prob = 1.0 / (1.0 + np.exp(-risk_score_raw))
            target_7_14 = 1 if prob > 0.65 else 0

            records.append({
                "animal_id": cow_id,
                "date": current_date.strftime("%Y-%m-%d"),
                "timestamp": timestamp_str,
                "age": age,
                "breed": breed,
                "lactation_number": lactation,
                "previous_mastitis": prev_mastitis,
                "vaccination_status": vax,
                "milk_yield": round(milk_yield, 2),
                "somatic_cell_count": round(scc, 1),
                "milk_temperature": milk_temp,
                "milk_conductivity": round(milk_cond, 2),
                "milk_ph": milk_ph,
                "body_temperature": round(body_temp, 2),
                "activity_level": round(activity, 1),
                "rumination": round(rumination, 1),
                "feeding_behavior": feeding_behavior,
                "environmental_temperature": env_temp,
                "humidity": humidity,
                "farm_hygiene_score": farm_hygiene,
                "housing_condition_score": housing_cond,
                "milking_frequency": milking_freq,
                "mastitis_risk_7_14_days": target_7_14
            })

    df = pd.DataFrame(records)
    
    # Create directory if needed
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Dataset successfully created at: {output_path} (Total rows: {len(df)})")
    print(f"Target distribution (mastitis_risk_7_14_days):")
    print(df["mastitis_risk_7_14_days"].value_counts(normalize=True))
    return df

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate synthetic demo dataset for Mastitis ML model.")
    parser.add_argument("--cows", type=int, default=60, help="Number of cows to simulate")
    parser.add_argument("--days", type=int, default=30, help="Number of days to simulate")
    parser.add_argument("--output", type=str, default="data/demo_mastitis_dataset.csv", help="Output CSV path")
    args = parser.parse_args()

    # Make output path absolute if run from any working dir
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_file = os.path.join(base_dir, args.output) if not os.path.isabs(args.output) else args.output

    generate_demo_dataset(num_cows=args.cows, days=args.days, output_path=out_file)
