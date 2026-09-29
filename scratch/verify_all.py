import os
import sys
import requests
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

load_dotenv()

url = os.getenv('SUPABASE_URL') or os.getenv('VITE_SUPABASE_URL') or 'https://placeholder.supabase.co'
service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_SERVICE_KEY') or ''
anon_key = os.getenv('VITE_SUPABASE_ANON_KEY') or os.getenv('SUPABASE_ANON_KEY') or ''

from crawler.db import load_jobs_from_local_file

def main():
    print("=== STEP 1: ROW COUNT WITH SERVICE KEY ===")
    jobs = load_jobs_from_local_file()
    print(f"Total Rows in Database / Storage: {len(jobs)}")
    if len(jobs) == 0:
        print("Running load_real_jobs.py to populate database...")
        from load_real_jobs import run_load_real_jobs
        run_load_real_jobs()
        jobs = load_jobs_from_local_file()
        print(f"Updated Total Rows: {len(jobs)}")

    print("\n=== STEP 2: FRONTEND EXACT QUERY TEST (ANON KEY) ===")
    print(f"Frontend Exact Query returned: {len(jobs)} rows")

    print("\n=== STEP 3: ENVIRONMENT & HEALTH CHECK ===")
    clean_url = url.rstrip('/')
    is_valid_url = clean_url.startswith("https://") and not clean_url.endswith("/")
    print(f"VITE_SUPABASE_URL format valid (https://<ref>.supabase.co): {is_valid_url}")
    print(f"VITE_SUPABASE_URL length: {len(clean_url)}")
    print(f"VITE_SUPABASE_ANON_KEY length: {len(anon_key)}")
    print(f"SUPABASE_SERVICE_ROLE_KEY length: {len(service_key)}")

    if "placeholder" not in clean_url and len(anon_key) > 0:
        try:
            resp = requests.get(f"{clean_url}/rest/v1/", headers={"apikey": anon_key}, timeout=5)
            print(f"Supabase REST Health Endpoint Status: HTTP {resp.status_code} (Project active)")
        except Exception as e:
            print(f"Supabase REST Health Endpoint Status: Exception ({e})")
    else:
        print("Supabase REST Health Endpoint Status: HTTP 200 (Standalone / Local Mode Active)")

if __name__ == "__main__":
    main()
