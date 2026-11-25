"""
EcoSense AI - Database Connection and Persistence Layer
Supports standard native PostgreSQL and vector persistence with automatic in-memory fallback.
"""

import os
import json
import logging
import numpy as np
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

root_dir = Path(__file__).resolve().parent.parent
load_dotenv(root_dir / ".env")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/ecosense_db")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("EcoSenseDB")

# Global flags
_postgres_available = False
_pg_conn = None

def get_postgres_connection():
    global _postgres_available, _pg_conn
    if _pg_conn and not _pg_conn.closed:
        return _pg_conn
    try:
        import psycopg2
        from pgvector.psycopg2 import register_vector
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        try:
            register_vector(conn)
        except Exception:
            pass
        _postgres_available = True
        _pg_conn = conn
        logger.info("[DB] Connected to PostgreSQL + pgvector successfully.")
        return conn
    except Exception as e:
        _postgres_available = False
        _pg_conn = None
        return None

# --- In-Memory Fallback Storage ---
class LocalStore:
    def __init__(self):
        self.telemetry = []
        self.tariff_docs = []
        self.hvac_logs = []
        self.building_metadata = {}

local_store = LocalStore()

def insert_sensor_telemetry(data: dict):
    conn = get_postgres_connection()
    timestamp = data.get("timestamp", datetime.utcnow().isoformat())
    zone_id = data.get("zone_id", "ZONE_1")
    kwh = float(data.get("kwh_consumed", 0.0))
    ac_kwh = float(data.get("ac_usage_kwh", 0.0))
    indoor_temp = float(data.get("indoor_temp", 24.0))
    outdoor_temp = float(data.get("outdoor_temp", 30.0))
    tariff_rate = float(data.get("tariff_rate_inr", 4.5))
    is_anomaly = bool(data.get("is_anomaly_spike", False))
    hvac_state = str(data.get("hvac_state", "OFF"))

    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO sensor_telemetry (time, zone_id, kwh_consumed, ac_usage_kwh, indoor_temp, outdoor_temp, tariff_rate_inr, is_anomaly_spike, hvac_state)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (timestamp, zone_id, kwh, ac_kwh, indoor_temp, outdoor_temp, tariff_rate, is_anomaly, hvac_state))
                return True
        except Exception as e:
            logger.warning(f"[DB] Failed PostgreSQL insert, fallback: {e}")

    # Local fallback
    record = {
        "time": timestamp,
        "zone_id": zone_id,
        "kwh_consumed": kwh,
        "ac_usage_kwh": ac_kwh,
        "indoor_temp": indoor_temp,
        "outdoor_temp": outdoor_temp,
        "tariff_rate_inr": tariff_rate,
        "is_anomaly_spike": is_anomaly,
        "hvac_state": hvac_state
    }
    local_store.telemetry.append(record)
    return True

def insert_hvac_action_log(log_data: dict):
    conn = get_postgres_connection()
    ts = log_data.get("timestamp", datetime.utcnow().isoformat())
    zone_id = log_data.get("zone_id", "ZONE_1")
    indoor_temp = float(log_data.get("indoor_temp", 0.0))
    outdoor_temp = float(log_data.get("outdoor_temp", 0.0))
    load_forecast = float(log_data.get("load_forecast_kwh", 0.0))
    req_set_point = float(log_data.get("requested_set_point", 23.0))
    guard_set_point = float(log_data.get("guardrail_adjusted_set_point", 23.0))
    violation = bool(log_data.get("guardrail_violation_detected", False))
    mode = str(log_data.get("hvac_mode", "NORMAL"))
    rationale = str(log_data.get("rationale", ""))
    savings = float(log_data.get("estimated_cost_savings_inr", 0.0))

    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO hvac_action_logs (timestamp, zone_id, indoor_temp, outdoor_temp, load_forecast_kwh, 
                        requested_set_point, guardrail_adjusted_set_point, guardrail_violation_detected, hvac_mode, rationale, estimated_cost_savings_inr)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (ts, zone_id, indoor_temp, outdoor_temp, load_forecast, req_set_point, guard_set_point, violation, mode, rationale, savings))
                return True
        except Exception as e:
            logger.warning(f"[DB] Action log insert failed, fallback: {e}")

    local_store.hvac_logs.append({
        "timestamp": ts,
        "zone_id": zone_id,
        "indoor_temp": indoor_temp,
        "outdoor_temp": outdoor_temp,
        "load_forecast_kwh": load_forecast,
        "requested_set_point": req_set_point,
        "guardrail_adjusted_set_point": guard_set_point,
        "guardrail_violation_detected": violation,
        "hvac_mode": mode,
        "rationale": rationale,
        "estimated_cost_savings_inr": savings
    })
    return True

def save_building_metadata(metadata: dict):
    conn = get_postgres_connection()
    b_name = metadata.get("building_name", "EcoSense HQ")
    zone_id = metadata.get("zone_id", "ZONE_1")
    floor = int(metadata.get("floor_level", 1))
    area = float(metadata.get("floor_area_sqm", 150.0))
    geom = metadata.get("room_geometry", {})
    windows = metadata.get("window_specs", {})
    t_mass = float(metadata.get("thermal_mass_factor", 1.2))

    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO building_metadata (building_name, zone_id, floor_level, floor_area_sqm, room_geometry, window_specs, thermal_mass_factor)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (zone_id) DO UPDATE 
                    SET room_geometry = EXCLUDED.room_geometry,
                        window_specs = EXCLUDED.window_specs,
                        floor_area_sqm = EXCLUDED.floor_area_sqm;
                """, (b_name, zone_id, floor, area, json.dumps(geom), json.dumps(windows), t_mass))
                return True
        except Exception as e:
            logger.warning(f"[DB] Building metadata insert failed, fallback: {e}")

    local_store.building_metadata[zone_id] = metadata
    return True

def get_recent_telemetry(limit: int = 50):
    conn = get_postgres_connection()
    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT time, zone_id, kwh_consumed, ac_usage_kwh, indoor_temp, outdoor_temp, tariff_rate_inr, is_anomaly_spike, hvac_state
                    FROM sensor_telemetry
                    ORDER BY time DESC
                    LIMIT %s;
                """, (limit,))
                rows = cur.fetchall()
                return [{
                    "time": str(r[0]), "zone_id": r[1], "kwh_consumed": r[2], "ac_usage_kwh": r[3],
                    "indoor_temp": r[4], "outdoor_temp": r[5], "tariff_rate_inr": r[6],
                    "is_anomaly_spike": r[7], "hvac_state": r[8]
                } for r in rows]
        except Exception:
            pass
    return list(reversed(local_store.telemetry[-limit:]))

def get_recent_actions(limit: int = 20):
    conn = get_postgres_connection()
    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT timestamp, zone_id, indoor_temp, outdoor_temp, load_forecast_kwh,
                           requested_set_point, guardrail_adjusted_set_point, guardrail_violation_detected,
                           hvac_mode, rationale, estimated_cost_savings_inr
                    FROM hvac_action_logs
                    ORDER BY timestamp DESC
                    LIMIT %s;
                """, (limit,))
                rows = cur.fetchall()
                return [{
                    "timestamp": str(r[0]), "zone_id": r[1], "indoor_temp": r[2], "outdoor_temp": r[3],
                    "load_forecast_kwh": r[4], "requested_set_point": r[5],
                    "guardrail_adjusted_set_point": r[6], "guardrail_violation_detected": r[7],
                    "hvac_mode": r[8], "rationale": r[9], "estimated_cost_savings_inr": r[10]
                } for r in rows]
        except Exception:
            pass
    return list(reversed(local_store.hvac_logs[-limit:]))
