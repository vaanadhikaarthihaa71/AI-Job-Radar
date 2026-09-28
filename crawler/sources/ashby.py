import logging
import time
import requests
from crawler.crawl import generate_job_id, detect_seniority

logger = logging.getLogger("ashby_adapter")

HEADERS = {
    "User-Agent": "JobRadarBot/1.0 (+https://github.com/jobradar)",
    "Accept": "application/json"
}
TIMEOUT_SECONDS = 10
MAX_RETRIES = 3


def fetch(slug: str) -> list[dict]:
    """
    Fetches job listings from Ashby's official public JSON API for a company slug.
    URL: https://api.ashbyhq.com/posting-api/job-board/{slug}
    """
    url = f"https://api.ashbyhq.com/posting-api/job-board/{slug}"
    logger.info(f"Fetching Ashby jobs for slug='{slug}'...")

    data = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = requests.get(url, headers=HEADERS, timeout=TIMEOUT_SECONDS)
            if response.status_code == 200:
                data = response.json()
                break
            elif response.status_code == 404:
                logger.warning(f"Ashby board not found for slug='{slug}' (404)")
                return []
            else:
                logger.warning(f"Ashby API HTTP {response.status_code} for slug='{slug}' (Attempt {attempt}/{MAX_RETRIES})")
        except requests.RequestException as e:
            logger.warning(f"Request error for Ashby slug='{slug}': {e} (Attempt {attempt}/{MAX_RETRIES})")

        if attempt < MAX_RETRIES:
            time.sleep(2 ** attempt)

    if not isinstance(data, dict) or "jobs" not in data:
        return []

    jobs_list = []
    company_name = slug.capitalize()

    for item in data.get("jobs", []):
        if not isinstance(item, dict):
            continue

        ext_id = str(item.get("id", ""))
        title = str(item.get("title", "")).strip()
        job_url = str(item.get("jobUrl", item.get("applyUrl", ""))).strip()
        location_name = str(item.get("location", "")).strip()

        is_remote = "remote" in location_name.lower() or "remote" in title.lower() or bool(item.get("isRemote"))
        posted_at = str(item.get("publishedAt") or item.get("createdAt") or "")
        description = str(item.get("descriptionHtml") or item.get("descriptionPlain") or "")

        if not job_url or not title:
            continue

        job_id = generate_job_id("ashby", job_url, ext_id)
        seniority = detect_seniority(title, description)

        normalized = {
            "id": job_id,
            "title": title,
            "company": company_name,
            "location": location_name,
            "is_remote": is_remote,
            "posted_at": posted_at,
            "job_url": job_url,
            "source": "ashby",
            "description": description,
            "seniority": seniority
        }
        jobs_list.append(normalized)

    logger.info(f"Ashby slug='{slug}' returned {len(jobs_list)} normalized jobs")
    return jobs_list
