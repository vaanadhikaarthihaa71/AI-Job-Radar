import json
import os

india_jobs = [
    # TECH & IT (INDIA)
    {
        "id": "ind-tech-001",
        "title": "Senior Full Stack Software Engineer (React / Node.js)",
        "company": "Razorpay",
        "location": "Bengaluru, Karnataka, India",
        "is_remote": True,
        "posted_at": "2026-09-29T10:00:00Z",
        "detected_at": "2026-09-29T10:02:00Z",
        "job_url": "https://razorpay.com/jobs/senior-fullstack-engineer",
        "source": "indeed",
        "industry": "tech",
        "salary": "₹28,00,000 - ₹38,00,000 / yr",
        "score": 98,
        "matched_skills": ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
        "seniority": "Senior",
        "description": "<h3>Senior Full Stack Engineer</h3><p>Build scalable payment gateways, merchant checkout APIs, and financial infrastructure handling millions of daily transactions across India.</p><ul><li>Architect microservices using Node.js, Go, and PostgreSQL.</li><li>Design responsive merchant dashboards in React and TypeScript.</li><li>Work with AWS cloud infrastructure and Kubernetes.</li></ul>"
    },
    {
        "id": "ind-tech-002",
        "title": "Backend Python & AI Data Engineer",
        "company": "Swiggy",
        "location": "Bengaluru, Karnataka, India",
        "is_remote": True,
        "posted_at": "2026-09-29T11:30:00Z",
        "detected_at": "2026-09-29T11:31:00Z",
        "job_url": "https://careers.swiggy.com/jobs/python-ai-data-engineer",
        "source": "linkedin",
        "industry": "tech",
        "salary": "₹24,00,000 - ₹32,00,000 / yr",
        "score": 95,
        "matched_skills": ["Python", "AWS", "Machine Learning", "PostgreSQL"],
        "seniority": "Mid Level",
        "description": "<h3>Backend AI Data Engineer</h3><p>Optimize real-time delivery dispatch algorithms, order batching ML models, and high-concurrency Python microservices.</p>"
    },
    {
        "id": "ind-tech-003",
        "title": "Cloud DevOps & Infrastructure Engineer",
        "company": "Infosys",
        "location": "Hyderabad, Telangana, India",
        "is_remote": False,
        "posted_at": "2026-09-29T09:00:00Z",
        "detected_at": "2026-09-29T09:01:00Z",
        "job_url": "https://careers.infosys.com/jobs/cloud-devops-hyderabad",
        "source": "indeed",
        "industry": "tech",
        "salary": "₹16,00,000 - ₹22,00,000 / yr",
        "score": 90,
        "matched_skills": ["AWS", "Docker", "Cybersecurity", "DevOps"],
        "seniority": "Mid Level",
        "description": "<h3>Cloud DevOps Engineer</h3><p>Manage enterprise multi-cloud deployments, CI/CD automation pipelines, Kubernetes clusters, and security compliance.</p>"
    },

    # HEALTHCARE & NURSING (INDIA)
    {
        "id": "ind-health-001",
        "title": "Emergency Critical Care Registered Nurse",
        "company": "Apollo Hospitals",
        "location": "Chennai, Tamil Nadu, India",
        "is_remote": False,
        "posted_at": "2026-09-29T08:30:00Z",
        "detected_at": "2026-09-29T08:32:00Z",
        "job_url": "https://careers.apollohospitals.com/nursing-critical-care",
        "source": "health_board",
        "industry": "healthcare",
        "salary": "₹6,50,000 - ₹9,50,000 / yr",
        "score": 92,
        "matched_skills": ["Registered Nurse", "Patient Care", "Emergency Medicine"],
        "seniority": "Mid Level",
        "description": "<h3>Critical Care Nurse</h3><p>Provide 24/7 ICU medical care, cardiac patient monitoring, trauma triage, and patient medication management in Apollo Specialty Hospital.</p>"
    },
    {
        "id": "ind-health-002",
        "title": "Clinical Research Associate & Medical Trial Lead",
        "company": "Fortis Healthcare",
        "location": "Gurgaon, Delhi NCR, India",
        "is_remote": True,
        "posted_at": "2026-09-29T12:00:00Z",
        "detected_at": "2026-09-29T12:01:00Z",
        "job_url": "https://www.fortishealthcare.com/careers/clinical-research-lead",
        "source": "linkedin",
        "industry": "healthcare",
        "salary": "₹10,00,000 - ₹15,00,000 / yr",
        "score": 89,
        "matched_skills": ["Clinical Research", "Telehealth", "Patient Care"],
        "seniority": "Senior",
        "description": "<h3>Clinical Research Associate</h3><p>Oversee multi-center clinical trials, ethics committee submissions, trial data verification, and patient safety protocols.</p>"
    },

    # BUSINESS & FINANCE (INDIA)
    {
        "id": "ind-fin-001",
        "title": "Senior Financial Manager & Investment Analyst",
        "company": "HDFC Bank",
        "location": "Mumbai, Maharashtra, India",
        "is_remote": False,
        "posted_at": "2026-09-29T10:15:00Z",
        "detected_at": "2026-09-29T10:16:00Z",
        "job_url": "https://www.hdfcbank.com/careers/senior-financial-analyst",
        "source": "jpmorgan",
        "industry": "finance",
        "salary": "₹22,00,000 - ₹30,00,000 / yr",
        "score": 96,
        "matched_skills": ["Financial Analysis", "Excel / Financial Modeling", "Risk Management"],
        "seniority": "Senior",
        "description": "<h3>Senior Financial Manager</h3><p>Lead corporate financial planning, quarterly risk assessment, commercial credit underwriting, and capital market strategy at HDFC Bank Treasury.</p>"
    },
    {
        "id": "ind-fin-002",
        "title": "Corporate Auditor & Tax Accountant",
        "company": "ICICI Bank",
        "location": "Mumbai, Maharashtra, India",
        "is_remote": True,
        "posted_at": "2026-09-28T15:00:00Z",
        "detected_at": "2026-09-28T15:01:00Z",
        "job_url": "https://www.icicicareers.com/auditor-tax-accountant",
        "source": "indeed",
        "industry": "finance",
        "salary": "₹14,00,000 - ₹18,00,000 / yr",
        "score": 88,
        "matched_skills": ["Accounting", "Auditing", "Taxation", "Bookkeeping"],
        "seniority": "Mid Level",
        "description": "<h3>Corporate Auditor</h3><p>Conduct internal financial audits, statutory GST/tax compliance filings, risk mitigation, and corporate balance sheet reviews.</p>"
    },

    # MARKETING & SALES (INDIA)
    {
        "id": "ind-mkt-001",
        "title": "Head of Digital Marketing & Performance Growth",
        "company": "Zomato",
        "location": "Gurgaon, Delhi NCR, India",
        "is_remote": True,
        "posted_at": "2026-09-29T09:45:00Z",
        "detected_at": "2026-09-29T09:46:00Z",
        "job_url": "https://www.zomato.com/careers/digital-marketing-head",
        "source": "linkedin",
        "industry": "marketing",
        "salary": "₹25,00,000 - ₹35,00,000 / yr",
        "score": 94,
        "matched_skills": ["Digital Marketing", "SEO / SEM", "Google Analytics", "Social Media"],
        "seniority": "Senior",
        "description": "<h3>Head of Digital Marketing</h3><p>Drive user acquisition campaigns across Google Ads, Meta, YouTube, and organic SEO. Manage performance marketing budgets and app conversion funnels.</p>"
    },
    {
        "id": "ind-mkt-002",
        "title": "Enterprise B2B Sales Manager",
        "company": "Freshworks",
        "location": "Chennai, Tamil Nadu, India",
        "is_remote": True,
        "posted_at": "2026-09-29T11:00:00Z",
        "detected_at": "2026-09-29T11:01:00Z",
        "job_url": "https://www.freshworks.com/company/careers/enterprise-sales-manager",
        "source": "ashby",
        "industry": "marketing",
        "salary": "₹20,00,000 - ₹28,00,000 OTE",
        "score": 91,
        "matched_skills": ["B2B Sales", "Salesforce / CRM"],
        "seniority": "Mid Level",
        "description": "<h3>Enterprise Sales Manager</h3><p>Own end-to-end SaaS sales pipelines across APAC enterprise accounts. Conduct product demos, contract negotiations, and account growth.</p>"
    },

    # CREATIVE & DESIGN (INDIA)
    {
        "id": "ind-des-001",
        "title": "Lead UI/UX Product Designer",
        "company": "Zoho Corporation",
        "location": "Chennai / Tenkasi, Tamil Nadu, India",
        "is_remote": True,
        "posted_at": "2026-09-29T07:15:00Z",
        "detected_at": "2026-09-29T07:16:00Z",
        "job_url": "https://www.zoho.com/careers/lead-product-designer",
        "source": "greenhouse",
        "industry": "design",
        "salary": "₹18,00,000 - ₹26,00,000 / yr",
        "score": 96,
        "matched_skills": ["UI/UX Design", "Figma", "Product Design", "Branding"],
        "seniority": "Senior",
        "description": "<h3>Lead Product Designer</h3><p>Design intuitive enterprise web applications, mobile interfaces, design systems, and user research workflows across Zoho SaaS suite.</p>"
    },

    # SKILLED TRADES & LOGISTICS (INDIA)
    {
        "id": "ind-trd-001",
        "title": "Senior Infrastructure & HVAC Project Engineer",
        "company": "Larsen & Toubro (L&T)",
        "location": "Mumbai / Pune, Maharashtra, India",
        "is_remote": False,
        "posted_at": "2026-09-28T14:00:00Z",
        "detected_at": "2026-09-28T14:02:00Z",
        "job_url": "https://www.larsentoubro.com/careers/hvac-infrastructure-engineer",
        "source": "indeed",
        "industry": "trades",
        "salary": "₹12,00,000 - ₹18,00,000 / yr",
        "score": 88,
        "matched_skills": ["HVAC Repair", "Electrical Wiring", "Quality Assurance", "Project Management"],
        "seniority": "Senior",
        "description": "<h3>HVAC Infrastructure Engineer</h3><p>Supervise commercial HVAC installation, industrial electrical wiring, MEP safety audits, and mega building project execution.</p>"
    },
    {
        "id": "ind-trd-002",
        "title": "Supply Chain Operations & Logistics Lead",
        "company": "Flipkart",
        "location": "Bengaluru, Karnataka, India",
        "is_remote": False,
        "posted_at": "2026-09-29T10:30:00Z",
        "detected_at": "2026-09-29T10:31:00Z",
        "job_url": "https://www.flipkartcareers.com/supply-chain-logistics-lead",
        "source": "indeed",
        "industry": "trades",
        "salary": "₹18,00,000 - ₹25,00,000 / yr",
        "score": 93,
        "matched_skills": ["Logistics", "Supply Chain", "Project Management"],
        "seniority": "Mid Level",
        "description": "<h3>Supply Chain Operations Lead</h3><p>Manage fulfillment center operations, last-mile express logistics routing, inventory forecasting, and warehouse automation across South India.</p>"
    },

    # EDUCATION & TRAINING (INDIA)
    {
        "id": "ind-edu-001",
        "title": "Senior Curriculum & E-Learning Designer",
        "company": "Unacademy",
        "location": "Bengaluru, Karnataka, India",
        "is_remote": True,
        "posted_at": "2026-09-29T08:00:00Z",
        "detected_at": "2026-09-29T08:01:00Z",
        "job_url": "https://unacademy.com/careers/curriculum-designer",
        "source": "linkedin",
        "industry": "education",
        "salary": "₹12,00,000 - ₹16,00,000 / yr",
        "score": 90,
        "matched_skills": ["Curriculum Design", "Instructional Design", "E-Learning Development"],
        "seniority": "Mid Level",
        "description": "<h3>Curriculum Designer</h3><p>Develop online learning modules, competitive exam prep courses, video lecture scripts, and interactive assessments for millions of Indian students.</p>"
    }
]

# Read existing jobs and prepends India jobs at the very top of the list!
jobs_file_path = os.path.join(os.path.dirname(__file__), "..", "data", "jobs.json")
try:
    with open(jobs_file_path, "r", encoding="utf-8") as f:
        existing = json.load(f)
except Exception:
    existing = []

# Filter out duplicate IDs
existing_filtered = [j for j in existing if j.get("id") not in [m["id"] for m in india_jobs]]
all_jobs = india_jobs + existing_filtered

with open(jobs_file_path, "w", encoding="utf-8") as f:
    json.dump(all_jobs, f, indent=2)

print(f"Successfully added {len(india_jobs)} India-based jobs! Total jobs in database: {len(all_jobs)}")
