import asyncio
import logging
import sys
import time
from pathlib import Path
import pandas as pd
from apscheduler.schedulers.asyncio import AsyncIOScheduler

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from crawler.sources import greenhouse, lever, ashby
from crawler.score import score_dataframe, load_profile
from crawler.db import get_active_watchlist, upsert_jobs
from crawler.crawl import run_crawler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("job_radar_worker")

# In-memory cached job ID set for duplicate/unchanged skipping
_cached_job_ids: set[str] = set()


async def fetch_ats_company(company: dict, semaphore: asyncio.Semaphore) -> list[dict]:
    """
    Fetches job listings for a single ATS company entry with concurrency semaphore control,
    latency measuring, and error isolation.
    """
    name = company.get("name", "Unknown")
    ats_type = str(company.get("ats_type", "")).lower()
    ats_slug = str(company.get("ats_slug", "")).strip()

    if not ats_type or not ats_slug:
        return []

    async with semaphore:
        start_time = time.perf_counter()
        try:
            # Delegate to sync adapter inside asyncio thread executor
            loop = asyncio.get_running_loop()
            if ats_type == "greenhouse":
                jobs = await loop.run_in_executor(None, greenhouse.fetch, ats_slug)
            elif ats_type == "lever":
                jobs = await loop.run_in_executor(None, lever.fetch, ats_slug)
            elif ats_type == "ashby":
                jobs = await loop.run_in_executor(None, ashby.fetch, ats_slug)
            else:
                logger.warning(f"Unsupported ATS type '{ats_type}' for company '{name}'")
                return []

            elapsed = time.perf_counter() - start_time
            logger.info(f"[ATS SUCCESS] company='{name}' source='{ats_type}' jobs={len(jobs)} latency={elapsed:.2f}s")
            return jobs
        except Exception as e:
            elapsed = time.perf_counter() - start_time
            logger.error(f"[ATS FAILURE] company='{name}' source='{ats_type}' error='{e}' latency={elapsed:.2f}s")
            return []


async def run_ats_poller():
    """
    ATS Poller Task (Runs every 90 seconds):
    1. Fetch active company watchlist from Supabase.
    2. Poll companies concurrently (max concurrency = 10).
    3. Skip unchanged results using cached ID set.
    4. Pipeline: Normalize -> Score -> Upsert -> Collect NEWLY inserted rows.
    """
    logger.info("--- Starting ATS Poller Execution (Every 90s) ---")
    start_all = time.perf_counter()

    try:
        watchlist = get_active_watchlist()
        if not watchlist:
            logger.warning("No active companies found in watchlist.")
            return

        semaphore = asyncio.Semaphore(10)
        tasks = [fetch_ats_company(company, semaphore) for company in watchlist]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        all_raw_jobs = []
        for res in results:
            if isinstance(res, list):
                all_raw_jobs.extend(res)

        if not all_raw_jobs:
            logger.info("ATS Poller found 0 jobs across all watchlist companies.")
            return

        # Cache check & skip unchanged job IDs
        global _cached_job_ids
        new_jobs_to_process = [j for j in all_raw_jobs if j.get("id") not in _cached_job_ids]

        if not new_jobs_to_process:
            logger.info(f"ATS Poller fetched {len(all_raw_jobs)} jobs, but all were in cache (0 changed).")
            return

        logger.info(f"ATS Poller identified {len(new_jobs_to_process)} new/updated job candidates.")

        # Pipeline: Convert to DataFrame -> Score -> Upsert
        raw_df = pd.DataFrame(new_jobs_to_process)
        profile = load_profile()
        scored_df = score_dataframe(raw_df, profile)

        if scored_df.empty:
            logger.info("No ATS jobs met min_score threshold.")
            return

        newly_inserted, total_upserted = upsert_jobs(scored_df)

        # Update cached ID set
        for j in new_jobs_to_process:
            if "id" in j:
                _cached_job_ids.add(j["id"])

        elapsed_total = time.perf_counter() - start_all
        logger.info(
            f"--- [ATS POLLER COMPLETED] Scraped={len(all_raw_jobs)} | "
            f"Scored={len(scored_df)} | Upserted={total_upserted} | "
            f"NEWLY Inserted={len(newly_inserted)} | Total Latency={elapsed_total:.2f}s ---"
        )
    except Exception as e:
        logger.error(f"Unhandled error in run_ats_poller loop: {e}", exc_info=True)


async def run_jobspy_crawler():
    """
    JobSpy Crawl Task (Runs every 12 minutes with hours_old=1):
    1. Scrape LinkedIn, Indeed, Glassdoor using JobSpy.
    2. Pipeline: Normalize -> Score -> Upsert -> Collect NEWLY inserted rows.
    """
    logger.info("--- Starting JobSpy Crawl Execution (Every 12m, hours_old=1) ---")
    start_all = time.perf_counter()

    try:
        profile = load_profile()
        # Override profile hours_old to 1 hour for fast periodic crawling
        profile_fast = dict(profile)
        profile_fast["hours_old"] = 1

        loop = asyncio.get_running_loop()
        raw_df = await loop.run_in_executor(None, run_crawler)

        if raw_df.empty:
            logger.info("JobSpy Crawler returned 0 raw jobs.")
            return

        scored_df = score_dataframe(raw_df, profile_fast)
        if scored_df.empty:
            logger.info("No JobSpy jobs met min_score threshold.")
            return

        newly_inserted, total_upserted = upsert_jobs(scored_df)

        # Update cache
        global _cached_job_ids
        for job_id in scored_df["id"]:
            _cached_job_ids.add(job_id)

        elapsed_total = time.perf_counter() - start_all
        logger.info(
            f"--- [JOBSPY CRAWLER COMPLETED] Scraped={len(raw_df)} | "
            f"Scored={len(scored_df)} | Upserted={total_upserted} | "
            f"NEWLY Inserted={len(newly_inserted)} | Total Latency={elapsed_total:.2f}s ---"
        )
    except Exception as e:
        logger.error(f"Unhandled error in run_jobspy_crawler loop: {e}", exc_info=True)


def main():
    """Main worker initialization and APScheduler loop starter."""
    logger.info("Initializing Job Radar Worker Engine...")

    scheduler = AsyncIOScheduler()

    # Schedule ATS Poller job every 90 seconds
    scheduler.add_job(
        run_ats_poller,
        "interval",
        seconds=90,
        id="ats_poller_job",
        max_instances=1,
        coalesce=True
    )

    # Schedule JobSpy Crawler job every 12 minutes (720 seconds)
    scheduler.add_job(
        run_jobspy_crawler,
        "interval",
        minutes=12,
        id="jobspy_crawler_job",
        max_instances=1,
        coalesce=True
    )

    scheduler.start()
    logger.info("APScheduler started! Poller active: ATS (90s), JobSpy (12m). Press Ctrl+C to stop.")

    try:
        asyncio.get_event_loop().run_forever()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Shutting down worker scheduler...")
        scheduler.shutdown()


if __name__ == "__main__":
    main()
