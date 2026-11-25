"""
EcoSense AI - Verification Test Suite for FastAPI Gateway & Hard Safety Guardrails
Tests:
1. Health endpoint
2. Telemetry ingestion into TimescaleDB / storage
3. Agentic HVAC optimization with RAG & XGBoost
4. Hard safety guardrails: clamp out-of-bound low (<19°C) and high (>26°C) set-points
5. 3D layout ingestion and retrieval
"""

import sys
from pathlib import Path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("ECOSENSE AI: RUNNING AUTOMATED API & SAFETY TESTS")
    print("=" * 60)

    # 1. Health Check
    res = client.get("/api/v1/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    health_data = res.json()
    print(f"[OK] 1. Health Check Passed: {health_data['status']} | ML Model: {health_data['ml_core']['model']}")

    # 2. Ingest Telemetry
    telemetry_payload = {
        "timestamp": "2026-09-21T16:00:00Z",
        "zone_id": "ZONE_1",
        "kwh_consumed": 3.82,
        "ac_usage_kwh": 2.45,
        "indoor_temp": 25.8,
        "outdoor_temp": 34.2,
        "tariff_rate_inr": 5.50,
        "is_anomaly_spike": False,
        "hvac_state": "COOLING"
    }
    res = client.post("/api/v1/telemetry", json=telemetry_payload)
    assert res.status_code == 201, f"Telemetry ingest failed: {res.text}"
    print(f"[OK] 2. Telemetry Ingested: {res.json()['status']} for {res.json()['zone_id']}")

    # 3. Agentic Optimization (Standard pre-cooling at 16:30)
    opt_payload = {
        "indoor_temp": 26.5,
        "outdoor_temp": 35.0,
        "current_time": "2026-09-21 16:30:00",
        "zone_id": "ZONE_1",
        "occupancy": 6
    }
    res = client.post("/api/v1/optimize-hvac", json=opt_payload)
    assert res.status_code == 200, f"HVAC optimization failed: {res.text}"
    data = res.json()
    print(f"[OK] 3. Agentic HVAC Optimization Executed:")
    print(f"   - Mode: {data['hvac_mode']}")
    print(f"   - Effective Set-point: {data['effective_set_point']} C")
    print(f"   - Load Forecast: {data['load_forecast_kwh']} kWh")
    print(f"   - Guardrail Status: {data['guardrail_status']}")
    print(f"   - Estimated Savings: INR {data['estimated_cost_savings_inr']}")

    # 4. HARD SAFETY GUARDRAIL TEST: Sub-zero / Sub-19°C Violation
    low_payload = {
        "indoor_temp": 25.0,
        "outdoor_temp": 32.0,
        "current_time": "2026-09-21 17:00:00",
        "override_requested_set_point": 16.0  # UNSAFE: Below 19°C!
    }
    res = client.post("/api/v1/optimize-hvac", json=low_payload)
    assert res.status_code == 200
    low_data = res.json()
    assert low_data["effective_set_point"] == 19.0, f"Guardrail failed to clamp low temp! Got {low_data['effective_set_point']}"
    assert low_data["guardrail_violation_detected"] is True
    print(f"[OK] 4. Hard Safety Guardrail Low Clamp Passed: Requested 16.0 C -> Clamped to {low_data['effective_set_point']} C")

    # 5. HARD SAFETY GUARDRAIL TEST: Over-26°C Violation
    high_payload = {
        "indoor_temp": 28.0,
        "outdoor_temp": 36.0,
        "current_time": "2026-09-21 19:30:00",
        "override_requested_set_point": 29.5  # UNSAFE: Exceeds 26°C!
    }
    res = client.post("/api/v1/optimize-hvac", json=high_payload)
    assert res.status_code == 200
    high_data = res.json()
    assert high_data["effective_set_point"] == 26.0, f"Guardrail failed to clamp high temp! Got {high_data['effective_set_point']}"
    assert high_data["guardrail_violation_detected"] is True
    print(f"[OK] 5. Hard Safety Guardrail High Clamp Passed: Requested 29.5 C -> Clamped to {high_data['effective_set_point']} C")

    # 6. 3D Layout Specs
    layout_payload = {
        "building_name": "EcoSense Research Tower",
        "zone_id": "ZONE_1",
        "floor_level": 3,
        "floor_area_sqm": 240.0,
        "room_geometry": {
            "width": 14.0,
            "length": 22.0,
            "height": 3.6
        },
        "window_specs": [
            {"wall_orientation": "SOUTH", "width": 5.0, "height": 2.2, "solar_heat_gain_coefficient": 0.32},
            {"wall_orientation": "WEST", "width": 4.0, "height": 2.0, "solar_heat_gain_coefficient": 0.25}
        ],
        "thermal_mass_factor": 1.4
    }
    res = client.post("/api/v1/3d-layout", json=layout_payload)
    assert res.status_code == 200, f"Layout post failed: {res.text}"
    print(f"[OK] 6. 3D Room Layout Spec Ingestion Passed: {res.json()['status']}")

    # 7. Dashboard Summary
    res = client.get("/api/v1/dashboard-summary")
    assert res.status_code == 200
    print(f"[OK] 7. Dashboard Summary Passed: Total Savings: INR {res.json()['total_savings_inr']}")

    print("\n[SUCCESS] ALL 7 BACKEND API & SAFETY GUARDRAIL TESTS PASSED PERFECTLY!\n")

if __name__ == "__main__":
    run_tests()
