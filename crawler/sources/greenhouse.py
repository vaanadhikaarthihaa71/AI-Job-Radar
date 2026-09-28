import logging
import time
import requests
from crawler.crawl import generate_job_id, detect_seniority

logger = logging.getLogger("greenhouse_adapter")

HEADERS = {
    "User-Agent": "JobRadarBot/1.0 (+https://github.com/jobradar)",
    "Accept": "application/json"
}
TIMEOUT_SECONDS = 10
MAX_RETRIES = 3


def fetch(slug: str) -> list[dict]:
    """
    Fetches job listings from Greenhouse's official public JSON API for a company slug.
    URL: https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?content=true
    """
    url = f"https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?content=true"
    logger.info(f"Fetching Greenhouse jobs for slug='{slug}'...")

    data = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = requests.get(url, headers=HEADERS, timeout=TIMEOUT_SECONDS)
            if response.status_code == 200:
                data = response.json()
                break
            elif response.status_code == 404:
                logger.warning(f"Greenhouse board not found for slug='{slug}' (404)")
                return []
            else:
                logger.warning(f"Greenhouse API HTTP {response.status_code} for slug='{slug}' (Attempt {attempt}/{MAX_RETRIES})")
        except requests.RequestException as e:
            logger.warning(f"Request error for Greenhouse slug='{slug}': {e} (Attempt {attempt}/{MAX_RETRIES})")
        
        if attempt < MAX_RETRIES:
            time.sleep(2 ** attempt)

    if not data or "jobs" not in data:
        return []

    jobs_list = []
    company_name = slug.capitalize()

    for item in data.get("jobs", []):
        ext_id = str(item.get("id", ""))
        title = str(item.get("title", "")).strip()
        job_url = str(item.get("absolute_url", "")).strip()
        
        location_obj = item.get("location", {})
        location_name = location_obj.get("name", "") if isinstance(location_obj, dict) else str(location_obj)
        location_name = location_name or ""
        
        is_remote = "remote" in location_name.lower() or "remote" in title.lower()
        posted_at = str(item.get("updated_at") or "")
        description = str(item.get("content") or "")

        if not job_url or not title:
            continue

        job_id = generate_job_id("greenhouse", job_url, ext_id)
        seniority = detect_seniority(title, description)

        normalized = {
            "id": job_id,
            "title": title,
            "company": company_name,
            "location": location_name,
            "is_remote": is_remote,
            "posted_at": posted_at,
            "job_url": job_url,
            "source": "greenhouse",
            "description": description,
            "seniority": seniority
        }
        jobs_list.append(normalized)

    logger.info(f"Greenhouse slug='{slug}' returned {len(jobs_list)} normalized jobs")
    return jobs_list
