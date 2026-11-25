import pandas as pd
import numpy as np
import os

os.makedirs("data/raw", exist_ok=True)
print("--- GENERATING HIGH-SIGNAL SYNTHETIC TELEMETRY ---")

np.random.seed(42)
dates = pd.date_range(start="2025-01-01", periods=8760, freq="h")
hours = dates.hour

# Temperature Simulation
temp = 25 + 8 * np.sin(2 * np.pi * (hours - 8) / 24) + np.random.normal(0, 1, 8760)

# Base Consumption driven by temperature and diurnal cycle
base_kwh = 0.5 + 0.08 * (temp - 15) + 0.8 * np.sin(2 * np.pi * (hours - 6) / 24)
base_kwh += np.where((hours >= 18) & (hours <= 22), 1.5, 0) # Peak evening load
base_kwh = np.maximum(base_kwh, 0.2) + np.random.normal(0, 0.05, 8760)

# AC Load & Tariff Rates
ac_kwh = np.where(temp > 26, (temp - 26) * 0.25 + np.random.uniform(0.1, 0.4, 8760), 0.0)
tariff = np.where((hours >= 18) & (hours <= 22), 9.5, 4.5)

df_post = pd.DataFrame({
    'timestamp': dates,
    'kwh_consumed': np.round(base_kwh + ac_kwh, 3),
    'ac_usage_kwh': np.round(ac_kwh, 3),
    'temperature_2m': np.round(temp, 2),
    'tariff_rate_inr': tariff
})

df_post.to_csv("data/raw/post_construction_telemetry.csv", index=False)
print("Saved data/raw/post_construction_telemetry.csv with High-Signal Telemetry.")