import pandas as pd
import numpy as np
from PIL import Image
import os

print("--- RUNNING ADVANCED ECOSENSE FEATURES ---\n")

# ==========================================
# 1. SMART ALERT ENGINE (Post-Construction)
# ==========================================
print("1. Executing Post-Construction AC & Appliance Alert Engine...")
df_post = pd.read_csv("data/gold/clean_post_construction.csv")

def check_appliance_alerts(df):
    alerts_triggered = []
    for idx, row in df.iterrows():
        # Trigger alert if AC usage is high during expensive peak tariff hours
        if row['ac_usage_kwh'] > 1.2 and row['tariff_rate_inr'] >= 8.0:
            cost = round(row['ac_usage_kwh'] * row['tariff_rate_inr'], 2)
            timestamp = row['timestamp']
            alerts_triggered.append(
                f"⚠️ [ALERT at {timestamp}]: AC usage spiked to {row['ac_usage_kwh']} kWh during PEAK rate hours! "
                f"This single hour added ₹{cost} to your bill."
            )
    return alerts_triggered

alerts = check_appliance_alerts(df_post)
print(f"   - Analysis Complete: {len(alerts)} AC cost alerts generated.")
print("   - Sample Alert Output:")
if alerts:
    print(f"     {alerts[0]}\n")


# ==========================================
# 2. LAND IMAGE PRE-PROCESSING (Pre-Construction)
# ==========================================
print("2. Simulating Land Image Upload & Dimensions Extraction...")

def process_land_image(image_path):
    if not os.path.exists(image_path):
        # Create a sample synthetic land photo if none exists
        img = Image.new('RGB', (800, 600), color=(73, 109, 137))
        os.makedirs("data/uploads", exist_ok=True)
        image_path = "data/uploads/sample_land.jpg"
        img.save(image_path)
    
    # Process image dimensions to estimate surface parameters
    with Image.open(image_path) as img:
        width, height = img.size
        # Map pixel dimensions to estimated land surface area (sq. meters)
        estimated_surface_area = round((width * height) / 1000, 2)
        estimated_wall_area = round(estimated_surface_area * 0.45, 2)
        estimated_roof_area = round(estimated_surface_area * 0.30, 2)
        
    return {
        "surface_area": estimated_surface_area,
        "wall_area": estimated_wall_area,
        "roof_area": estimated_roof_area,
        "overall_height": 7.0,  # Standard 2-story home
        "orientation": 2        # South-facing optimal thermal design
    }

extracted_design = process_land_image("data/uploads/sample_land.jpg")
print(f"   - Extracted Parameters from Image: {extracted_design}")
print("\n--- ADVANCED FEATURES READY ---")