import hashlib
import json
import logging
import sys
import re
from datetime import datetime, timezone
from pathlib import Path

# Fix for Windows AppLocker policy blocking binary _regex DLL
if 'regex' not in sys.modules or sys.modules['regex'] is None:
    sys.modules['regex'] = re

from jobspy import scrape_jobs
import pandas as pd

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("job_radar_crawler")

TARGET_SITES = ["linkedin", "indeed", "glassdoor"]
CONFIG_PATH = Path(__file__).resolve().parent.parent / "config" / "profile.json"


def load_config(config_path: Path) -> dict:
    """Reads crawler profile parameters from JSON configuration file."""
    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found at {config_path}")
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


def generate_job_id(job_url: str) -> str:
    """Generates a deterministic SHA-256 hash string from the job URL."""
    url = job_url.strip() if job_url else ""
    return hashlib.sha256(url.encode("utf-8")).hexdigest()


def scrape_site(site: str, search_term: str, location: str, config: dict) -> pd.DataFrame:
    """Executes JobSpy scrape for a single site wrapped safely in try/except."""
    logger.info(f"Scraping site='{site}' for search_term='{search_term}' in location='{location}'...")
    try:
        jobs = scrape_jobs(
            site_name=[site],
            search_term=search_term,
            location=location,
            country_indeed=config.get("country", "USA"),
            results_wanted=config.get("results_wanted", 10),
            hours_old=config.get("hours_old", 72),
            is_remote=config.get("is_remote", False),
            description_format="markdown",
        )
        if jobs is not None and not jobs.empty:
            logger.info(f"Successfully scraped {len(jobs)} raw jobs from '{site}'")
            return jobs
        else:
            logger.warning(f"No jobs returned from '{site}' for '{search_term}' in '{location}'")
            return pd.DataFrame()
    except Exception as e:
        logger.error(f"Failed scraping site='{site}' for '{search_term}' in '{location}': {e}")
        return pd.DataFrame()


def normalize_jobs(df: pd.DataFrame) -> pd.DataFrame:
    """Normalizes raw crawler DataFrame into required target schema."""
    if df.empty:
        return pd.DataFrame(columns=[
            "id", "title", "company", "location", "is_remote",
            "date_posted", "job_url", "site", "description", "first_seen_at"
        ])

    now_iso = datetime.now(timezone.utc).isoformat()

    # Ensure required raw fields exist
    for col in ["title", "company", "location", "is_remote", "date_posted", "job_url", "site", "description"]:
        if col not in df.columns:
            df[col] = None

    normalized = pd.DataFrame()

    # Populate target schema fields
    normalized["job_url"] = df["job_url"].astype(str).fillna("")
    normalized["id"] = normalized["job_url"].apply(generate_job_id)
    normalized["title"] = df["title"].fillna("").astype(str)
    normalized["company"] = df["company"].fillna("").astype(str)
    normalized["location"] = df["location"].fillna("").astype(str)
    normalized["is_remote"] = df["is_remote"].fillna(False).astype(bool)
    normalized["date_posted"] = df["date_posted"].astype(str).fillna("")
    normalized["site"] = df["site"].fillna("").astype(str)
    normalized["description"] = df["description"].fillna("").astype(str)
    normalized["first_seen_at"] = now_iso

    # Filter out empty job URLs
    normalized = normalized[normalized["job_url"] != ""]

    # Reorder columns
    target_columns = [
        "id", "title", "company", "location", "is_remote",
        "date_posted", "job_url", "site", "description", "first_seen_at"
    ]
    return normalized[target_columns]


def run_crawler() -> pd.DataFrame:
    """Orchestrates job crawling across search terms, locations, and sites."""
    config = load_config(CONFIG_PATH)
    all_raw_dfs = []

    search_terms = config.get("search_terms", [])
    locations = config.get("locations", [])

    for search_term in search_terms:
        for location in locations:
            for site in TARGET_SITES:
                site_jobs = scrape_site(site, search_term, location, config)
                if not site_jobs.empty:
                    all_raw_dfs.append(site_jobs)

    if not all_raw_dfs:
        logger.warning("Crawler finished with no jobs collected.")
        empty_df = pd.DataFrame(columns=[
            "id", "title", "company", "location", "is_remote",
            "date_posted", "job_url", "site", "description", "first_seen_at"
        ])
        return empty_df

    combined_df = pd.concat(all_raw_dfs, ignore_index=True)
    normalized_df = normalize_jobs(combined_df)

    # Drop duplicate jobs based on unique SHA-256 job id
    initial_count = len(normalized_df)
    unique_df = normalized_df.drop_duplicates(subset=["id"]).copy()
    final_count = len(unique_df)
    logger.info(f"Deduplication: {initial_count} total scraped -> {final_count} unique jobs")

    return unique_df


if __name__ == "__main__":
    logger.info("Starting Job Radar Crawler (Step 1)...")
    jobs_df = run_crawler()

    print("\n" + "=" * 80)
    print(" CRAWLER SUMMARY & RESULTS")
    print("=" * 80)

    if not jobs_df.empty:
        print(f"\nTotal Unique Jobs Scraped: {len(jobs_df)}")
        print("\nJob Count Per Site:")
        print(jobs_df["site"].value_counts().to_string())

        print("\nFirst 5 Scraped Rows:")
        preview_cols = ["id", "title", "company", "location", "site", "date_posted"]
        print(jobs_df[preview_cols].head(5).to_string(index=False))
    else:
        print("No job data collected.")

    print("\n" + "=" * 80)
