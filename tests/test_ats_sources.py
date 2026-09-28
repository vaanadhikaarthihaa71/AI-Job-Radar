import json
from pathlib import Path
from unittest.mock import patch, MagicMock
import pytest

from crawler.sources import greenhouse, lever, ashby
from crawler.find_slug import detect_ats_from_url

FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"


@pytest.fixture
def greenhouse_response():
    with open(FIXTURES_DIR / "greenhouse_sample.json", "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture
def lever_response():
    with open(FIXTURES_DIR / "lever_sample.json", "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture
def ashby_response():
    with open(FIXTURES_DIR / "ashby_sample.json", "r", encoding="utf-8") as f:
        return json.load(f)


def test_greenhouse_fetch(greenhouse_response):
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = greenhouse_response

    with patch("requests.get", return_value=mock_resp):
        jobs = greenhouse.fetch("stripe")
        assert len(jobs) == 1
        job = jobs[0]
        assert job["source"] == "greenhouse"
        assert job["title"] == "Software Engineer, Infrastructure"
        assert job["company"] == "Stripe"
        assert job["is_remote"] is True
        assert "567890" in job["job_url"]


def test_lever_fetch(lever_response):
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = lever_response

    with patch("requests.get", return_value=mock_resp):
        jobs = lever.fetch("figma")
        assert len(jobs) == 1
        job = jobs[0]
        assert job["source"] == "lever"
        assert job["title"] == "Product Designer"
        assert job["company"] == "Figma"
        assert job["location"] == "New York, NY"


def test_ashby_fetch(ashby_response):
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = ashby_response

    with patch("requests.get", return_value=mock_resp):
        jobs = ashby.fetch("openai")
        assert len(jobs) == 1
        job = jobs[0]
        assert job["source"] == "ashby"
        assert job["title"] == "Backend Systems Engineer"
        assert job["company"] == "Openai"
        assert job["is_remote"] is True


def test_find_slug_detection():
    gh_res = detect_ats_from_url("https://boards.greenhouse.io/stripe")
    lever_res = detect_ats_from_url("https://jobs.lever.co/figma")
    ashby_res = detect_ats_from_url("https://jobs.ashbyhq.com/openai")

    assert gh_res == ("greenhouse", "stripe")
    assert lever_res == ("lever", "figma")
    assert ashby_res == ("ashby", "openai")
