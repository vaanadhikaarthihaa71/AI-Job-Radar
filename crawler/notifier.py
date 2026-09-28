import os
import time
import logging
import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("job_radar_notifier")

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

# In-memory deduplication set for dispatched job alerts
_sent_job_ids: set[str] = set()


def format_telegram_message(job: dict) -> str:
    """Formats job dictionary into clean HTML Telegram notification message."""
    title = job.get("title", "Untitled Job")
    company = job.get("company", "Unknown Company")
    location = job.get("location", "N/A")
    is_remote = job.get("is_remote", False)
    score = job.get("score", 0)
    matched_skills = job.get("matched_skills", [])
    job_url = job.get("job_url", "")

    remote_badge = "🌐 (Remote)" if is_remote else ""
    skills_str = ", ".join(matched_skills) if matched_skills else "General match"

    msg = (
        f"🎯 <b>NEW JOB ALERT (Score: {score}/100)</b>\n\n"
        f"💼 <b>Title:</b> {title}\n"
        f"🏢 <b>Company:</b> {company}\n"
        f"📍 <b>Location:</b> {location} {remote_badge}\n"
        f"⚡️ <b>Matched Skills:</b> {skills_str}\n\n"
        f"🔗 <a href=\"{job_url}\">Apply / View Job Listing</a>"
    )
    return msg


def send_telegram_alert(job: dict) -> bool:
    """Sends a single job alert to Telegram API with rate limiting and credentials check."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        logger.warning("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing. Skipping Telegram notification.")
        return False

    job_id = job.get("id")
    if not job_id:
        return False

    global _sent_job_ids
    if job_id in _sent_job_ids:
        logger.info(f"Job id='{job_id}' already notified. Skipping duplicate alert.")
        return False

    message_text = format_telegram_message(job)
    api_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"

    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message_text,
        "parse_mode": "HTML",
        "disable_web_page_preview": False
    }

    try:
        response = requests.post(api_url, json=payload, timeout=10)
        if response.status_code == 200:
            _sent_job_ids.add(job_id)
            logger.info(f"Successfully sent Telegram alert for job: '{job.get('title')}' at '{job.get('company')}'")
            return True
        else:
            logger.error(f"Telegram API HTTP {response.status_code} Error: {response.text}")
            return False
    except requests.RequestException as e:
        logger.error(f"Failed to send Telegram alert: {e}")
        return False


def dispatch_job_alerts(jobs: list[dict], profile: dict) -> int:
    """
    Filters newly inserted jobs by alert_threshold (default 50)
    and dispatches Telegram alerts with rate-limiting backoff (0.5s pause).
    Returns total count of successfully sent alerts.
    """
    alert_threshold = profile.get("alert_threshold", 50)
    high_match_jobs = [j for j in jobs if j.get("score", 0) >= alert_threshold]

    if not high_match_jobs:
        logger.info(f"No newly inserted jobs met alert_threshold ({alert_threshold}).")
        return 0

    logger.info(f"Dispatching Telegram alerts for {len(high_match_jobs)} jobs meeting threshold ({alert_threshold})...")
    sent_count = 0

    for job in high_match_jobs:
        success = send_telegram_alert(job)
        if success:
            sent_count += 1
            # Respect Telegram rate limit (0.5s pause between alerts)
            time.sleep(0.5)

    return sent_count
