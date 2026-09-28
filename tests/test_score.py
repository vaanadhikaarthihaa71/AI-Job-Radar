import pandas as pd
import pytest
from crawler.score import score_job, score_dataframe


@pytest.fixture
def sample_profile():
    return {
        "skills": ["python", "react", "sql"],
        "preferred_cities": ["San Francisco", "Remote"],
        "excluded_keywords": ["senior", "10+ years"],
        "min_score": 30
    }


def test_title_skills_weighted_higher_than_description(sample_profile):
    """Case 1: Skill in title (+15) scores 3x higher than skill in description only (+5)."""
    job_title_match = {
        "title": "Python Developer",
        "description": "Building backends",
        "location": "Dallas, TX",
        "is_remote": False
    }
    job_desc_match = {
        "title": "Software Engineer",
        "description": "We use python for backend services",
        "location": "Dallas, TX",
        "is_remote": False
    }

    score_title, skills_title = score_job(job_title_match, sample_profile)
    score_desc, skills_desc = score_job(job_desc_match, sample_profile)

    assert "python" in skills_title
    assert "python" in skills_desc
    assert score_title > score_desc
    assert score_title == 15
    assert score_desc == 5


def test_location_and_remote_bonus(sample_profile):
    """Case 2: Preferred location or remote status adds location bonus (+15)."""
    remote_job = {
        "title": "Developer",
        "description": "General role",
        "location": "Anywhere",
        "is_remote": True
    }
    preferred_city_job = {
        "title": "Developer",
        "description": "General role",
        "location": "San Francisco, CA",
        "is_remote": False
    }

    score_remote, _ = score_job(remote_job, sample_profile)
    score_city, _ = score_job(preferred_city_job, sample_profile)

    assert score_remote == 15
    assert score_city == 15


def test_entry_level_junior_bonus(sample_profile):
    """Case 3: Entry-level or junior keywords add entry bonus (+15)."""
    junior_job = {
        "title": "Junior Python Developer",
        "description": "Great role for beginners",
        "location": "Dallas, TX",
        "is_remote": False
    }

    score, skills = score_job(junior_job, sample_profile)
    # Python in title (+15) + Junior bonus (+15) = 30
    assert "python" in skills
    assert score == 30


def test_excluded_keyword_penalty(sample_profile):
    """Case 4: Excluded keyword (e.g., 'senior') applies penalty (-25)."""
    senior_job = {
        "title": "Senior Python Developer",
        "description": "Requires 10+ years experience",
        "location": "Dallas, TX",
        "is_remote": False
    }

    score, skills = score_job(senior_job, sample_profile)
    # Python (+15) - senior penalty (-25) - 10+ years penalty (-25) = -35 -> clamped to 0
    assert "python" in skills
    assert score == 0


def test_min_score_filtering_and_clamping(sample_profile):
    """Case 5: DataFrame filtering drops jobs below min_score threshold and clamps scores 0-100."""
    jobs_data = [
        {"title": "Junior Python Developer", "description": "Needs python & react", "location": "Remote", "is_remote": True},
        {"title": "PHP Developer", "description": "Legacy codebase", "location": "Miami, FL", "is_remote": False}
    ]
    df = pd.DataFrame(jobs_data)
    scored_df = score_dataframe(df, sample_profile)

    # First job: python title (+15) + react desc (+5) + remote (+15) + junior (+15) = 50 pts
    # Second job: 0 pts (dropped because 0 < min_score 30)
    assert len(scored_df) == 1
    assert scored_df.iloc[0]["score"] == 50
    assert "python" in scored_df.iloc[0]["matched_skills"]
    assert "react" in scored_df.iloc[0]["matched_skills"]
