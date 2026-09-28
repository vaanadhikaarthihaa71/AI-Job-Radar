import json
import logging
import sys
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("job_radar_scorer")

CONFIG_PATH = Path(__file__).resolve().parent.parent / "config" / "profile.json"
ENTRY_LEVEL_KEYWORDS = ["junior", "entry level", "entry-level", "fresher", "associate", "graduate", "intern"]


def load_profile(config_path: Path = CONFIG_PATH) -> dict:
    """Reads user preferences, skills, and scoring thresholds from config profile."""
    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found at {config_path}")
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


def score_job(job: dict, profile: dict) -> tuple[int, list[str]]:
    """
    Scores a single job dictionary between 0 and 100 based on user profile criteria.
    Returns a tuple of (final_score, matched_skills_list).
    """
    title = str(job.get("title", "")).lower()
    description = str(job.get("description", "")).lower()
    location = str(job.get("location", "")).lower()
    is_remote = bool(job.get("is_remote", False))

    user_skills = profile.get("skills", [])
    preferred_cities = profile.get("preferred_cities", [])
    excluded_keywords = profile.get("excluded_keywords", [])

    score = 0
    matched_skills = []

    # 1. Skill Matching (Title = 15 pts, Description = 5 pts)
    for skill in user_skills:
        skill_lower = skill.lower()
        in_title = skill_lower in title
        in_desc = skill_lower in description

        if in_title:
            score += 15
            matched_skills.append(skill)
        elif in_desc:
            score += 5
            matched_skills.append(skill)

    # 2. Preferred City / Remote Bonus (+15 pts)
    location_match = any(city.lower() in location for city in preferred_cities)
    if is_remote or location_match or ("remote" in location):
        score += 15

    # 3. Entry-Level / Junior Bonus (+15 pts)
    is_entry_level = any(kw in title or kw in description for kw in ENTRY_LEVEL_KEYWORDS)
    if is_entry_level:
        score += 15

    # 4. Excluded Keywords Penalty (-25 pts per occurrence)
    for keyword in excluded_keywords:
        kw_lower = keyword.lower()
        if kw_lower in title or kw_lower in description:
            score -= 25

    # Clamp score to [0, 100]
    final_score = max(0, min(100, score))
    return final_score, matched_skills


def score_dataframe(jobs_df: pd.DataFrame, profile: dict | None = None) -> pd.DataFrame:
    """
    Scores a pandas DataFrame of jobs, attaches score and matched_skills columns,
    and drops jobs falling below min_score threshold.
    """
    if profile is None:
        profile = load_profile()

    if jobs_df.empty:
        df_copy = jobs_df.copy()
        df_copy["score"] = 0
        df_copy["matched_skills"] = [[] for _ in range(len(df_copy))]
        return df_copy

    min_score = profile.get("min_score", 30)

    scores = []
    matched_skills_list = []

    for _, row in jobs_df.iterrows():
        job_dict = row.to_dict()
        score, matched = score_job(job_dict, profile)
        scores.append(score)
        matched_skills_list.append(matched)

    df_copy = jobs_df.copy()
    df_copy["score"] = scores
    df_copy["matched_skills"] = matched_skills_list

    # Filter out jobs below min_score threshold
    initial_count = len(df_copy)
    filtered_df = df_copy[df_copy["score"] >= min_score].copy()
    filtered_df.sort_values(by="score", ascending=False, inplace=True)
    filtered_df.reset_index(drop=True, inplace=True)

    logger.info(f"Scoring complete: {initial_count} input jobs -> {len(filtered_df)} jobs above min_score ({min_score})")
    return filtered_df


if __name__ == "__main__":
    from crawler.crawl import run_crawler
    logger.info("Running Step 2: Crawl & Score Jobs...")

    raw_jobs_df = run_crawler()
    profile = load_profile()
    scored_jobs_df = score_dataframe(raw_jobs_df, profile)

    print("\n" + "=" * 80)
    print(" SCORED JOBS SUMMARY & RESULTS")
    print("=" * 80)
    print(f"\nTotal Jobs Above Min Score ({profile.get('min_score', 30)}): {len(scored_jobs_df)}")

    if not scored_jobs_df.empty:
        preview_cols = ["id", "title", "company", "score", "matched_skills", "site"]
        print("\nTop 5 Scored Jobs:")
        print(scored_jobs_df[preview_cols].head(5).to_string(index=False))
    print("=" * 80)
