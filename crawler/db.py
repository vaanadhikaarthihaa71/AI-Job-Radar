import os
import json
import logging
from pathlib import Path
from dotenv import load_dotenv
import pandas as pd

load_dotenv()

logger = logging.getLogger("job_radar_db")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
LOCAL_JOBS_FILE = DATA_DIR / "jobs.json"

_supabase_client = None
_local_job_cache: set[str] = set()


def get_supabase_client():
    """Initializes and returns singleton Supabase client using Service Role key."""
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY or "your-project-id" in SUPABASE_URL:
        return None

    try:
        from supabase import create_client
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        logger.info("Supabase service client initialized successfully.")
        return _supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        return None


def get_active_watchlist() -> list[dict]:
    """
    Fetches active company watchlist from Supabase 'companies_watchlist' table.
    Provides a fallback default seed watchlist of 34 verified active companies.
    """
    client = get_supabase_client()
    default_watchlist = [
        {"name": "Stripe", "ats_type": "greenhouse", "ats_slug": "stripe", "active": True},
        {"name": "Cloudflare", "ats_type": "greenhouse", "ats_slug": "cloudflare", "active": True},
        {"name": "Airbnb", "ats_type": "greenhouse", "ats_slug": "airbnb", "active": True},
        {"name": "Datadog", "ats_type": "greenhouse", "ats_slug": "datadog", "active": True},
        {"name": "DoorDash", "ats_type": "greenhouse", "ats_slug": "doordash", "active": True},
        {"name": "Coinbase", "ats_type": "greenhouse", "ats_slug": "coinbase", "active": True},
        {"name": "Discord", "ats_type": "greenhouse", "ats_slug": "discord", "active": True},
        {"name": "Reddit", "ats_type": "greenhouse", "ats_slug": "reddit", "active": True},
        {"name": "Duolingo", "ats_type": "greenhouse", "ats_slug": "duolingo", "active": True},
        {"name": "Brex", "ats_type": "greenhouse", "ats_slug": "brex", "active": True},
        {"name": "Ramp", "ats_type": "greenhouse", "ats_slug": "ramp", "active": True},
        {"name": "Scale AI", "ats_type": "greenhouse", "ats_slug": "scaleai", "active": True},
        {"name": "Okta", "ats_type": "greenhouse", "ats_slug": "okta", "active": True},
        {"name": "Instacart", "ats_type": "greenhouse", "ats_slug": "instacart", "active": True},
        {"name": "GitHub", "ats_type": "greenhouse", "ats_slug": "github", "active": True},
        {"name": "MongoDB", "ats_type": "greenhouse", "ats_slug": "mongodb", "active": True},
        {"name": "Elastic", "ats_type": "greenhouse", "ats_slug": "elastic", "active": True},
        {"name": "Twitch", "ats_type": "greenhouse", "ats_slug": "twitch", "active": True},
        {"name": "Pinterest", "ats_type": "greenhouse", "ats_slug": "pinterest", "active": True},
        {"name": "Spotify", "ats_type": "lever", "ats_slug": "spotify", "active": True},
        {"name": "Palantir", "ats_type": "lever", "ats_slug": "palantir", "active": True},
        {"name": "Courier", "ats_type": "lever", "ats_slug": "courier", "active": True},
        {"name": "Canva", "ats_type": "lever", "ats_slug": "canva", "active": True},
        {"name": "Netflix", "ats_type": "lever", "ats_slug": "netflix", "active": True},
        {"name": "Affirm", "ats_type": "lever", "ats_slug": "affirm", "active": True},
        {"name": "Databricks", "ats_type": "lever", "ats_slug": "databricks", "active": True},
        {"name": "Linear", "ats_type": "ashby", "ats_slug": "linear", "active": True},
        {"name": "OpenAI", "ats_type": "ashby", "ats_slug": "openai", "active": True},
        {"name": "Notion", "ats_type": "ashby", "ats_slug": "notion", "active": True},
        {"name": "Vercel", "ats_type": "ashby", "ats_slug": "vercel", "active": True},
        {"name": "Retool", "ats_type": "ashby", "ats_slug": "retool", "active": True},
        {"name": "Airtable", "ats_type": "ashby", "ats_slug": "airtable", "active": True},
        {"name": "Postman", "ats_type": "ashby", "ats_slug": "postman", "active": True},
        {"name": "Supabase", "ats_type": "ashby", "ats_slug": "supabase", "active": True}
    ]

    if not client:
        return default_watchlist

    try:
        res = client.table("companies_watchlist").select("*").eq("active", True).execute()
        if res.data and len(res.data) > 0:
            logger.info(f"Retrieved {len(res.data)} active companies from Supabase watchlist.")
            return res.data
        else:
            return default_watchlist
    except Exception as e:
        logger.warning(f"Error reading companies_watchlist from Supabase: {e}. Using default fallback.")
        return default_watchlist


def fetch_existing_job_ids() -> set[str]:
    """
    Fetches all existing job IDs currently stored in database using PostgREST pagination.
    Prevents the 1,000 row truncation limit.
    """
    client = get_supabase_client()
    all_ids = set(_local_job_cache)

    if not client:
        if LOCAL_JOBS_FILE.exists():
            try:
                with open(LOCAL_JOBS_FILE, "r", encoding="utf-8") as f:
                    local_jobs = json.load(f)
                    for j in local_jobs:
                        if "id" in j:
                            all_ids.add(j["id"])
            except Exception as e:
                logger.warning(f"Error reading local jobs cache: {e}")
        return all_ids

    start = 0
    step = 1000
    while True:
        try:
            res = client.table("jobs").select("id").range(start, start + step - 1).execute()
            if not res.data:
                break
            for row in res.data:
                if "id" in row:
                    all_ids.add(row["id"])
            if len(res.data) < step:
                break
            start += step
        except Exception as e:
            logger.warning(f"Error fetching existing job IDs from Supabase: {e}")
            break

    return all_ids


def save_jobs_to_local_file(clean_records: list[dict]):
    """Saves job records locally to data/jobs.json as a persistent data backup."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    existing_map = {}
    if LOCAL_JOBS_FILE.exists():
        try:
            with open(LOCAL_JOBS_FILE, "r", encoding="utf-8") as f:
                old_data = json.load(f)
                existing_map = {j["id"]: j for j in old_data if "id" in j}
        except Exception:
            existing_map = {}

    for rec in clean_records:
        if "id" in rec:
            existing_map[rec["id"]] = rec

    updated_list = list(existing_map.values())
    with open(LOCAL_JOBS_FILE, "w", encoding="utf-8") as f:
        json.dump(updated_list, f, indent=2)


def load_jobs_from_local_file() -> list[dict]:
    """Loads jobs from data/jobs.json fallback file."""
    if not LOCAL_JOBS_FILE.exists():
        return []
    try:
        with open(LOCAL_JOBS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def upsert_jobs(jobs: list[dict] | pd.DataFrame) -> tuple[list[dict], int]:
    """
    Upserts jobs to Supabase 'jobs' table with on_conflict='id'.
    Returns a tuple of (newly_inserted_jobs_list, total_upserted_count).
    """
    if isinstance(jobs, pd.DataFrame):
        if jobs.empty:
            return [], 0
        records = jobs.to_dict(orient="records")
    else:
        records = jobs

    if not records:
        return [], 0

    existing_ids = fetch_existing_job_ids()

    clean_records = []
    for r in records:
        rec = dict(r)
        if "matched_skills" in rec and isinstance(rec["matched_skills"], list):
            pass
        elif "matched_skills" in rec and pd.isna(rec["matched_skills"]):
            rec["matched_skills"] = []

        rec.pop("detected_at", None)
        clean_records.append(rec)

    # Save to local file backup
    save_jobs_to_local_file(clean_records)

    client = get_supabase_client()
    if not client:
        logger.info(f"Local Persistence Upsert: {len(clean_records)} jobs written to data/jobs.json")
        newly_inserted = [r for r in clean_records if r.get("id") not in existing_ids]
        for r in clean_records:
            if "id" in r:
                _local_job_cache.add(r["id"])
        return newly_inserted, len(clean_records)

    try:
        res = client.table("jobs").upsert(clean_records, on_conflict="id").execute()
        upserted_count = len(res.data) if res.data else len(clean_records)
        newly_inserted = [r for r in clean_records if r.get("id") not in existing_ids]

        for r in clean_records:
            if "id" in r:
                _local_job_cache.add(r["id"])

        logger.info(f"Supabase Upsert Complete: {upserted_count} total upserted, {len(newly_inserted)} NEWLY inserted jobs.")
        return newly_inserted, upserted_count
    except Exception as e:
        logger.error(f"Failed to upsert jobs into Supabase: {e}")
        newly_inserted = [r for r in clean_records if r.get("id") not in existing_ids]
        return newly_inserted, len(clean_records)
