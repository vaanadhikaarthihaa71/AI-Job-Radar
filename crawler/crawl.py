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


def generate_job_id(source: str, job_url: str, external_id: str | None = None) -> str:
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
    """Normalizes raw crawler DataFrame into Supabase jobs schema format."""
    target_columns = [
        "id", "title", "company", "location", "is_remote",
        "posted_at", "detected_at", "job_url", "source", "description", "seniority"
    ]

    if df.empty:
        return pd.DataFrame(columns=target_columns)

    now_iso = datetime.now(timezone.utc).isoformat()

    # Ensure required raw fields exist
    for col in ["title", "company", "location", "is_remote", "date_posted", "job_url", "site", "description", "id"]:
        if col not in df.columns:
            df[col] = None

    normalized = pd.DataFrame()

    # Populate target schema fields
    normalized["job_url"] = df["job_url"].astype(str).fillna("")
    normalized["source"] = df["site"].fillna("unknown").astype(str)

    # Generate deterministic hash id: source + external_id/url
    ids = []
    for idx, row in df.iterrows():
        src = str(row.get("site") or "unknown")
        url = str(row.get("job_url") or "")
        ext_id = str(row.get("id")) if pd.notna(row.get("id")) else None
        ids.append(generate_job_id(src, url, ext_id))

    normalized["id"] = ids
    normalized["title"] = df["title"].fillna("").astype(str)
    normalized["company"] = df["company"].fillna("").astype(str)
    normalized["location"] = df["location"].fillna("").astype(str)
    normalized["is_remote"] = df["is_remote"].fillna(False).astype(bool)
    normalized["posted_at"] = df["date_posted"].astype(str).fillna("")
    normalized["detected_at"] = now_iso
    normalized["description"] = df["description"].fillna("").astype(str)

    # Compute seniority
    seniorities = [
        detect_seniority(str(t), str(d))
        for t, d in zip(normalized["title"], normalized["description"])
    ]
    normalized["seniority"] = seniorities

    # Filter out empty job URLs
    normalized = normalized[normalized["job_url"] != ""]

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

    target_columns = [
        "id", "title", "company", "location", "is_remote",
        "posted_at", "detected_at", "job_url", "source", "description", "seniority"
    ]

    if not all_raw_dfs:
        logger.warning("Crawler finished with no jobs collected.")
        return pd.DataFrame(columns=target_columns)

    combined_df = pd.concat(all_raw_dfs, ignore_index=True)
    normalized_df = normalize_jobs(combined_df)

    # Drop duplicate jobs based on unique SHA-256 job id
    initial_count = len(normalized_df)
    unique_df = normalized_df.drop_duplicates(subset=["id"]).copy()
    final_count = len(unique_df)
    logger.info(f"Deduplication: {initial_count} total scraped -> {final_count} unique jobs")

    return unique_df


if __name__ == "__main__":
    logger.info("Starting Job Radar Crawler...")
    jobs_df = run_crawler()

    print("\n" + "=" * 80)
    print(" CRAWLER SUMMARY & RESULTS")
    print("=" * 80)

    if not jobs_df.empty:
        print(f"\nTotal Unique Jobs Scraped: {len(jobs_df)}")
        print("\nJob Count Per Source:")
        print(jobs_df["source"].value_counts().to_string())

        print("\nFirst 5 Scraped Rows:")
        preview_cols = ["id", "title", "company", "location", "source", "seniority"]
        print(jobs_df[preview_cols].head(5).to_string(index=False))
    else:
        print("No job data collected.")

    print("\n" + "=" * 80)
