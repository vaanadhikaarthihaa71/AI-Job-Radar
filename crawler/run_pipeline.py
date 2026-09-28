import sys
import time
import traceback
import logging
from pathlib import Path
import pandas as pd

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from crawler.sources import greenhouse, lever, ashby
from crawler.crawl import scrape_site, normalize_jobs, load_config, TARGET_SITES, CONFIG_PATH
from crawler.score import score_dataframe, load_profile
from crawler.db import get_active_watchlist, upsert_jobs, fetch_existing_job_ids, get_supabase_client

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("diagnostic_pipeline")


def run_full_diagnostic_pipeline():
    print("\n" + "=" * 80)
    print(" STEP 1: EXECUTING FULL DIAGNOSTIC CRAWL -> SCORE -> UPSERT PIPELINE")
    print("=" * 80 + "\n")

    profile = load_profile()
    # Override for initial seeding run per prompt instructions
    profile["hours_old"] = 72
    profile["results_wanted"] = 50
    profile["min_score"] = 10  # Lower min_score to populate real jobs immediately

    stats_by_source = {}

    def update_source_stats(source_name: str, fetched: int, kept: int, inserted: int, error: str = "None"):
        if source_name not in stats_by_source:
            stats_by_source[source_name] = {"fetched": 0, "kept": 0, "inserted": 0, "errors": []}
        stats_by_source[source_name]["fetched"] += fetched
        stats_by_source[source_name]["kept"] += kept
        stats_by_source[source_name]["inserted"] += inserted
        if error != "None":
            stats_by_source[source_name]["errors"].append(error)

    # -------------------------------------------------------------------------
    # PART A: ATS POLING PIPELINE (Greenhouse, Lever, Ashby)
    # -------------------------------------------------------------------------
    print("--- 1A: Polling Company ATS Boards (Greenhouse, Lever, Ashby) ---")
    watchlist = get_active_watchlist()
    print(f"Watchlist contains {len(watchlist)} active company targets.")

    all_ats_jobs = []
    for company in watchlist:
        cname = company.get("name", "Unknown")
        ats_type = str(company.get("ats_type", "")).lower()
        ats_slug = str(company.get("ats_slug", "")).strip()

        if not ats_type or not ats_slug:
            continue

        start_t = time.perf_counter()
        try:
            if ats_type == "greenhouse":
                jobs = greenhouse.fetch(ats_slug)
            elif ats_type == "lever":
                jobs = lever.fetch(ats_slug)
            elif ats_type == "ashby":
                jobs = ashby.fetch(ats_slug)
            else:
                jobs = []

            elapsed = time.perf_counter() - start_t
            logger.info(f"ATS '{cname}' ({ats_type}/{ats_slug}): {len(jobs)} fetched in {elapsed:.2f}s")
            update_source_stats(ats_type, len(jobs), 0, 0)
            all_ats_jobs.extend(jobs)
        except Exception as e:
            err_str = f"{e}\n{traceback.format_exc()}"
            logger.error(f"ATS Failure for '{cname}' ({ats_type}):\n{err_str}")
            update_source_stats(ats_type, 0, 0, 0, err_str)

    # -------------------------------------------------------------------------
    # PART B: JOBSPY CRAWL PIPELINE (Indeed, LinkedIn, Glassdoor)
    # -------------------------------------------------------------------------
    print("\n--- 1B: Scraping Job Aggregators via JobSpy (Indeed, LinkedIn, Glassdoor) ---")
    config = load_config(CONFIG_PATH)
    config["hours_old"] = 72
    config["results_wanted"] = 50

    search_terms = config.get("search_terms", ["Software Engineer"])
    locations = config.get("locations", ["United States"])

    all_jobspy_dfs = []
    for sterm in search_terms:
        for loc in locations:
            for site in TARGET_SITES:
                try:
                    site_jobs = scrape_site(site, sterm, loc, config)
                    fetched_cnt = len(site_jobs) if (site_jobs is not None and not site_jobs.empty) else 0
                    update_source_stats(site, fetched_cnt, 0, 0)
                    if fetched_cnt > 0:
                        all_jobspy_dfs.append(site_jobs)
                except Exception as e:
                    err_str = f"{e}\n{traceback.format_exc()}"
                    logger.error(f"JobSpy Scraper Error on site='{site}':\n{err_str}")
                    update_source_stats(site, 0, 0, 0, err_str)

    # Combine ATS + JobSpy
    all_raw_dfs = []
    if all_ats_jobs:
        all_raw_dfs.append(pd.DataFrame(all_ats_jobs))
    if all_jobspy_dfs:
        for df in all_jobspy_dfs:
            all_raw_dfs.append(normalize_jobs(df))

    if not all_raw_dfs:
        print("ERROR: Pipeline returned 0 raw jobs across all sources.")
        return

    combined_df = pd.concat(all_raw_dfs, ignore_index=True)
    dedup_df = combined_df.drop_duplicates(subset=["id"]).copy()
    print(f"\nRaw Jobs Collected: {len(combined_df)} -> Unique Deduplicated Jobs: {len(dedup_df)}")

    # -------------------------------------------------------------------------
    # PART C: SCORE & FILTER PIPELINE
    # -------------------------------------------------------------------------
    print(f"\n--- 1C: Scoring Jobs against User Profile (min_score={profile.get('min_score')}) ---")
    scored_df = score_dataframe(dedup_df, profile)
    print(f"Scored Jobs Kept (score >= {profile.get('min_score')}): {len(scored_df)}")

    # Count kept per source
    if not scored_df.empty:
        for src, count in scored_df["source"].value_counts().items():
            if src in stats_by_source:
                stats_by_source[src]["kept"] = count
            else:
                stats_by_source[src] = {"fetched": count, "kept": count, "inserted": 0, "errors": []}

    # -------------------------------------------------------------------------
    # PART D: SUPABASE / LOCAL DB UPSERT PIPELINE
    # -------------------------------------------------------------------------
    print("\n--- 1D: Upserting Jobs to Database ---")
    newly_inserted, total_upserted = upsert_jobs(scored_df)
    print(f"Upsert Completed: {total_upserted} total upserted, {len(newly_inserted)} NEWLY inserted.")

    if not scored_df.empty:
        for src, count in scored_df["source"].value_counts().items():
            if src in stats_by_source:
                stats_by_source[src]["inserted"] = count

    # -------------------------------------------------------------------------
    # SUMMARY TABLE
    # -------------------------------------------------------------------------
    print("\n" + "=" * 80)
    print(" DIAGNOSTIC PIPELINE METRICS SUMMARY PER SOURCE")
    print("=" * 80)
    print(f"{'Source':<15} | {'Fetched':<10} | {'Kept (Scored)':<15} | {'Inserted':<10} | {'Errors':<10}")
    print("-" * 70)

    for src, data in sorted(stats_by_source.items()):
        err_status = "ERRORS" if data["errors"] else "Clean"
        print(f"{src:<15} | {data['fetched']:<10} | {data['kept']:<15} | {data['inserted']:<10} | {err_status:<10}")

    print("=" * 80 + "\n")


if __name__ == "__main__":
    run_full_diagnostic_pipeline()
