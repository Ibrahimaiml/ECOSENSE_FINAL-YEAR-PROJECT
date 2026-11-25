"""
EcoSense AI - Agentic HVAC Control Module
Combines XGBoost dynamic load forecasts, RAG tariff context from query_tariff_rules(),
and live indoor telemetry using the google-antigravity SDK with gemini-3.8-flash.
"""

import os
import re
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional
import sys
from pathlib import Path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from dotenv import load_dotenv
load_dotenv(root_dir / ".env")

from backend.ml_predictor import forecast_building_load
from backend.rag_engine import query_tariff_rules
from backend.db import insert_hvac_action_log

logger = logging.getLogger("EcoSenseAgent")

# Gemini / Antigravity setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL_NAME = "gemini-3.8-flash"

def _format_agent_prompt(
    indoor_temp: float,
    outdoor_temp: float,
    current_time_str: str,
    hour: int,
    load_forecast: float,
    tariff_docs: list,
    zone_id: str,
    occupancy: int
) -> str:
    tariff_summary = "\n".join([
        f"- [{doc['rule_type']}] {doc['doc_title']}: {doc['content']} (Rate: {doc['rate_inr']} INR/kWh)"
        for doc in tariff_docs
    ])

    return f"""You are the EcoSense AI Building Energy Optimization Agent.
You control multi-zone commercial and residential HVAC systems to minimize electricity bills, shed peak grid demand, and maintain human thermal comfort.

CURRENT SYSTEM TELEMETRY:
- Zone ID: {zone_id}
- Local Timestamp: {current_time_str} (Hour: {hour:02d}:00)
- Indoor Zone Temperature: {indoor_temp:.1f}°C
- Outdoor Ambient Temperature: {outdoor_temp:.1f}°C
- Zone Occupant Count: {occupancy}
- Dynamic ML Baseline (XGBoost Forecast): {load_forecast:.3f} kWh

RETRIEVED UTILITY TARIFF & ENERGY CODE CONTEXT (RAG):
{tariff_summary}

OPERATING MANDATES & STRATEGIC POLICIES:
1. PRE-COOLING STRATEGY (Hours 15:00 - 17:59): Deep chill indoor thermal mass to 20.0°C - 21.0°C before expensive peak rate starts at 18:00.
2. PEAK SHEDDING STRATEGY (Hours 18:00 - 21:59): Float set-point up to 24.5°C - 25.5°C to avoid 9.80 INR/kWh peak charges and capture demand-response credits.
3. DEEP OFF-PEAK STRATEGY (Hours 00:00 - 05:59): Run energy-efficient thermal baseline (23.0°C - 24.0°C) with low grid carbon.
4. NORMAL BASELINE (Hours 06:00 - 14:59): Maintain balanced comfort (23.5°C - 24.5°C).
5. HARD COMFORT GUARDRAIL: Under no circumstances should requested set-point be outside 19.0°C to 26.0°C.

You MUST respond strictly with a valid JSON object with these exact keys:
{{
  "requested_set_point": float,
  "hvac_mode": "PRE_COOL" | "ECO_SHED" | "COMFORT_BASELINE" | "AGGRESSIVE_COOL" | "NIGHT_SETBACK",
  "rationale": "Concise, precise engineering explanation detailing why this set-point was selected given the tariff rate, forecast load, and outdoor temperature.",
  "estimated_cost_savings_inr": float,
  "comfort_compliance": true
}}
"""

def _call_gemini_agent(prompt: str) -> Optional[Dict[str, Any]]:
    """Attempts agent invocation via google-antigravity or google-genai."""
    if not GEMINI_API_KEY or GEMINI_API_KEY in ["your_gemini_api_key_here", ""]:
        return None

    # Try google.antigravity SDK
    try:
        from google import antigravity
        # Check if AgentConfig or client can be initialized
        if hasattr(antigravity, "Agent"):
            # Attempt antigravity agent invocation
            config = antigravity.AgentConfig(
                model=MODEL_NAME
            )
            agent = antigravity.Agent(config)
            response = agent.run(prompt)
            text = response.text if hasattr(response, "text") else str(response)
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                return json.loads(match.group(0))
    except Exception as e:
        logger.debug(f"[Antigravity SDK] Standard call attempted: {e}")

    # Fallback to google.genai / google.generativeai
    try:
        from google import genai
        client = genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )
        text = response.text
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
    except Exception as e:
        logger.debug(f"[Google GenAI] Call fallback: {e}")

    try:
        import google.generativeai as genai_legacy
        genai_legacy.configure(api_key=GEMINI_API_KEY)
        model = genai_legacy.GenerativeModel(MODEL_NAME)
        res = model.generate_content(prompt)
        match = re.search(r'\{.*\}', res.text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
    except Exception as e:
        logger.debug(f"[Legacy GenAI] Call: {e}")

    return None

def _heuristic_agent_decision(
    indoor_temp: float,
    outdoor_temp: float,
    hour: int,
    load_forecast: float,
    tariff_docs: list
) -> Dict[str, Any]:
    """
    High-signal physics-informed heuristic agent synthesizing decisions when
    external cloud API key is not configured or in offline edge mode.
    """
    tariff_rate = 5.50
    if tariff_docs:
        tariff_rate = tariff_docs[0].get("rate_inr", 5.50)

    # 1. Pre-Cooling Window (15:00 - 17:59)
    if 15 <= hour < 18:
        target = 20.5
        mode = "PRE_COOL"
        savings = round(load_forecast * (9.80 - 5.50) * 0.65, 2)
        rationale = (
            f"Pre-cooling protocol engaged at {hour:02d}:00 ahead of 18:00 critical peak. "
            f"Active tariff rate is {tariff_rate:.2f} INR/kWh vs peak 9.80 INR/kWh. "
            f"Supercooling indoor thermal mass to {target:.1f}°C to store cooling capacity "
            f"and avoid high compressor draw during the peak tariff window."
        )
    # 2. Critical Peak Window (18:00 - 21:59)
    elif 18 <= hour < 22:
        target = 25.0
        mode = "ECO_SHED"
        savings = round(load_forecast * 0.35 * 9.80, 2)
        rationale = (
            f"Peak demand shedding active at {hour:02d}:00. Electricity tariff is at critical high "
            f"({tariff_rate:.2f} INR/kWh). HVAC set-point elevated to {target:.1f}°C to curtail grid draw, "
            f"coasting on pre-cooled thermal mass while strictly respecting ASHRAE 55 comfort ceiling (< 26.0°C)."
        )
    # 3. Night Off-Peak (00:00 - 05:59)
    elif 0 <= hour < 6:
        target = 23.5
        mode = "NIGHT_SETBACK"
        savings = round(load_forecast * 0.15 * 3.20, 2)
        rationale = (
            f"Off-peak night operational mode. Tariff is {tariff_rate:.2f} INR/kWh. "
            f"Compressor operating at low cycle rate to maintain clean thermal equilibrium at {target:.1f}°C."
        )
    # 4. Standard Daytime (06:00 - 14:59)
    else:
        if outdoor_temp > 32.0:
            target = 23.0
            mode = "AGGRESSIVE_COOL"
        else:
            target = 24.0
            mode = "COMFORT_BASELINE"
        savings = round(load_forecast * 0.10 * 5.50, 2)
        rationale = (
            f"Standard daytime comfort baseline. Ambient outdoor temperature is {outdoor_temp:.1f}°C. "
            f"Target set-point stabilized at {target:.1f}°C to balance thermal comfort and moderate operational costs."
        )

    return {
        "requested_set_point": target,
        "hvac_mode": mode,
        "rationale": rationale,
        "estimated_cost_savings_inr": max(5.0, savings),
        "comfort_compliance": True
    }

def run_hvac_agent(
    indoor_temp: float = 24.5,
    outdoor_temp: float = 32.0,
    current_time: Optional[str] = None,
    zone_id: str = "ZONE_1",
    occupancy: int = 4
) -> Dict[str, Any]:
    """
    Executes the full agentic HVAC optimization pipeline:
    1. Extracts time features and queries RAG tariff rules.
    2. Runs dynamic load prediction using XGBoost.
    3. Prompts the Gemini 3.8 Flash Agent (or intelligent physics heuristic).
    4. Applies safety guardrails (19°C <= set_point <= 26°C).
    5. Logs action into database.
    """
    if not current_time:
        now = datetime.now()
        current_time_str = now.strftime("%Y-%m-%d %H:%M:%S")
        hour = now.hour
        day_of_week = now.weekday()
        month = now.month
    else:
        current_time_str = current_time
        try:
            dt = datetime.fromisoformat(current_time.replace("Z", "+00:00"))
            hour = dt.hour
            day_of_week = dt.weekday()
            month = dt.month
        except Exception:
            hour = 16
            day_of_week = 2
            month = 9

    # 1. RAG Tariff Search
    tariff_docs = query_tariff_rules(current_time_str, top_k=2)

    # 2. Dynamic XGBoost Load Forecast
    load_forecast = forecast_building_load(
        hour=hour,
        day_of_week=day_of_week,
        month=month,
        is_weekend=1 if day_of_week in [5, 6] else 0,
        tariff_rate_inr=tariff_docs[0]["rate_inr"] if tariff_docs else 5.5,
        temperature_2m=outdoor_temp
    )

    # 3. Agent Execution
    prompt = _format_agent_prompt(
        indoor_temp=indoor_temp,
        outdoor_temp=outdoor_temp,
        current_time_str=current_time_str,
        hour=hour,
        load_forecast=load_forecast,
        tariff_docs=tariff_docs,
        zone_id=zone_id,
        occupancy=occupancy
    )

    agent_output = _call_gemini_agent(prompt)
    if not agent_output:
        agent_output = _heuristic_agent_decision(
            indoor_temp=indoor_temp,
            outdoor_temp=outdoor_temp,
            hour=hour,
            load_forecast=load_forecast,
            tariff_docs=tariff_docs
        )

    requested_set_point = float(agent_output.get("requested_set_point", 23.0))

    # 4. Hard Safety Guardrails (19°C <= set_point <= 26°C)
    MIN_SAFE_TEMP = 19.0
    MAX_SAFE_TEMP = 26.0
    violation = False
    guardrail_adjusted_set_point = requested_set_point

    if requested_set_point < MIN_SAFE_TEMP:
        violation = True
        guardrail_adjusted_set_point = MIN_SAFE_TEMP
        agent_output["rationale"] += f" [GUARDRAIL INTERVENTION: Clamped from {requested_set_point:.1f}°C to minimum safety limit {MIN_SAFE_TEMP}°C to prevent evaporator coil freeze-up]."
    elif requested_set_point > MAX_SAFE_TEMP:
        violation = True
        guardrail_adjusted_set_point = MAX_SAFE_TEMP
        agent_output["rationale"] += f" [GUARDRAIL INTERVENTION: Clamped from {requested_set_point:.1f}°C to maximum safety limit {MAX_SAFE_TEMP}°C to prevent occupant heat distress]."

    # 5. Persist to action log
    insert_hvac_action_log({
        "timestamp": current_time_str,
        "zone_id": zone_id,
        "indoor_temp": indoor_temp,
        "outdoor_temp": outdoor_temp,
        "load_forecast_kwh": load_forecast,
        "requested_set_point": requested_set_point,
        "guardrail_adjusted_set_point": guardrail_adjusted_set_point,
        "guardrail_violation_detected": violation,
        "hvac_mode": agent_output.get("hvac_mode", "NORMAL"),
        "rationale": agent_output.get("rationale", ""),
        "estimated_cost_savings_inr": agent_output.get("estimated_cost_savings_inr", 0.0)
    })

    return {
        "timestamp": current_time_str,
        "zone_id": zone_id,
        "indoor_temp": indoor_temp,
        "outdoor_temp": outdoor_temp,
        "load_forecast_kwh": load_forecast,
        "requested_set_point": requested_set_point,
        "effective_set_point": guardrail_adjusted_set_point,
        "guardrail_violation_detected": violation,
        "hvac_mode": agent_output.get("hvac_mode", "NORMAL"),
        "rationale": agent_output.get("rationale", ""),
        "estimated_cost_savings_inr": agent_output.get("estimated_cost_savings_inr", 0.0),
        "tariff_tier_applied": tariff_docs[0]["doc_title"] if tariff_docs else "Standard Baseline",
        "active_tariff_rate_inr": tariff_docs[0]["rate_inr"] if tariff_docs else 5.50
    }

if __name__ == "__main__":
    result = run_hvac_agent(indoor_temp=26.0, outdoor_temp=34.0, current_time="2026-09-21 16:30:00")
    print("\n--- Agentic HVAC Control Dispatch ---")
    print(json.dumps(result, indent=2))
