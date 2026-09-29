import urllib.request
import json

url = "http://localhost:3000/api/chat"

questions = [
    "what's new today",
    "any remote Python roles",
    "which company posted the most this week"
]

print("=== VERIFYING AI CHAT GROUNDED API RESPONSES ===")

for q in questions:
    payload = json.dumps({"message": q, "history": []}).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as resp:
            res_data = json.loads(resp.read().decode('utf-8'))
            print(f"\n--- Question: '{q}' ---")
            print("REPLY:", res_data.get("reply"))
            referenced = res_data.get("referencedJobs", [])
            print("REFERENCED GROUNDED JOBS COUNT:", len(referenced))
            for j in referenced[:3]:
                print(f"  - [{j.get('id')}] {j.get('title')} at {j.get('company')} ({j.get('location')}) - Score: {j.get('score')}")
    except Exception as e:
        print(f"Error for question '{q}':", e)
