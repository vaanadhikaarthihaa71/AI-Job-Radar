import sys
from pathlib import Path
from collections import Counter

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from crawler.db import load_jobs_from_local_file

def main():
    jobs = load_jobs_from_local_file()
    print(f"TOTAL_DB_ROWS: {len(jobs)}")
    
    counts = Counter(j.get('source') for j in jobs)
    print("\nROWS_PER_SOURCE:")
    for src, count in counts.items():
        print(f"  - {src}: {count}")

    print("\nSAMPLE 5 REAL ROWS:")
    for i, j in enumerate(jobs[:5], 1):
        print(f"{i}. [{j.get('source')}] {j.get('title')} at {j.get('company')}")
        print(f"   URL: {j.get('job_url')}")
        print(f"   Posted: {j.get('posted_at')} | Score: {j.get('score')}/100")
        print(f"   Matched Skills: {j.get('matched_skills')}\n")

if __name__ == "__main__":
    main()
