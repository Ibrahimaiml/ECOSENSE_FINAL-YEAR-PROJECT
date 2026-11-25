import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb

print("--- BENCHMARKING MULTIPLE ML MODELS ---\n")

# Load Clean Dataset
df_post = pd.read_csv("data/gold/clean_post_construction.csv")

feature_cols = ['hour', 'day_of_week', 'month', 'is_weekend', 'tariff_rate_inr', 'lag_1h', 'lag_24h', 'rolling_mean_3h']
if 'temperature_2m' in df_post.columns:
    feature_cols.append('temperature_2m')

X = df_post[feature_cols]
y = df_post['kwh_consumed']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

# Define Candidate Models
candidate_models = {
    "XGBoost Regressor": xgb.XGBRegressor(n_estimators=150, learning_rate=0.05, max_depth=5, random_state=42),
    "Random Forest Regressor": RandomForestRegressor(n_estimators=100, random_state=42),
    "Ridge Linear Regressor": Ridge(alpha=1.0)
}

results = {}

print("Evaluating Models on Post-Construction Telemetry...")
print("-" * 65)

for name, model in candidate_models.items():
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    
    r2 = r2_score(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    mae = mean_absolute_error(y_test, preds)
    
    results[name] = {"R2": r2, "RMSE": rmse, "MAE": mae, "model": model}
    print(f"Model: {name:<25} | R² Score: {r2:.4f} | RMSE: {rmse:.4f} kWh | MAE: {mae:.4f} kWh")

print("-" * 65)

# Automatically Select Winner
winning_model_name = max(results, key=lambda k: results[k]["R2"])
best_r2 = results[winning_model_name]["R2"]

print(f"\n🏆 WINNING MODEL SELECTED: {winning_model_name} with R² Score of {best_r2:.4f}")