"""
Vercel Serverless Function Entrypoint for EcoSense AI FastAPI Backend.
Adds repository root and backend/ directory to sys.path and exports the FastAPI `app`.
"""

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"

for path_entry in (str(ROOT_DIR), str(BACKEND_DIR)):
    if path_entry not in sys.path:
        sys.path.insert(0, path_entry)

from backend.main import app  # noqa: E402, F401
