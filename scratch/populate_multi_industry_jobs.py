import json
import os

multi_industry_jobs = [
  # HEALTHCARE
  {
    "id": "health-001",
    "title": "Emergency Room Registered Nurse (RN)",
    "company": "Kaiser Permanente",
    "location": "San Francisco, CA",
    "is_remote": False,
    "posted_at": "2026-09-28T14:30:00Z",
    "detected_at": "2026-09-28T14:32:00Z",
    "job_url": "https://careers.kaiserpermanente.org/job/emergency-room-rn-10293",
    "source": "health_board",
    "industry": "healthcare",
    "salary": "$115,000 - $145,000 / yr",
    "score": 92,
    "matched_skills": ["Registered Nurse", "Patient Care", "Emergency Medicine"],
    "seniority": "Mid Level",
    "description": "<h3>Emergency Room Registered Nurse</h3><p>Kaiser Permanente is seeking an experienced ER Nurse to provide critical trauma care, patient triage, and emergency medical management in our fast-paced level 1 trauma center.</p><ul><li>Provide rapid assessment and triage of acute trauma and cardiac patients.</li><li>Administer emergency medications, IV fluids, and monitor vital signs.</li><li>Collaborate with attending physicians, surgeons, and healthcare technicians.</li></ul>"
  },
  {
    "id": "health-002",
    "title": "Clinical Research Coordinator",
    "company": "Mayo Clinic",
    "location": "Rochester, MN",
    "is_remote": True,
    "posted_at": "2026-09-29T09:15:00Z",
    "detected_at": "2026-09-29T09:16:30Z",
    "job_url": "https://jobs.mayoclinic.org/clinical-research-coordinator-4482",
    "source": "mayo_jobs",
    "industry": "healthcare",
    "salary": "$75,000 - $95,000 / yr",
    "score": 88,
    "matched_skills": ["Clinical Research", "Telehealth", "Patient Care"],
    "seniority": "Mid Level",
    "description": "<h3>Clinical Research Coordinator</h3><p>Manage oncology clinical trials, patient protocol compliance, IRB documentation, and remote data collection across national clinical research cohorts.</p>"
  },

  # BUSINESS & FINANCE
  {
    "id": "fin-001",
    "title": "Senior Financial Analyst (Corporate FP&A)",
    "company": "JPMorgan Chase & Co.",
    "location": "New York, NY",
    "is_remote": True,
    "posted_at": "2026-09-29T11:00:00Z",
    "detected_at": "2026-09-29T11:01:15Z",
    "job_url": "https://careers.jpmorganchase.com/us/en/jobs/senior-financial-analyst-fp-a",
    "source": "jpmorgan",
    "industry": "finance",
    "salary": "$125,000 - $160,000 / yr",
    "score": 94,
    "matched_skills": ["Financial Analysis", "Excel / Financial Modeling", "Auditing"],
    "seniority": "Senior",
    "description": "<h3>Senior Financial Analyst</h3><p>Lead quarter-end forecasting, strategic capital allocation, valuation modeling, and executive board reporting for enterprise retail banking operations.</p>"
  },
  {
    "id": "fin-002",
    "title": "Staff Accountant & Risk Specialist",
    "company": "Goldman Sachs",
    "location": "Chicago, IL",
    "is_remote": False,
    "posted_at": "2026-09-28T18:20:00Z",
    "detected_at": "2026-09-28T18:21:00Z",
    "job_url": "https://www.goldmansachs.com/careers/staff-accountant-risk",
    "source": "goldman",
    "industry": "finance",
    "salary": "$90,000 - $115,000 / yr",
    "score": 85,
    "matched_skills": ["Accounting", "Bookkeeping", "Risk Management"],
    "seniority": "Entry Level",
    "description": "<h3>Staff Accountant</h3><p>Responsible for general ledger reconciliations, SEC regulatory filings, risk audit compliance, and monthly ledger closing.</p>"
  },

  # MARKETING & SALES
  {
    "id": "mkt-001",
    "title": "Digital Growth & Performance Marketer",
    "company": "HubSpot",
    "location": "Boston, MA",
    "is_remote": True,
    "posted_at": "2026-09-29T10:45:00Z",
    "detected_at": "2026-09-29T10:46:00Z",
    "job_url": "https://www.hubspot.com/careers/digital-growth-marketer",
    "source": "hubspot",
    "industry": "marketing",
    "salary": "$105,000 - $135,000 / yr",
    "score": 91,
    "matched_skills": ["Digital Marketing", "SEO / SEM", "Google Analytics", "Social Media"],
    "seniority": "Mid Level",
    "description": "<h3>Digital Growth Specialist</h3><p>Scale multi-channel acquisition campaigns across Google Ads, LinkedIn, Meta, and organic search. Analyze conversion funnels and optimize ad ROI.</p>"
  },
  {
    "id": "mkt-002",
    "title": "Enterprise Account Executive (SaaS)",
    "company": "Salesforce",
    "location": "Remote, US",
    "is_remote": True,
    "posted_at": "2026-09-29T12:10:00Z",
    "detected_at": "2026-09-29T12:11:00Z",
    "job_url": "https://salesforce.wd1.myworkdayjobs.com/External/job/Account-Executive-Enterprise",
    "source": "workday",
    "industry": "marketing",
    "salary": "$140,000 OTE ($280,000 Total)",
    "score": 90,
    "matched_skills": ["Salesforce / CRM", "B2B Sales"],
    "seniority": "Senior",
    "description": "<h3>Enterprise Account Executive</h3><p>Drive net-new enterprise software revenue across Fortune 500 accounts. Manage end-to-end sales cycles from discovery to executive contract negotiation.</p>"
  },

  # CREATIVE & DESIGN
  {
    "id": "des-001",
    "title": "Lead UI/UX Product Designer",
    "company": "Figma",
    "location": "San Francisco, CA",
    "is_remote": True,
    "posted_at": "2026-09-29T08:00:00Z",
    "detected_at": "2026-09-29T08:01:00Z",
    "job_url": "https://www.figma.com/careers/lead-ui-ux-designer",
    "source": "greenhouse",
    "industry": "design",
    "salary": "$150,000 - $190,000 / yr",
    "score": 96,
    "matched_skills": ["UI/UX Design", "Figma", "Product Design", "Branding"],
    "seniority": "Senior",
    "description": "<h3>Lead Product Designer</h3><p>Craft seamless interactive experiences for multiplayer design tools. Design high-fidelity wireframes, interactive component systems, and conduct usability research.</p>"
  },

  # SKILLED TRADES & LOGISTICS
  {
    "id": "trd-001",
    "title": "Master HVAC & Climate Systems Specialist",
    "company": "Trane Technologies",
    "location": "Dallas, TX",
    "is_remote": False,
    "posted_at": "2026-09-28T16:00:00Z",
    "detected_at": "2026-09-28T16:02:00Z",
    "job_url": "https://jobs.tranetechnologies.com/hvac-specialist-dallas",
    "source": "trane_jobs",
    "industry": "trades",
    "salary": "$80,000 - $105,000 / yr",
    "score": 87,
    "matched_skills": ["HVAC Repair", "Electrical Wiring", "Quality Assurance"],
    "seniority": "Senior",
    "description": "<h3>Master HVAC Technician</h3><p>Inspect, diagnose, install, and service commercial building heating, ventilation, air conditioning, and smart automated climate control units.</p>"
  },
  {
    "id": "trd-002",
    "title": "Global Supply Chain & Logistics Operations Manager",
    "company": "DHL Express",
    "location": "Atlanta, GA",
    "is_remote": True,
    "posted_at": "2026-09-29T07:30:00Z",
    "detected_at": "2026-09-29T07:31:00Z",
    "job_url": "https://careers.dhl.com/global-supply-chain-manager",
    "source": "dhl",
    "industry": "trades",
    "salary": "$110,000 - $140,000 / yr",
    "score": 93,
    "matched_skills": ["Project Management", "Logistics", "Supply Chain"],
    "seniority": "Mid Level",
    "description": "<h3>Logistics Operations Manager</h3><p>Oversee international freight routing, warehouse automation, regional fleet logistics, and real-time package delivery optimization.</p>"
  },

  # EDUCATION & TRAINING
  {
    "id": "edu-001",
    "title": "Senior Instructional Designer & E-Learning Developer",
    "company": "Coursera",
    "location": "Remote, US",
    "is_remote": True,
    "posted_at": "2026-09-29T09:30:00Z",
    "detected_at": "2026-09-29T09:31:00Z",
    "job_url": "https://about.coursera.org/careers/instructional-designer",
    "source": "ashby",
    "industry": "education",
    "salary": "$95,000 - $125,000 / yr",
    "score": 89,
    "matched_skills": ["Instructional Design", "E-Learning Development", "Curriculum Design"],
    "seniority": "Mid Level",
    "description": "<h3>Instructional Designer</h3><p>Partner with university professors and industry leaders to design interactive online courses, multimedia learning modules, and educational assessments.</p>"
  },

  # TECH (Existing & Additional)
  {
    "id": "tech-001",
    "title": "Full Stack Developer (Internal Tools & Platform)",
    "company": "Bold Penguin",
    "location": "Remote, US",
    "is_remote": True,
    "posted_at": "2026-09-29T13:00:00Z",
    "detected_at": "2026-09-29T13:01:00Z",
    "job_url": "https://www.indeed.com/viewjob?jk=aa0c40611e6f1095",
    "source": "indeed",
    "industry": "tech",
    "salary": "$130,000 - $165,000 / yr",
    "score": 95,
    "matched_skills": ["Python", "React", "TypeScript", "PostgreSQL", "AWS"],
    "seniority": "Mid Level",
    "description": "<h3>Full Stack Developer</h3><p>Build platform integrations, internal automation dashboards, REST APIs, and developer tools using React, TypeScript, Python, and cloud microservices.</p>"
  },
  {
    "id": "tech-002",
    "title": "Senior AI Infrastructure & Data Engineer",
    "company": "OpenAI",
    "location": "San Francisco, CA",
    "is_remote": True,
    "posted_at": "2026-09-29T14:00:00Z",
    "detected_at": "2026-09-29T14:00:30Z",
    "job_url": "https://jobs.ashbyhq.com/openai/66288824-8b77-4774-bc57-6825d3e6221e",
    "source": "ashby",
    "industry": "tech",
    "salary": "$210,000 - $280,000 / yr",
    "score": 98,
    "matched_skills": ["Python", "AWS", "Docker", "Machine Learning", "Node.js"],
    "seniority": "Senior",
    "description": "<h3>Senior AI Infrastructure Engineer</h3><p>Scale distributed model inference clusters, real-time data streaming pipelines, and high-performance API endpoints for ChatGPT and OpenAI developer platform.</p>"
  }
]

# Read existing jobs if any, prepend multi_industry_jobs
jobs_file_path = os.path.join(os.path.dirname(__file__), "..", "data", "jobs.json")
try:
    with open(jobs_file_path, "r", encoding="utf-8") as f:
        existing = json.load(f)
except Exception:
    existing = []

# Merge unique
all_jobs = multi_industry_jobs + [j for j in existing if j.get("id") not in [m["id"] for m in multi_industry_jobs]]

with open(jobs_file_path, "w", encoding="utf-8") as f:
    json.dump(all_jobs, f, indent=2)

print(f"Successfully written {len(all_jobs)} multi-industry jobs to data/jobs.json!")
