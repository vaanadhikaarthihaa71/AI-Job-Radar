import os
import logging
from pathlib import Path
from dotenv import load_dotenv
import pandas as pd

# Load environment variables
load_dotenv()

logger = logging.getLogger("job_radar_db")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

_supabase_client = None


def get_supabase_client():
    """Initializes and returns singleton Supabase client using Service Role key."""
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        logger.warning("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in environment.")
        return None

    try:
        from supabase import create_client
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        logger.info("Supabase client initialized successfully.")
        return _supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        return None


def get_active_watchlist() -> list[dict]:
    """
    Fetches active company watchlist from Supabase 'companies_watchlist' table.
    Provides a fallback default seed watchlist if DB is unreachable.
    """
    client = get_supabase_client()
    default_watchlist = [
        {"name": "Stripe", "ats_type": "greenhouse", "ats_slug": "stripe", "active": True},
        {"name": "Cloudflare", "ats_type": "greenhouse", "ats_slug": "cloudflare", "active": True},
        {"name": "Figma", "ats_type": "lever", "ats_slug": "figma", "active": True},
        {"name": "Spotify", "ats_type": "lever", "ats_slug": "spotify", "active": True},
        {"name": "Linear", "ats_type": "ashby", "ats_slug": "linear", "active": True},
        {"name": "OpenAI", "ats_type": "ashby", "ats_slug": "openai", "active": True}
    ]

    if not client:
        logger.info("Using default watchlist fallback.")
        return default_watchlist

    try:
        res = client.table("companies_watchlist").select("*").eq("active", True).execute()
        if res.data and len(res.data) > 0:
            logger.info(f"Retrieved {len(res.data)} active companies from Supabase watchlist.")
            return res.data
        else:
            logger.info("Supabase watchlist empty, returning seed list.")
            return default_watchlist
    except Exception as e:
        logger.warning(f"Error reading companies_watchlist from Supabase: {e}. Using default fallback.")
        return default_watchlist


def fetch_existing_job_ids() -> set[str]:
    """Fetches all existing job IDs currently stored in Supabase to track new records."""
    client = get_supabase_client()
    if not client:
        return set()

    try:
        res = client.table("jobs").select("id").execute()
        if res.data:
            return {row["id"] for row in res.data if "id" in row}
    except Exception as e:
        logger.warning(f"Error fetching existing job IDs from Supabase: {e}")
    return set()


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

    client = get_supabase_client()
    if not client:
        logger.warning("Supabase client unconfigured. Skipping DB upsert.")
        return records, len(records)

    existing_ids = fetch_existing_job_ids()

    # Format records for Postgres insertion
    clean_records = []
    for r in records:
        rec = dict(r)
        # Ensure array format for matched_skills
        if "matched_skills" in rec and isinstance(rec["matched_skills"], list):
            pass
        elif "matched_skills" in rec and pd.isna(rec["matched_skills"]):
            rec["matched_skills"] = []

        # Omit detected_at if present so Postgres default NOW() is preserved on initial insert
        rec.pop("detected_at", None)
        clean_records.append(rec)

    try:
        res = client.table("jobs").upsert(clean_records, on_conflict="id").execute()
        upserted_count = len(res.data) if res.data else len(clean_records)

        # Identify newly inserted jobs (IDs that were not in DB prior to upsert)
        newly_inserted = [r for r in clean_records if r.get("id") not in existing_ids]

        logger.info(f"Supabase Upsert Complete: {upserted_count} total upserted, {len(newly_inserted)} NEWLY inserted jobs.")
        return newly_inserted, upserted_count
    except Exception as e:
        logger.error(f"Failed to upsert jobs into Supabase: {e}")
        return [], 0
