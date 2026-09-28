import re
import sys
import requests

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


def detect_ats_from_url(url: str) -> tuple[str, str] | None:
    """
    Detects ATS provider type and company slug directly from a URL.
    Returns tuple of (ats_type, ats_slug) or None.
    """
    url_lower = url.strip().lower()

    # Greenhouse direct URL pattern
    gh_match = re.search(r"boards(?:\-api)?\.greenhouse\.io/(?:v1/boards/)?([a-zA-Z0-9_\-]+)", url_lower)
    if gh_match:
        return "greenhouse", gh_match.group(1)

    # Lever direct URL pattern
    lever_match = re.search(r"(?:jobs|api)\.lever\.co/(?:v0/postings/)?([a-zA-Z0-9_\-]+)", url_lower)
    if lever_match:
        return "lever", lever_match.group(1)

    # Ashby direct URL pattern
    ashby_match = re.search(r"jobs\.ashbyhq\.com/([a-zA-Z0-9_\-]+)", url_lower)
    if ashby_match:
        return "ashby", ashby_match.group(1)

    return None


def find_ats_slug(careers_url: str) -> tuple[str, str] | None:
    """
    Analyzes a careers page URL or generic web page to find embedded ATS type and slug.
    """
    direct_match = detect_ats_from_url(careers_url)
    if direct_match:
        return direct_match

    # Fetch page HTML and scan for embedded links / iframe sources
    try:
        response = requests.get(careers_url, headers=HEADERS, timeout=10)
        if response.status_code == 200:
            html = response.text
            
            gh = re.search(r"boards\.greenhouse\.io/embed/job_board\?for=([a-zA-Z0-9_\-]+)", html, re.IGNORECASE)
            if gh:
                return "greenhouse", gh.group(1)

            lever = re.search(r"jobs\.lever\.co/([a-zA-Z0-9_\-]+)", html, re.IGNORECASE)
            if lever:
                return "lever", lever.group(1)

            ashby = re.search(r"jobs\.ashbyhq\.com/([a-zA-Z0-9_\-]+)", html, re.IGNORECASE)
            if ashby:
                return "ashby", ashby.group(1)
    except Exception as e:
        print(f"Error fetching URL '{careers_url}': {e}", file=sys.stderr)

    return None


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python crawler/find_slug.py <CAREERS_PAGE_OR_ATS_URL>")
        sys.exit(1)

    target_url = sys.argv[1]
    result = find_ats_slug(target_url)

    if result:
        ats_type, ats_slug = result
        print(f"\n[SUCCESS] Detected ATS Provider: {ats_type.upper()}")
        print(f"          Company ATS Slug:    {ats_slug}")
    else:
        print(f"\n[FAILURE] Could not automatically determine ATS type/slug for URL: {target_url}")
