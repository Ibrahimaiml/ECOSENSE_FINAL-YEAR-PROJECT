"""
EcoSense AI - Database Connection and Persistence Layer
Supports standard native PostgreSQL (+ optional pgvector) with automatic
cloud fallback to SQLite (sqlite:///./ecosense_cloud.db) via SQLAlchemy
and final in-memory safety fallback so FastAPI never crashes at startup.
"""

import json
import logging
import os
import time
from datetime import datetime
from pathlib import Path

from dotenv import find_dotenv, load_dotenv
from sqlalchemy import (
    Boolean,
    Column,
    Float,
    Integer,
    MetaData,
    String,
    Table,
    Text,
    create_engine,
    desc,
    insert,
    select,
    update,
)

_this_dir = Path(__file__).resolve().parent
root_dir = _this_dir if (_this_dir / "backend").exists() else _this_dir.parent
_env_file = find_dotenv()
if _env_file:
    load_dotenv(_env_file)
else:
    load_dotenv(root_dir / ".env")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("EcoSenseDB")

SQLITE_FALLBACK_URL = "sqlite:///./ecosense_cloud.db"

_raw_db_url = os.getenv("DATABASE_URL", "").strip()
if _raw_db_url.startswith("postgres://"):
    _raw_db_url = "postgresql://" + _raw_db_url[len("postgres://"):]

DATABASE_URL = _raw_db_url or "postgresql://postgres:postgres@localhost:5432/ecosense_db"

# Global connection state
_postgres_available = False
_pg_conn = None
_last_pg_failure_ts = 0.0
_pg_retry_cooldown_sec = 60.0
_logged_sqlite_fallback = False

_sqlite_engine = None
_metadata = MetaData()

sensor_telemetry_table = Table(
    "sensor_telemetry",
    _metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("time", String(64), nullable=False),
    Column("zone_id", String(50), default="ZONE_1"),
    Column("kwh_consumed", Float, nullable=False),
    Column("ac_usage_kwh", Float, default=0.0),
    Column("indoor_temp", Float),
    Column("outdoor_temp", Float),
    Column("tariff_rate_inr", Float),
    Column("is_anomaly_spike", Boolean, default=False),
    Column("hvac_state", String(20), default="OFF"),
)

hvac_action_logs_table = Table(
    "hvac_action_logs",
    _metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("timestamp", String(64), nullable=False),
    Column("zone_id", String(50), default="ZONE_1"),
    Column("indoor_temp", Float, nullable=False),
    Column("outdoor_temp", Float, nullable=False),
    Column("load_forecast_kwh", Float, nullable=False),
    Column("requested_set_point", Float, nullable=False),
    Column("guardrail_adjusted_set_point", Float, nullable=False),
    Column("guardrail_violation_detected", Boolean, default=False),
    Column("hvac_mode", String(50), nullable=False),
    Column("rationale", Text, nullable=False),
    Column("estimated_cost_savings_inr", Float, default=0.0),
)

building_metadata_table = Table(
    "building_metadata",
    _metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("building_name", String(100), nullable=False),
    Column("zone_id", String(50), unique=True, nullable=False),
    Column("floor_level", Integer, default=1),
    Column("floor_area_sqm", Float, nullable=False),
    Column("room_geometry", Text, nullable=False),
    Column("window_specs", Text, nullable=False),
    Column("thermal_mass_factor", Float, default=1.0),
    Column("created_at", String(64), nullable=False),
)


def _is_cloud_environment() -> bool:
    """Detects cloud runtimes (Render, Railway, Fly, Heroku, etc.)."""
    return any(
        os.getenv(var)
        for var in (
            "RENDER",
            "RENDER_SERVICE_ID",
            "RENDER_EXTERNAL_HOSTNAME",
            "RAILWAY_ENVIRONMENT",
            "FLY_APP_NAME",
            "DYNO",
        )
    )


def _points_to_localhost(url: str) -> bool:
    """Returns True if a database URL targets localhost/loopback or is empty."""
    lowered = (url or "").strip().lower()
    if not lowered:
        return True
    return any(host in lowered for host in ("localhost", "127.0.0.1", "::1"))


def _get_sqlite_engine():
    """Initializes and returns the SQLAlchemy SQLite cloud-fallback engine."""
    global _sqlite_engine, _logged_sqlite_fallback
    if _sqlite_engine is not None:
        return _sqlite_engine
    try:
        sqlite_url = DATABASE_URL if DATABASE_URL.startswith("sqlite") else SQLITE_FALLBACK_URL
        eng = create_engine(sqlite_url, connect_args={"check_same_thread": False})
        _metadata.create_all(eng)
        _sqlite_engine = eng
        if not _logged_sqlite_fallback:
            logger.info(f"[DB] Using SQLite persistence fallback ({sqlite_url}).")
            _logged_sqlite_fallback = True
        return _sqlite_engine
    except Exception as e:
        logger.warning(f"[DB] SQLite initialization fallback to memory: {e}")
        _sqlite_engine = None
        return None


def get_postgres_connection():
    """
    Returns an active psycopg2 connection when PostgreSQL is reachable.
    Gracefully skips localhost PostgreSQL on Render/cloud servers and falls back
    to SQLite (sqlite:///./ecosense_cloud.db) without crashing startup.
    """
    global _postgres_available, _pg_conn, _last_pg_failure_ts

    if _pg_conn and not _pg_conn.closed:
        return _pg_conn

    # Never attempt PostgreSQL when configured for SQLite or when cloud points to localhost
    if DATABASE_URL.startswith("sqlite") or (_is_cloud_environment() and _points_to_localhost(DATABASE_URL)):
        _postgres_available = False
        _get_sqlite_engine()
        return None

    # Avoid hammering unreachable Postgres with repeated connect timeouts
    now = time.monotonic()
    if _last_pg_failure_ts and (now - _last_pg_failure_ts) < _pg_retry_cooldown_sec:
        _get_sqlite_engine()
        return None

    try:
        import psycopg2
        conn = psycopg2.connect(DATABASE_URL, connect_timeout=3)
        conn.autocommit = True
        try:
            from pgvector.psycopg2 import register_vector
            register_vector(conn)
        except Exception:
            pass
        _postgres_available = True
        _pg_conn = conn
        _last_pg_failure_ts = 0.0
        logger.info("[DB] Connected to PostgreSQL successfully.")
        return conn
    except Exception as e:
        _postgres_available = False
        _pg_conn = None
        _last_pg_failure_ts = now
        logger.warning(f"[DB] PostgreSQL unavailable ({e}); using SQLite fallback ({SQLITE_FALLBACK_URL}).")
        _get_sqlite_engine()
        return None


def get_active_database_info() -> dict:
    """Returns database engine status for health-check endpoints."""
    conn = get_postgres_connection()
    if conn:
        return {
            "engine": "PostgreSQL (Standard Native Engine)",
            "connected": True,
            "mode": "postgresql",
        }
    sqlite_eng = _get_sqlite_engine()
    if sqlite_eng is not None:
        return {
            "engine": f"SQLite Cloud Fallback ({SQLITE_FALLBACK_URL})",
            "connected": True,
            "mode": "sqlite",
        }
    return {
        "engine": "In-Memory Resilient Engine",
        "connected": True,
        "mode": "memory",
    }


# Initialize fallback readiness safely on module import without blocking or crashing
try:
    if DATABASE_URL.startswith("sqlite") or (_is_cloud_environment() and _points_to_localhost(DATABASE_URL)):
        _get_sqlite_engine()
except Exception:
    pass


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

    record = {
        "time": timestamp,
        "zone_id": zone_id,
        "kwh_consumed": kwh,
        "ac_usage_kwh": ac_kwh,
        "indoor_temp": indoor_temp,
        "outdoor_temp": outdoor_temp,
        "tariff_rate_inr": tariff_rate,
        "is_anomaly_spike": is_anomaly,
        "hvac_state": hvac_state,
    }

    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO sensor_telemetry (time, zone_id, kwh_consumed, ac_usage_kwh, indoor_temp, outdoor_temp, tariff_rate_inr, is_anomaly_spike, hvac_state)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (timestamp, zone_id, kwh, ac_kwh, indoor_temp, outdoor_temp, tariff_rate, is_anomaly, hvac_state),
                )
                return True
        except Exception as e:
            logger.warning(f"[DB] Failed PostgreSQL insert, falling back to SQLite: {e}")

    sqlite_eng = _get_sqlite_engine()
    if sqlite_eng is not None:
        try:
            with sqlite_eng.begin() as sconn:
                sconn.execute(insert(sensor_telemetry_table).values(**record))
            local_store.telemetry.append(record)
            return True
        except Exception as e:
            logger.warning(f"[DB] Failed SQLite telemetry insert, using memory: {e}")

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

    record = {
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
        "estimated_cost_savings_inr": savings,
    }

    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO hvac_action_logs (timestamp, zone_id, indoor_temp, outdoor_temp, load_forecast_kwh,
                        requested_set_point, guardrail_adjusted_set_point, guardrail_violation_detected, hvac_mode, rationale, estimated_cost_savings_inr)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (ts, zone_id, indoor_temp, outdoor_temp, load_forecast, req_set_point, guard_set_point, violation, mode, rationale, savings),
                )
                return True
        except Exception as e:
            logger.warning(f"[DB] Action log PostgreSQL insert failed, falling back to SQLite: {e}")

    sqlite_eng = _get_sqlite_engine()
    if sqlite_eng is not None:
        try:
            with sqlite_eng.begin() as sconn:
                sconn.execute(insert(hvac_action_logs_table).values(**record))
            local_store.hvac_logs.append(record)
            return True
        except Exception as e:
            logger.warning(f"[DB] Failed SQLite action log insert, using memory: {e}")

    local_store.hvac_logs.append(record)
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
    geom_json = json.dumps(geom)
    windows_json = json.dumps(windows)

    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO building_metadata (building_name, zone_id, floor_level, floor_area_sqm, room_geometry, window_specs, thermal_mass_factor)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (zone_id) DO UPDATE
                    SET room_geometry = EXCLUDED.room_geometry,
                        window_specs = EXCLUDED.window_specs,
                        floor_area_sqm = EXCLUDED.floor_area_sqm;
                    """,
                    (b_name, zone_id, floor, area, geom_json, windows_json, t_mass),
                )
                return True
        except Exception as e:
            logger.warning(f"[DB] Building metadata PostgreSQL insert failed, falling back to SQLite: {e}")

    sqlite_eng = _get_sqlite_engine()
    if sqlite_eng is not None:
        try:
            with sqlite_eng.begin() as sconn:
                existing = sconn.execute(
                    select(building_metadata_table.c.id).where(building_metadata_table.c.zone_id == zone_id)
                ).first()
                if existing:
                    sconn.execute(
                        update(building_metadata_table)
                        .where(building_metadata_table.c.zone_id == zone_id)
                        .values(
                            building_name=b_name,
                            floor_level=floor,
                            floor_area_sqm=area,
                            room_geometry=geom_json,
                            window_specs=windows_json,
                            thermal_mass_factor=t_mass,
                        )
                    )
                else:
                    sconn.execute(
                        insert(building_metadata_table).values(
                            building_name=b_name,
                            zone_id=zone_id,
                            floor_level=floor,
                            floor_area_sqm=area,
                            room_geometry=geom_json,
                            window_specs=windows_json,
                            thermal_mass_factor=t_mass,
                            created_at=datetime.utcnow().isoformat(),
                        )
                    )
            local_store.building_metadata[zone_id] = metadata
            return True
        except Exception as e:
            logger.warning(f"[DB] Failed SQLite metadata save, using memory: {e}")

    local_store.building_metadata[zone_id] = metadata
    return True


def get_recent_telemetry(limit: int = 50):
    conn = get_postgres_connection()
    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT time, zone_id, kwh_consumed, ac_usage_kwh, indoor_temp, outdoor_temp, tariff_rate_inr, is_anomaly_spike, hvac_state
                    FROM sensor_telemetry
                    ORDER BY time DESC
                    LIMIT %s;
                    """,
                    (limit,),
                )
                rows = cur.fetchall()
                return [
                    {
                        "time": str(r[0]),
                        "zone_id": r[1],
                        "kwh_consumed": r[2],
                        "ac_usage_kwh": r[3],
                        "indoor_temp": r[4],
                        "outdoor_temp": r[5],
                        "tariff_rate_inr": r[6],
                        "is_anomaly_spike": r[7],
                        "hvac_state": r[8],
                    }
                    for r in rows
                ]
        except Exception:
            pass

    sqlite_eng = _get_sqlite_engine()
    if sqlite_eng is not None:
        try:
            with sqlite_eng.connect() as sconn:
                stmt = (
                    select(
                        sensor_telemetry_table.c.time,
                        sensor_telemetry_table.c.zone_id,
                        sensor_telemetry_table.c.kwh_consumed,
                        sensor_telemetry_table.c.ac_usage_kwh,
                        sensor_telemetry_table.c.indoor_temp,
                        sensor_telemetry_table.c.outdoor_temp,
                        sensor_telemetry_table.c.tariff_rate_inr,
                        sensor_telemetry_table.c.is_anomaly_spike,
                        sensor_telemetry_table.c.hvac_state,
                    )
                    .order_by(desc(sensor_telemetry_table.c.id))
                    .limit(limit)
                )
                rows = sconn.execute(stmt).fetchall()
                return [
                    {
                        "time": str(r[0]),
                        "zone_id": r[1],
                        "kwh_consumed": r[2],
                        "ac_usage_kwh": r[3],
                        "indoor_temp": r[4],
                        "outdoor_temp": r[5],
                        "tariff_rate_inr": r[6],
                        "is_anomaly_spike": bool(r[7]),
                        "hvac_state": r[8],
                    }
                    for r in rows
                ]
        except Exception:
            pass

    return list(reversed(local_store.telemetry[-limit:]))


def get_recent_actions(limit: int = 20):
    conn = get_postgres_connection()
    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT timestamp, zone_id, indoor_temp, outdoor_temp, load_forecast_kwh,
                           requested_set_point, guardrail_adjusted_set_point, guardrail_violation_detected,
                           hvac_mode, rationale, estimated_cost_savings_inr
                    FROM hvac_action_logs
                    ORDER BY timestamp DESC
                    LIMIT %s;
                    """,
                    (limit,),
                )
                rows = cur.fetchall()
                return [
                    {
                        "timestamp": str(r[0]),
                        "zone_id": r[1],
                        "indoor_temp": r[2],
                        "outdoor_temp": r[3],
                        "load_forecast_kwh": r[4],
                        "requested_set_point": r[5],
                        "guardrail_adjusted_set_point": r[6],
                        "guardrail_violation_detected": r[7],
                        "hvac_mode": r[8],
                        "rationale": r[9],
                        "estimated_cost_savings_inr": r[10],
                    }
                    for r in rows
                ]
        except Exception:
            pass

    sqlite_eng = _get_sqlite_engine()
    if sqlite_eng is not None:
        try:
            with sqlite_eng.connect() as sconn:
                stmt = (
                    select(
                        hvac_action_logs_table.c.timestamp,
                        hvac_action_logs_table.c.zone_id,
                        hvac_action_logs_table.c.indoor_temp,
                        hvac_action_logs_table.c.outdoor_temp,
                        hvac_action_logs_table.c.load_forecast_kwh,
                        hvac_action_logs_table.c.requested_set_point,
                        hvac_action_logs_table.c.guardrail_adjusted_set_point,
                        hvac_action_logs_table.c.guardrail_violation_detected,
                        hvac_action_logs_table.c.hvac_mode,
                        hvac_action_logs_table.c.rationale,
                        hvac_action_logs_table.c.estimated_cost_savings_inr,
                    )
                    .order_by(desc(hvac_action_logs_table.c.id))
                    .limit(limit)
                )
                rows = sconn.execute(stmt).fetchall()
                return [
                    {
                        "timestamp": str(r[0]),
                        "zone_id": r[1],
                        "indoor_temp": r[2],
                        "outdoor_temp": r[3],
                        "load_forecast_kwh": r[4],
                        "requested_set_point": r[5],
                        "guardrail_adjusted_set_point": r[6],
                        "guardrail_violation_detected": bool(r[7]),
                        "hvac_mode": r[8],
                        "rationale": r[9],
                        "estimated_cost_savings_inr": r[10],
                    }
                    for r in rows
                ]
        except Exception:
            pass

    return list(reversed(local_store.hvac_logs[-limit:]))
