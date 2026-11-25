-- EcoSense AI Database Initialization Script
-- Standard Native PostgreSQL Configuration (No TimescaleDB required)

-- 1. Optional Extensions
-- TimescaleDB extension removed for native standard PostgreSQL compatibility:
-- CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- pgvector extension for Vector Search (attempt if installed on server)
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'pgvector extension not available on this system, using native array storage: %', SQLERRM;
END $$;

-- 2. Sensor Telemetry Table (Standard PostgreSQL Table with Timestamp Indexing)
CREATE TABLE IF NOT EXISTS sensor_telemetry (
    time TIMESTAMPTZ NOT NULL,
    zone_id VARCHAR(50) DEFAULT 'ZONE_1',
    kwh_consumed DOUBLE PRECISION NOT NULL,
    ac_usage_kwh DOUBLE PRECISION DEFAULT 0.0,
    indoor_temp DOUBLE PRECISION,
    outdoor_temp DOUBLE PRECISION,
    tariff_rate_inr DOUBLE PRECISION,
    is_anomaly_spike BOOLEAN DEFAULT FALSE,
    hvac_state VARCHAR(20) DEFAULT 'OFF'
);

-- TimescaleDB Hypertable creation disabled for native PostgreSQL:
-- SELECT create_hypertable('sensor_telemetry', 'time', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_sensor_telemetry_time ON sensor_telemetry (time DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_telemetry_zone ON sensor_telemetry (zone_id, time DESC);

-- 3. Utility Tariff Rules & Energy Codes Vector Table (pgvector with native array fallback)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        EXECUTE '
        CREATE TABLE IF NOT EXISTS tariff_documents_vector (
            id SERIAL PRIMARY KEY,
            doc_title VARCHAR(255) NOT NULL,
            rule_type VARCHAR(100) NOT NULL,
            content TEXT NOT NULL,
            peak_period_start INT,
            peak_period_end INT,
            rate_inr DOUBLE PRECISION NOT NULL,
            embedding vector(768),
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_tariff_embedding ON tariff_documents_vector 
        USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);
        ';
    ELSE
        EXECUTE '
        CREATE TABLE IF NOT EXISTS tariff_documents_vector (
            id SERIAL PRIMARY KEY,
            doc_title VARCHAR(255) NOT NULL,
            rule_type VARCHAR(100) NOT NULL,
            content TEXT NOT NULL,
            peak_period_start INT,
            peak_period_end INT,
            rate_inr DOUBLE PRECISION NOT NULL,
            embedding DOUBLE PRECISION[],
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        ';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tariff_doc_title ON tariff_documents_vector (doc_title);
CREATE INDEX IF NOT EXISTS idx_tariff_created_at ON tariff_documents_vector (created_at DESC);

-- 4. HVAC Action Logs (Automated Set-Point Decisions)
CREATE TABLE IF NOT EXISTS hvac_action_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    zone_id VARCHAR(50) DEFAULT 'ZONE_1',
    indoor_temp DOUBLE PRECISION NOT NULL,
    outdoor_temp DOUBLE PRECISION NOT NULL,
    load_forecast_kwh DOUBLE PRECISION NOT NULL,
    requested_set_point DOUBLE PRECISION NOT NULL,
    guardrail_adjusted_set_point DOUBLE PRECISION NOT NULL,
    guardrail_violation_detected BOOLEAN DEFAULT FALSE,
    hvac_mode VARCHAR(50) NOT NULL,
    rationale TEXT NOT NULL,
    estimated_cost_savings_inr DOUBLE PRECISION DEFAULT 0.0
);

CREATE INDEX IF NOT EXISTS idx_hvac_action_time ON hvac_action_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_hvac_action_zone ON hvac_action_logs (zone_id, timestamp DESC);

-- 5. Building Metadata (Room Geometry & Window Specs)
CREATE TABLE IF NOT EXISTS building_metadata (
    id SERIAL PRIMARY KEY,
    building_name VARCHAR(100) NOT NULL,
    zone_id VARCHAR(50) UNIQUE NOT NULL,
    floor_level INT DEFAULT 1,
    floor_area_sqm DOUBLE PRECISION NOT NULL,
    room_geometry JSONB NOT NULL,
    window_specs JSONB NOT NULL,
    thermal_mass_factor DOUBLE PRECISION DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_building_metadata_zone ON building_metadata (zone_id);
