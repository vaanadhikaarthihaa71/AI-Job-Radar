import os
import sys
import time
import hashlib
import re
import json
import logging
import requests
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from crawler.score import score_job, load_profile
from crawler.db import upsert_jobs, get_supabase_client

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("load_real_jobs")

HEADERS = {
    "User-Agent": "JobRadarBot/1.0 (+https://github.com/jobradar)",
    "Accept": "application/json"
}
TIMEOUT = 10


def generate_job_id(source: str, job_url: str, external_id: str = None) -> str:
    """Generates deterministic SHA-256 hash string from source + external_id/url."""
    raw_key = f"{source.strip().lower()}_{external_id or job_url.strip()}"
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()


def detect_seniority(title: str, description: str) -> str:
    """Detects job seniority level based on keywords in title and description."""
    text = f"{title} {description}".lower()
    if any(k in text for k in ["intern", "graduate", "junior", "entry level", "entry-level", "fresher", "associate"]):
        return "Entry Level"
    elif any(k in text for k in ["senior", "sr.", "sr ", "lead", "principal", "staff"]):
        return "Senior"
    elif any(k in text for k in ["director", "head of", "vp", "executive", "chief"]):
        return "Executive"
    else:
        return "Mid Level"


def fetch_remotive_jobs(profile: dict, limit: int = 50) -> list[dict]:
    """Fetches real remote tech & multi-industry jobs from Remotive API and scores them with AI engine."""
    url = f"https://remotive.com/api/remote-jobs?limit={limit}"
    logger.info(f"Fetching live jobs from Remotive API ({url})...")
    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        if resp.status_code == 200:
            data = resp.json()
            raw_jobs = data.get("jobs", [])
            logger.info(f"Remotive API returned {len(raw_jobs)} live jobs.")
            
            jobs = []
            for item in raw_jobs[:limit]:
                ext_id = str(item.get("id", ""))
                title = str(item.get("title", "")).strip()
                company = str(item.get("company_name", "")).strip()
                location = str(item.get("candidate_required_location", "Remote")).strip()
                job_url = str(item.get("url", "")).strip()
                posted_at = str(item.get("publication_date", ""))
                description = str(item.get("description", ""))
                category = str(item.get("category", "")).lower()

                if not job_url or not title:
                    continue

                industry = "tech"
                if "health" in category or "medical" in category:
                    industry = "healthcare"
                elif "finance" in category or "business" in category or "accounting" in category:
                    industry = "finance"
                elif "marketing" in category or "sales" in category:
                    industry = "marketing"
                elif "design" in category or "writing" in category:
                    industry = "design"
                elif "education" in category:
                    industry = "education"

                job_id = generate_job_id("remotive", job_url, ext_id)
                seniority = detect_seniority(title, description)

                temp_job = {
                    "id": job_id,
                    "title": title,
                    "company": company,
                    "location": location,
                    "is_remote": True,
                    "posted_at": posted_at,
                    "detected_at": datetime.now(timezone.utc).isoformat(),
                    "job_url": job_url,
                    "source": "remotive",
                    "description": description,
                    "seniority": seniority,
                    "industry": industry,
                }

                # Dynamic AI Relevance Scoring & Matched Skills Calculation
                computed_score, matched_skills = score_job(temp_job, profile)
                temp_job["score"] = max(50, computed_score)
                temp_job["matched_skills"] = matched_skills

                jobs.append(temp_job)
            return jobs
        else:
            logger.warning(f"Remotive API HTTP {resp.status_code}")
            return []
    except Exception as e:
        logger.error(f"Failed to fetch Remotive jobs: {e}")
        return []


def fetch_arbeitnow_jobs(profile: dict, limit: int = 50) -> list[dict]:
    """Fetches real jobs from Arbeitnow Job Board API and scores them with AI engine."""
    url = "https://www.arbeitnow.com/api/job-board-api"
    logger.info(f"Fetching live jobs from Arbeitnow API ({url})...")
    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        if resp.status_code == 200:
            data = resp.json()
            raw_jobs = data.get("data", [])
            logger.info(f"Arbeitnow API returned {len(raw_jobs)} live jobs.")
            
            jobs = []
            for item in raw_jobs[:limit]:
                slug = str(item.get("slug", ""))
                title = str(item.get("title", "")).strip()
                company = str(item.get("company_name", "")).strip()
                location = str(item.get("location", "Remote")).strip()
                is_remote = bool(item.get("remote", False))
                job_url = str(item.get("url", "")).strip()
                
                created_at_ts = item.get("created_at")
                if created_at_ts and isinstance(created_at_ts, (int, float)):
                    posted_at = datetime.fromtimestamp(created_at_ts, tz=timezone.utc).isoformat()
                else:
                    posted_at = datetime.now(timezone.utc).isoformat()

                description = str(item.get("description", ""))

                if not job_url or not title:
                    continue

                job_id = generate_job_id("arbeitnow", job_url, slug)
                seniority = detect_seniority(title, description)

                temp_job = {
                    "id": job_id,
                    "title": title,
                    "company": company,
                    "location": location,
                    "is_remote": is_remote,
                    "posted_at": posted_at,
                    "detected_at": datetime.now(timezone.utc).isoformat(),
                    "job_url": job_url,
                    "source": "arbeitnow",
                    "description": description,
                    "seniority": seniority,
                    "industry": "tech",
                }

                # Dynamic AI Relevance Scoring & Matched Skills Calculation
                computed_score, matched_skills = score_job(temp_job, profile)
                temp_job["score"] = max(45, computed_score)
                temp_job["matched_skills"] = matched_skills

                jobs.append(temp_job)
            return jobs
        else:
            logger.warning(f"Arbeitnow API HTTP {resp.status_code}")
            return []
    except Exception as e:
        logger.error(f"Failed to fetch Arbeitnow jobs: {e}")
        return []


def run_load_real_jobs() -> tuple[list[dict], int]:
    """
    Executes real live job ingestion from Remotive and Arbeitnow APIs,
    scores every job using the AI scoring engine, and updates data/jobs.json and Supabase DB.
    """
    profile = load_profile()
    raw_jobs = []
    raw_jobs.extend(fetch_remotive_jobs(profile, 50))
    raw_jobs.extend(fetch_arbeitnow_jobs(profile, 50))

    logger.info(f"Total raw live jobs collected: {len(raw_jobs)}")

    # Upsert jobs to DB / local persistence
    newly_inserted, total_count = upsert_jobs(raw_jobs)

    logger.info(f"Live AI Scraper Complete: {total_count} total in database, {len(newly_inserted)} NEWLY scraped.")
    return newly_inserted, total_count


if __name__ == "__main__":
    print("\n" + "=" * 80)
    print(" EXECUTING LIVE REALTIME AI JOB CRAWLER & SCORER (load_real_jobs.py)")
    print("=" * 80 + "\n")

    newly_inserted, total_count = run_load_real_jobs()
    print(f"Total Jobs in Live Dataset: {total_count}")
    print(f"Newly Scraped Live Jobs: {len(newly_inserted)}")
    print("=" * 80 + "\n")
