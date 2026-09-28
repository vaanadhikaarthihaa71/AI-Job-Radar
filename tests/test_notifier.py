from unittest.mock import patch, MagicMock
import pytest
from crawler import notifier


@pytest.fixture(autouse=True)
def reset_notifier_state():
    """Resets the in-memory sent job IDs set before each test run."""
    notifier._sent_job_ids.clear()


def test_format_telegram_message():
    sample_job = {
        "id": "job-123",
        "title": "Backend Python Developer",
        "company": "Stripe",
        "location": "San Francisco, CA",
        "is_remote": True,
        "score": 85,
        "matched_skills": ["python", "api", "postgres"],
        "job_url": "https://boards.greenhouse.io/stripe/jobs/123"
    }

    formatted = notifier.format_telegram_message(sample_job)

    assert "Backend Python Developer" in formatted
    assert "Stripe" in formatted
    assert "85/100" in formatted
    assert "python, api, postgres" in formatted
    assert "Remote" in formatted
    assert "https://boards.greenhouse.io/stripe/jobs/123" in formatted


def test_alert_threshold_filtering():
    profile = {"alert_threshold": 50}

    job_high = {"id": "j1", "title": "Lead Dev", "company": "A", "score": 60}
    job_low = {"id": "j2", "title": "Dev", "company": "B", "score": 40}

    mock_resp = MagicMock()
    mock_resp.status_code = 200

    with patch("requests.post", return_value=mock_resp), \
         patch.object(notifier, "TELEGRAM_BOT_TOKEN", "mock_token"), \
         patch.object(notifier, "TELEGRAM_CHAT_ID", "mock_chat_id"):

        sent_count = notifier.dispatch_job_alerts([job_high, job_low], profile)

        assert sent_count == 1
        assert "j1" in notifier._sent_job_ids
        assert "j2" not in notifier._sent_job_ids


def test_deduplication_prevents_duplicate_alerts():
    profile = {"alert_threshold": 50}
    job = {"id": "j1", "title": "Lead Dev", "company": "A", "score": 70}

    mock_resp = MagicMock()
    mock_resp.status_code = 200

    with patch("requests.post", return_value=mock_resp), \
         patch.object(notifier, "TELEGRAM_BOT_TOKEN", "mock_token"), \
         patch.object(notifier, "TELEGRAM_CHAT_ID", "mock_chat_id"):

        # First run -> sends alert
        count_1 = notifier.dispatch_job_alerts([job], profile)
        assert count_1 == 1

        # Second run -> skipped due to deduplication
        count_2 = notifier.dispatch_job_alerts([job], profile)
        assert count_2 == 0
