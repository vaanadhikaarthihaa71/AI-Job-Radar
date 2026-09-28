import logging
import time
from datetime import datetime, timezone
import requests
from crawler.crawl import generate_job_id, detect_seniority

logger = logging.getLogger("lever_adapter")

HEADERS = {
    "User-Agent": "JobRadarBot/1.0 (+https://github.com/jobradar)",
    "Accept": "application/json"
}
TIMEOUT_SECONDS = 10
MAX_RETRIES = 3


def fetch(slug: str) -> list[dict]:
    """
    Fetches job listings from Lever's official public JSON API for a company slug.
    URL: https://api.lever.co/v0/postings/{slug}?mode=json
    """
    url = f"https://api.lever.co/v0/postings/{slug}?mode=json"
    logger.info(f"Fetching Lever jobs for slug='{slug}'...")

    data = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = requests.get(url, headers=HEADERS, timeout=TIMEOUT_SECONDS)
            if response.status_code == 200:
                data = response.json()
                break
            elif response.status_code == 404:
                logger.warning(f"Lever board not found for slug='{slug}' (404)")
                return []
            else:
                logger.warning(f"Lever API HTTP {response.status_code} for slug='{slug}' (Attempt {attempt}/{MAX_RETRIES})")
        except requests.RequestException as e:
            logger.warning(f"Request error for Lever slug='{slug}': {e} (Attempt {attempt}/{MAX_RETRIES})")

        if attempt < MAX_RETRIES:
            time.sleep(2 ** attempt)

    if not isinstance(data, list):
        return []

    jobs_list = []
    company_name = slug.capitalize()

    for item in data:
        if not isinstance(item, dict):
            continue

        ext_id = str(item.get("id", ""))
        title = str(item.get("text", "")).strip()
        job_url = str(item.get("hostedUrl", "")).strip()

        categories = item.get("categories", {}) or {}
        location_name = str(categories.get("location", "")).strip()

        is_remote = "remote" in location_name.lower() or "remote" in title.lower()

        # Parse timestamp
        created_at_ms = item.get("createdAt")
        if created_at_ms and isinstance(created_at_ms, (int, float)):
            posted_at = datetime.fromtimestamp(created_at_ms / 1000.0, tz=timezone.utc).isoformat()
        else:
            posted_at = ""

        description = str(item.get("descriptionPlain") or item.get("description") or "")

        if not job_url or not title:
            continue

        job_id = generate_job_id("lever", job_url, ext_id)
        seniority = detect_seniority(title, description)

        normalized = {
            "id": job_id,
            "title": title,
            "company": company_name,
            "location": location_name,
            "is_remote": is_remote,
            "posted_at": posted_at,
            "job_url": job_url,
            "source": "lever",
            "description": description,
            "seniority": seniority
        }
        jobs_list.append(normalized)

    logger.info(f"Lever slug='{slug}' returned {len(jobs_list)} normalized jobs")
    return jobs_list
