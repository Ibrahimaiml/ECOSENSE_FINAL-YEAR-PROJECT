"""
EcoSense AI - RAG & Knowledge Engine
Integrates PostgreSQL + pgvector to embed Time-of-Use (ToU) tariffs & energy codes,
and provides semantic similarity search via query_tariff_rules().
"""

import os
import re
import json
import hashlib
import numpy as np
from datetime import datetime
from typing import List, Dict, Any, Optional
import sys
from pathlib import Path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from dotenv import load_dotenv
load_dotenv(root_dir / ".env")

from backend.db import get_postgres_connection, local_store

# Knowledge Base: Utility Time-of-Use (ToU) Tariffs & Building Energy Codes
DEFAULT_TARIFF_DOCS = [
    {
        "doc_title": "ToU Tariff Rule: Deep Off-Peak Base Rate",
        "rule_type": "TARIFF_TIER",
        "content": "Deep Off-Peak tariff active from 00:00 to 06:00. Energy price is 3.20 INR/kWh. Grid stress is minimal. Recommended action: run thermal pre-chilling or deep cooling for thermal mass storage if daytime high is forecast > 32°C.",
        "peak_period_start": 0,
        "peak_period_end": 6,
        "rate_inr": 3.20
    },
    {
        "doc_title": "ToU Tariff Rule: Morning Standard Operational Tier",
        "rule_type": "TARIFF_TIER",
        "content": "Standard operational baseline tariff active from 06:00 to 15:00. Energy rate is 5.50 INR/kWh. Recommended action: maintain steady comfort set-point (23.5°C to 24.5°C) to prevent compressor surge.",
        "peak_period_start": 6,
        "peak_period_end": 15,
        "rate_inr": 5.50
    },
    {
        "doc_title": "ToU Tariff Rule: Pre-Peak Advisory & Pre-Cooling Window",
        "rule_type": "TACTICAL_ADVISORY",
        "content": "Pre-peak optimization window from 15:00 to 18:00. Tariff remains 5.50 INR/kWh before severe peak spikes. Recommended action: activate aggressive pre-cooling to lower indoor temperature to 20.0°C - 21.0°C, supercooling building thermal mass before peak tariff strikes at 18:00.",
        "peak_period_start": 15,
        "peak_period_end": 18,
        "rate_inr": 5.50
    },
    {
        "doc_title": "ToU Tariff Rule: Critical Peak Demand Pricing",
        "rule_type": "TARIFF_TIER",
        "content": "Critical Peak Pricing active between 18:00 and 22:00. Energy price surges to 9.80 INR/kWh. Peak grid congestion penalty applied. Recommended action: float indoor set-point upwards to 25.0°C - 26.0°C or coast on stored thermal mass to minimize expensive peak kWh draw.",
        "peak_period_start": 18,
        "peak_period_end": 22,
        "rate_inr": 9.80
    },
    {
        "doc_title": "Demand Response Grid Curtailment Rebate",
        "rule_type": "INCENTIVE_PROGRAM",
        "content": "Grid Operator Demand Response Event active between 18:00 and 21:00. Facilities curtailing instantaneous AC load by >= 25% earn a net credit rebate of 2.50 INR/kWh curtailed. Strict set-point throttling is economically favored.",
        "peak_period_start": 18,
        "peak_period_end": 21,
        "rate_inr": 7.30
    },
    {
        "doc_title": "ASHRAE Standard 55-2023 Occupant Thermal Comfort Mandate",
        "rule_type": "BUILDING_CODE",
        "content": "ASHRAE 55-2023 operative comfort envelope: indoor temperatures must remain between 19.0°C (lower winter/pre-cool limit) and 26.0°C (upper summer/shed limit) during occupied hours with operative air velocity < 0.2 m/s. Any set-point outside 19.0°C - 26.0°C violates occupant safety.",
        "peak_period_start": 0,
        "peak_period_end": 24,
        "rate_inr": 0.0
    },
    {
        "doc_title": "National Building Energy Code (NBC 2026) Efficiency Standards",
        "rule_type": "BUILDING_CODE",
        "content": "National Building Code 2026 Section 4: Commercial HVAC systems must implement automated temperature setbacks during non-peak hours and avoid sub-19°C chillers to prevent evaporator coil frosting and excessive refrigerant head pressure.",
        "peak_period_start": 0,
        "peak_period_end": 24,
        "rate_inr": 0.0
    }
]

EMBEDDING_DIM = 768

def generate_embedding(text: str, dim: int = EMBEDDING_DIM) -> List[float]:
    """
    Generates a deterministic, normalized 768-dimensional semantic embedding vector.
    Uses multi-hash pseudo-semantic projections ensuring true cosine similarity matching
    based on vocabulary overlap, temporal keywords, and domain concepts.
    """
    text_lower = text.lower()
    vec = np.zeros(dim, dtype=np.float32)

    # Keywords with specific semantic clustering dimensions
    concept_map = {
        "peak": (0, 100),
        "pre-cool": (100, 200),
        "cooling": (100, 200),
        "tariff": (200, 300),
        "rate": (200, 300),
        "ashrae": (300, 400),
        "comfort": (300, 400),
        "safety": (300, 400),
        "code": (400, 500),
        "thermal": (500, 600),
        "energy": (600, 700),
        "night": (700, 768),
        "morning": (20, 120),
        "evening": (180, 280),
    }

    for word, (start_idx, end_idx) in concept_map.items():
        if word in text_lower:
            h = int(hashlib.md5(word.encode()).hexdigest(), 16)
            for i in range(start_idx, end_idx):
                vec[i] += ((h >> (i % 24)) & 0xFF) / 255.0

    # Also compute n-gram semantic hashes across the full text
    words = re.findall(r'\w+', text_lower)
    for w in words:
        h = int(hashlib.sha256(w.encode()).hexdigest(), 16)
        idx = h % dim
        vec[idx] += 1.0

    # Normalize to unit length for cosine similarity
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec.tolist()

def init_tariff_vector_store():
    """Seeds the initial tariff and building code rules into pgvector or local fallback."""
    conn = get_postgres_connection()
    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) FROM tariff_documents_vector;")
                count = cur.fetchone()[0]
                if count == 0:
                    for doc in DEFAULT_TARIFF_DOCS:
                        emb = generate_embedding(doc["content"] + " " + doc["doc_title"])
                        cur.execute("""
                            INSERT INTO tariff_documents_vector (doc_title, rule_type, content, peak_period_start, peak_period_end, rate_inr, embedding)
                            VALUES (%s, %s, %s, %s, %s, %s, %s)
                        """, (doc["doc_title"], doc["rule_type"], doc["content"], doc["peak_period_start"], doc["peak_period_end"], doc["rate_inr"], emb))
                    print(f"[RAG Engine] Seeded {len(DEFAULT_TARIFF_DOCS)} tariff docs into pgvector.")
            return
        except Exception as e:
            print(f"[RAG Engine] pgvector seeding error, using local store: {e}")

    # Seed in local store
    if not local_store.tariff_docs:
        for doc in DEFAULT_TARIFF_DOCS:
            emb = generate_embedding(doc["content"] + " " + doc["doc_title"])
            local_store.tariff_docs.append({**doc, "embedding": emb})

def query_tariff_rules(current_time: Any, top_k: int = 3) -> List[Dict[str, Any]]:
    """
    RAG similarity search: converts current temporal context and HVAC query into an embedding,
    and performs cosine similarity search against pgvector or fallback memory store.
    """
    # Parse hour
    hour = 14
    if isinstance(current_time, (int, float)):
        hour = int(current_time) % 24
    elif isinstance(current_time, str):
        try:
            dt = datetime.fromisoformat(current_time.replace("Z", "+00:00"))
            hour = dt.hour
        except Exception:
            # Check for pattern like '19:00'
            m = re.search(r'(\d{1,2}):\d{2}', current_time)
            if m:
                hour = int(m.group(1)) % 24
    elif isinstance(current_time, datetime):
        hour = current_time.hour

    # Formulate domain search query
    query_text = f"Utility tariff rates, pre-cooling advisory, demand response, and ASHRAE comfort limits at hour {hour:02d}:00."
    if 15 <= hour < 18:
        query_text += " Pre-cooling strategy window ahead of evening critical peak pricing."
    elif 18 <= hour <= 22:
        query_text += " Critical peak pricing window, high tariff rate, demand response curtailment."
    elif 0 <= hour < 6:
        query_text += " Deep off-peak base tariff rate, thermal storage."
    else:
        query_text += " Standard day operational tariff baseline."

    query_emb = generate_embedding(query_text)

    conn = get_postgres_connection()
    if conn:
        try:
            with conn.cursor() as cur:
                # pgvector cosine distance operator is <=>
                cur.execute("""
                    SELECT id, doc_title, rule_type, content, peak_period_start, peak_period_end, rate_inr,
                           1 - (embedding <=> %s::vector) as similarity
                    FROM tariff_documents_vector
                    ORDER BY embedding <=> %s::vector ASC
                    LIMIT %s;
                """, (query_emb, query_emb, top_k))
                rows = cur.fetchall()
                results = []
                for r in rows:
                    results.append({
                        "id": r[0],
                        "doc_title": r[1],
                        "rule_type": r[2],
                        "content": r[3],
                        "peak_period_start": r[4],
                        "peak_period_end": r[5],
                        "rate_inr": r[6],
                        "similarity_score": round(float(r[7]), 4)
                    })
                if results:
                    return results
        except Exception as e:
            # Fall through to local similarity
            pass

    # In-memory cosine similarity fallback
    if not local_store.tariff_docs:
        init_tariff_vector_store()

    scored_docs = []
    q_vec = np.array(query_emb, dtype=np.float32)
    for doc in local_store.tariff_docs:
        d_vec = np.array(doc["embedding"], dtype=np.float32)
        sim = float(np.dot(q_vec, d_vec) / (np.linalg.norm(q_vec) * np.linalg.norm(d_vec) + 1e-9))
        
        # Boost rule matching current hour
        if doc.get("peak_period_start") is not None and doc.get("peak_period_end") is not None:
            if doc["peak_period_start"] <= hour < doc["peak_period_end"]:
                sim += 0.25

        scored_docs.append({
            "doc_title": doc["doc_title"],
            "rule_type": doc["rule_type"],
            "content": doc["content"],
            "peak_period_start": doc.get("peak_period_start"),
            "peak_period_end": doc.get("peak_period_end"),
            "rate_inr": doc["rate_inr"],
            "similarity_score": round(sim, 4)
        })

    scored_docs.sort(key=lambda x: x["similarity_score"], reverse=True)
    return scored_docs[:top_k]

# Initialize vector store on module load
init_tariff_vector_store()
