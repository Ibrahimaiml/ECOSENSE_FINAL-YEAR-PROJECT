import pandas as pd
import numpy as np
import os

os.makedirs("data/gold", exist_ok=True)
print("--- EXECUTING PREPROCESSING & FEATURE ENGINEERING ---")

# 1. Pre-Construction Data
df_pre = pd.read_csv("data/raw/pre_construction_uci.csv").drop_duplicates()
df_pre = df_pre.fillna(df_pre.median(numeric_only=True))
df_pre['surface_to_volume_ratio'] = np.round(df_pre['surface_area'] / (df_pre['surface_area'] * df_pre['overall_height']), 4)
df_pre['total_thermal_load_kwh'] = df_pre['heating_load'] + df_pre['cooling_load']
df_pre.to_csv("data/gold/clean_pre_construction.csv", index=False)

# 2. Post-Construction Telemetry
df_post = pd.read_csv("data/raw/post_construction_telemetry.csv")
df_post['timestamp'] = pd.to_datetime(df_post['timestamp'])

# Outlier Flagging
q1 = df_post['kwh_consumed'].quantile(0.25)
q3 = df_post['kwh_consumed'].quantile(0.75)
df_post['is_anomaly_spike'] = df_post['kwh_consumed'] > (q3 + 1.5 * (q3 - q1))

# Temporal Features
df_post['hour'] = df_post['timestamp'].dt.hour
df_post['day_of_week'] = df_post['timestamp'].dt.dayofweek
df_post['month'] = df_post['timestamp'].dt.month
df_post['is_weekend'] = df_post['day_of_week'].isin([5, 6]).astype(int)

# Cyclic Transforms
df_post['sin_hour'] = np.sin(2 * np.pi * df_post['hour'] / 24.0)
df_post['cos_hour'] = np.cos(2 * np.pi * df_post['hour'] / 24.0)

# Time Series Lag Features
df_post['lag_1h'] = df_post['kwh_consumed'].shift(1).bfill()
df_post['lag_24h'] = df_post['kwh_consumed'].shift(24).bfill()
df_post['rolling_mean_3h'] = df_post['kwh_consumed'].shift(1).rolling(window=3, min_periods=1).mean().bfill()

df_post.to_csv("data/gold/clean_post_construction.csv", index=False)
print(f"   - Successfully saved {len(df_post)} rows to data/gold/clean_post_construction.csv")
print("--- PREPROCESSING COMPLETE ---")