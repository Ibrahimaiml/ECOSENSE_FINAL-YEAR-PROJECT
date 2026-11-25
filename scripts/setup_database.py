"""
EcoSense AI - Database Setup & Verification Script
Initializes native standard PostgreSQL tables (with optional pgvector), or verifies fallback readiness.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load root .env
root_dir = Path(__file__).resolve().parent.parent
load_dotenv(root_dir / ".env")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/ecosense_db")

def init_postgres():
    print(f"Connecting to database: {DATABASE_URL}...")
    try:
        import psycopg2
        from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

        # Connect to default postgres DB to ensure ecosense_db exists
        base_url = DATABASE_URL.rsplit('/', 1)[0] + '/postgres'
        db_name = DATABASE_URL.rsplit('/', 1)[1].split('?')[0]

        try:
            conn_admin = psycopg2.connect(base_url)
            conn_admin.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            cur_admin = conn_admin.cursor()
            cur_admin.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{db_name}';")
            if not cur_admin.fetchone():
                cur_admin.execute(f"CREATE DATABASE {db_name};")
                print(f"[OK] Created database: {db_name}")
            cur_admin.close()
            conn_admin.close()
        except Exception as e:
            print(f"[INFO] Auto database creation check: {e}")

        # Connect to the target DB
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        cur = conn.cursor()

        sql_path = Path(__file__).resolve().parent / "init_db.sql"
        with open(sql_path, "r", encoding="utf-8") as f:
            sql_statements = f.read()

        cur.execute(sql_statements)
        print("[OK] Executed init_db.sql successfully.")

        # Check tables created
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = [row[0] for row in cur.fetchall()]
        print(f"[OK] Initialized PostgreSQL tables: {tables}")

        cur.close()
        conn.close()
        return True
    except Exception as err:
        print(f"[WARN] PostgreSQL connection could not be established: {err}")
        print("[INFO] Fallback layer (in-memory SQLite mock engine) will be activated for zero-downtime execution.")
        return False

if __name__ == "__main__":
    success = init_postgres()
    if not success:
        print("\nNote: When PostgreSQL is started on localhost:5432, run 'python scripts/setup_database.py' to provision.")
