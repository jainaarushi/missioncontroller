export type InputFieldType =
  | "text"
  | "textarea"
  | "select"
  | "multi-select"
  | "number"
  | "slider"
  | "file"
  | "url-list"
  | "chips"
  | "radio";

export interface InputField {
  id: string;
  type: InputFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: string | number;
  helpText?: string;
  fullWidth?: boolean;
}

export interface AgentInputConfig {
  fields: InputField[];
}

export const AGENT_INPUT_CONFIGS: Record<string, AgentInputConfig> = {
  "investment-analyst": {
    fields: [
      { id: "tickers", type: "chips", label: "Stock Tickers", placeholder: "Type a ticker and press Enter (e.g., AAPL)", required: true, helpText: "Add 1-5 stock symbols to analyze" },
      { id: "analysis_type", type: "radio", label: "Analysis Type", options: [
        { value: "single", label: "Deep dive on one stock" },
        { value: "comparison", label: "Compare multiple stocks" },
        { value: "portfolio", label: "Portfolio review" },
      ], defaultValue: "single" },
      { id: "investment_horizon", type: "select", label: "Investment Horizon", options: [
        { value: "short", label: "Short-term (1-3 months)" },
        { value: "medium", label: "Medium-term (6-12 months)" },
        { value: "long", label: "Long-term (1-5 years)" },
      ], defaultValue: "medium" },
      { id: "risk_tolerance", type: "slider", label: "Risk Tolerance", min: 1, max: 10, step: 1, defaultValue: 5, helpText: "1 = Very conservative, 10 = Very aggressive" },
      { id: "notes", type: "textarea", label: "Additional Context", placeholder: "Any specific questions or concerns?", fullWidth: true },
    ],
  },

  "deep-research": {
    fields: [
      { id: "topic", type: "textarea", label: "Research Topic", placeholder: "What do you want to research? Be as specific as possible.", required: true, fullWidth: true },
      { id: "depth", type: "radio", label: "Research Depth", options: [
        { value: "quick", label: "Quick Overview (5-8 sources)" },
        { value: "moderate", label: "Moderate (10-15 sources)" },
        { value: "thorough", label: "Thorough (15-20+ sources)" },
      ], defaultValue: "moderate" },
      { id: "focus", type: "multi-select", label: "Focus Areas", options: [
        { value: "academic", label: "Academic / Papers" },
        { value: "news", label: "Recent News" },
        { value: "industry", label: "Industry Reports" },
        { value: "opinion", label: "Expert Opinions" },
        { value: "data", label: "Statistics & Data" },
      ] },
      { id: "output_format", type: "select", label: "Report Format", options: [
        { value: "report", label: "Full Research Report" },
        { value: "brief", label: "Executive Brief (1-2 pages)" },
        { value: "bullets", label: "Key Findings (Bullet Points)" },
      ], defaultValue: "report" },
    ],
  },

  "data-analyst": {
    fields: [
      { id: "file", type: "file", label: "Upload Your Data", required: true, helpText: "CSV, Excel, or JSON file (max 10MB)", fullWidth: true },
      { id: "question", type: "textarea", label: "What do you want to know?", placeholder: "e.g., 'What are the top 10 customers by revenue?' or 'Show me monthly sales trends'", required: true, fullWidth: true },
      { id: "analysis_type", type: "multi-select", label: "Analysis Types", options: [
        { value: "summary", label: "Summary Statistics" },
        { value: "trends", label: "Trends & Patterns" },
        { value: "outliers", label: "Outlier Detection" },
        { value: "correlation", label: "Correlations" },
        { value: "groupby", label: "Group-by Analysis" },
      ] },
    ],
  },

  "journalist": {
    fields: [
      { id: "story", type: "textarea", label: "Story Topic", placeholder: "What's the story? Include any specific angle or perspective.", required: true, fullWidth: true },
      { id: "style", type: "select", label: "Article Style", options: [
        { value: "news", label: "News Report" },
        { value: "feature", label: "Feature Story" },
        { value: "investigative", label: "Investigative Piece" },
        { value: "opinion", label: "Opinion / Editorial" },
        { value: "profile", label: "Profile / Interview" },
      ], defaultValue: "feature" },
      { id: "length", type: "select", label: "Target Length", options: [
        { value: "short", label: "Short (~500 words)" },
        { value: "medium", label: "Medium (~1000 words)" },
        { value: "long", label: "Long (~2000 words)" },
      ], defaultValue: "medium" },
      { id: "audience", type: "text", label: "Target Audience", placeholder: "e.g., Tech professionals, General public" },
    ],
  },

  "travel-planner": {
    fields: [
      { id: "destination", type: "text", label: "Destination", placeholder: "e.g., Tokyo, Japan", required: true },
      { id: "dates", type: "text", label: "Travel Dates", placeholder: "e.g., March 15-22 (or '7 days in April')" },
      { id: "travelers", type: "select", label: "Travelers", options: [
        { value: "solo", label: "Solo" },
        { value: "couple", label: "Couple" },
        { value: "family", label: "Family with kids" },
        { value: "group", label: "Group of friends" },
      ], defaultValue: "couple" },
      { id: "budget", type: "select", label: "Budget Level", options: [
        { value: "budget", label: "Budget-friendly" },
        { value: "moderate", label: "Moderate" },
        { value: "luxury", label: "Luxury" },
        { value: "no-limit", label: "No limit" },
      ], defaultValue: "moderate" },
      { id: "interests", type: "multi-select", label: "Interests", options: [
        { value: "food", label: "Food & Dining" },
        { value: "culture", label: "Culture & History" },
        { value: "adventure", label: "Adventure & Outdoors" },
        { value: "shopping", label: "Shopping" },
        { value: "nightlife", label: "Nightlife" },
        { value: "relaxation", label: "Relaxation & Spa" },
      ] },
      { id: "notes", type: "textarea", label: "Special Requirements", placeholder: "e.g., vegetarian options, wheelchair accessible" },
    ],
  },

  "competitor-intel": {
    fields: [
      { id: "company", type: "text", label: "Your Company / Product", placeholder: "e.g., Notion", required: true },
      { id: "competitors", type: "chips", label: "Competitors to Analyze", placeholder: "Type company name and press Enter", required: true, helpText: "Add 2-5 competitors" },
      { id: "focus", type: "multi-select", label: "Analysis Focus", options: [
        { value: "pricing", label: "Pricing" },
        { value: "features", label: "Features" },
        { value: "market", label: "Market Position" },
        { value: "strategy", label: "Go-to-Market Strategy" },
        { value: "reviews", label: "User Reviews & Sentiment" },
      ] },
      { id: "context", type: "textarea", label: "Context", placeholder: "What's driving this analysis? Planning a feature? Adjusting pricing?", fullWidth: true },
    ],
  },

  "web-intel": {
    fields: [
      { id: "urls", type: "url-list", label: "URLs to Analyze", placeholder: "https://example.com", helpText: "Add 1-5 URLs to scrape and analyze" },
      { id: "extract", type: "textarea", label: "What to Extract", placeholder: "e.g., 'Extract all pricing plans and features'", required: true, fullWidth: true },
      { id: "format", type: "select", label: "Output Format", options: [
        { value: "table", label: "Structured Table" },
        { value: "report", label: "Analysis Report" },
        { value: "json", label: "JSON Data" },
      ], defaultValue: "table" },
    ],
  },

  "sales-rep": {
    fields: [
      { id: "company", type: "text", label: "Target Company", placeholder: "e.g., Stripe, Shopify", required: true },
      { id: "your_product", type: "text", label: "Your Product/Service", placeholder: "e.g., AI-powered customer support platform", required: true },
      { id: "contact", type: "text", label: "Target Contact (optional)", placeholder: "e.g., VP of Engineering, Jane Smith" },
      { id: "value_prop", type: "textarea", label: "Key Value Proposition", placeholder: "What's the main benefit you offer?", fullWidth: true },
      { id: "outreach_type", type: "select", label: "Outreach Type", options: [
        { value: "cold", label: "Cold Outreach" },
        { value: "warm", label: "Warm Introduction" },
        { value: "follow-up", label: "Follow-up" },
        { value: "re-engage", label: "Re-engagement" },
      ], defaultValue: "cold" },
    ],
  },

  "fitness-coach": {
    fields: [
      { id: "goal", type: "radio", label: "Primary Goal", required: true, options: [
        { value: "weight-loss", label: "Lose Weight" },
        { value: "muscle-gain", label: "Build Muscle" },
        { value: "endurance", label: "Improve Endurance" },
        { value: "flexibility", label: "Flexibility & Mobility" },
        { value: "general", label: "General Fitness" },
      ] },
      { id: "experience", type: "select", label: "Experience Level", options: [
        { value: "beginner", label: "Beginner (0-6 months)" },
        { value: "intermediate", label: "Intermediate (6mo-2yr)" },
        { value: "advanced", label: "Advanced (2+ years)" },
      ], defaultValue: "beginner" },
      { id: "days_per_week", type: "slider", label: "Workout Days Per Week", min: 2, max: 7, step: 1, defaultValue: 4 },
      { id: "equipment", type: "multi-select", label: "Available Equipment", options: [
        { value: "none", label: "No equipment (bodyweight)" },
        { value: "dumbbells", label: "Dumbbells" },
        { value: "barbell", label: "Barbell & Rack" },
        { value: "machines", label: "Gym Machines" },
        { value: "bands", label: "Resistance Bands" },
      ] },
      { id: "constraints", type: "textarea", label: "Injuries / Dietary Restrictions", placeholder: "e.g., bad knees, vegetarian" },
    ],
  },

  "personal-finance": {
    fields: [
      { id: "situation", type: "textarea", label: "Financial Situation", placeholder: "Describe income, expenses, debts, savings, investments. More detail = better advice.", required: true, fullWidth: true },
      { id: "goal", type: "radio", label: "Primary Goal", required: true, options: [
        { value: "debt-free", label: "Get out of debt" },
        { value: "save", label: "Build savings" },
        { value: "invest", label: "Start investing" },
        { value: "retire", label: "Plan for retirement" },
        { value: "budget", label: "Create a budget" },
        { value: "general", label: "General financial review" },
      ] },
      { id: "age_range", type: "select", label: "Age Range", options: [
        { value: "18-25", label: "18-25" },
        { value: "26-35", label: "26-35" },
        { value: "36-45", label: "36-45" },
        { value: "46-55", label: "46-55" },
        { value: "56+", label: "56+" },
      ] },
      { id: "risk_tolerance", type: "slider", label: "Investment Risk Tolerance", min: 1, max: 10, step: 1, defaultValue: 5, helpText: "1 = Very conservative, 10 = Aggressive" },
    ],
  },

  "legal-advisor": {
    fields: [
      { id: "question", type: "textarea", label: "Legal Question", placeholder: "Describe your legal question or situation in detail.", required: true, fullWidth: true },
      { id: "area", type: "select", label: "Legal Area", options: [
        { value: "contract", label: "Contract Law" },
        { value: "employment", label: "Employment Law" },
        { value: "ip", label: "Intellectual Property" },
        { value: "business", label: "Business / Corporate" },
        { value: "real-estate", label: "Real Estate" },
        { value: "privacy", label: "Privacy / Data Protection" },
        { value: "other", label: "Other" },
      ] },
      { id: "jurisdiction", type: "text", label: "Jurisdiction", placeholder: "e.g., California, USA or United Kingdom" },
      { id: "file", type: "file", label: "Attach Document (optional)", helpText: "Upload a contract or legal document for review" },
    ],
  },

  "recruitment-agent": {
    fields: [
      { id: "role", type: "text", label: "Role Title", placeholder: "e.g., Senior Full-Stack Engineer", required: true },
      { id: "company", type: "text", label: "Company Name", placeholder: "e.g., Acme Corp" },
      { id: "level", type: "select", label: "Seniority Level", options: [
        { value: "junior", label: "Junior (0-2 years)" },
        { value: "mid", label: "Mid-level (2-5 years)" },
        { value: "senior", label: "Senior (5-8 years)" },
        { value: "lead", label: "Lead / Staff (8+ years)" },
        { value: "director", label: "Director / VP" },
      ], defaultValue: "senior" },
      { id: "location", type: "text", label: "Location / Remote Policy", placeholder: "e.g., San Francisco (hybrid) or Fully Remote" },
      { id: "requirements", type: "textarea", label: "Key Requirements", placeholder: "List the must-have skills and qualifications", fullWidth: true },
      { id: "salary_range", type: "text", label: "Salary Range", placeholder: "e.g., $150K-$200K" },
    ],
  },

  "product-launch": {
    fields: [
      { id: "product", type: "textarea", label: "Product / Feature Description", placeholder: "Describe what you're launching. What problem does it solve?", required: true, fullWidth: true },
      { id: "audience", type: "text", label: "Target Audience", placeholder: "e.g., Small business owners, Developers" },
      { id: "stage", type: "select", label: "Launch Stage", options: [
        { value: "idea", label: "Idea / Validation" },
        { value: "mvp", label: "MVP Ready" },
        { value: "beta", label: "Beta / Soft Launch" },
        { value: "launch", label: "Full Launch" },
        { value: "growth", label: "Post-Launch Growth" },
      ], defaultValue: "mvp" },
      { id: "budget", type: "select", label: "Marketing Budget", options: [
        { value: "zero", label: "$0 (Organic only)" },
        { value: "small", label: "$100-$1K" },
        { value: "medium", label: "$1K-$10K" },
        { value: "large", label: "$10K+" },
      ], defaultValue: "small" },
      { id: "competitors", type: "chips", label: "Known Competitors", placeholder: "Type competitor name and press Enter" },
    ],
  },

  // ── Career & Job Search ──────────────────────────────────
  "job-hunter": {
    fields: [
      { id: "job_title", type: "text", label: "Job Title", placeholder: "e.g., Senior Product Manager", required: true },
      { id: "location", type: "text", label: "Location", placeholder: "e.g., San Francisco, CA or Remote" },
      { id: "skills", type: "text", label: "Key Skills", placeholder: "e.g., Python, project management, data analysis" },
      { id: "preferences", type: "textarea", label: "Preferences & Requirements", placeholder: "e.g., Remote-friendly, startup culture, $150K+ salary, visa sponsorship", fullWidth: true },
    ],
  },
  "auto-applier": {
    fields: [
      { id: "job_posting", type: "textarea", label: "Job Posting", placeholder: "Paste the full job posting here", required: true, fullWidth: true },
      { id: "resume", type: "textarea", label: "Your Resume / Background", placeholder: "Paste your resume or describe your experience", required: true, fullWidth: true },
      { id: "tone", type: "select", label: "Tone", options: [
        { value: "professional", label: "Professional" },
        { value: "conversational", label: "Conversational" },
        { value: "enthusiastic", label: "Enthusiastic" },
      ], defaultValue: "professional" },
    ],
  },
  "resume-optimizer": {
    fields: [
      { id: "resume", type: "textarea", label: "Your Resume", placeholder: "Paste your full resume here", required: true, fullWidth: true },
      { id: "target_role", type: "text", label: "Target Role", placeholder: "e.g., Senior Software Engineer", required: true },
      { id: "job_description", type: "textarea", label: "Job Description (optional)", placeholder: "Paste the job description to optimize against", fullWidth: true },
    ],
  },
  "interview-coach": {
    fields: [
      { id: "role", type: "text", label: "Role You're Interviewing For", placeholder: "e.g., Product Manager at Google", required: true },
      { id: "company", type: "text", label: "Company", placeholder: "e.g., Google" },
      { id: "interview_type", type: "select", label: "Interview Type", options: [
        { value: "behavioral", label: "Behavioral" },
        { value: "technical", label: "Technical" },
        { value: "case", label: "Case Study" },
        { value: "system-design", label: "System Design" },
        { value: "general", label: "General / Mixed" },
      ], defaultValue: "general" },
      { id: "background", type: "textarea", label: "Your Background", placeholder: "Briefly describe your experience and strengths", fullWidth: true },
    ],
  },
  "salary-negotiator": {
    fields: [
      { id: "job_title", type: "text", label: "Job Title", placeholder: "e.g., Senior Data Scientist", required: true },
      { id: "location", type: "text", label: "Location", placeholder: "e.g., New York, NY", required: true },
      { id: "current_offer", type: "text", label: "Current Offer (if any)", placeholder: "e.g., $140,000 base + $20K bonus" },
      { id: "years_exp", type: "number", label: "Years of Experience", min: 0, max: 40, defaultValue: 5 },
    ],
  },

  // ── Money & Bills ──────────────────────────────────
  "subscription-killer": {
    fields: [
      { id: "subscriptions", type: "textarea", label: "Your Subscriptions", placeholder: "List all your subscriptions with monthly costs\ne.g., Netflix $15, Spotify $10, gym $50", required: true, fullWidth: true },
      { id: "must_keep", type: "textarea", label: "Must-Keep Services", placeholder: "List any subscriptions you definitely want to keep" },
    ],
  },
  "bill-negotiator": {
    fields: [
      { id: "bill_type", type: "select", label: "Bill Type", required: true, options: [
        { value: "internet", label: "Internet / Cable" },
        { value: "phone", label: "Phone / Mobile" },
        { value: "insurance", label: "Insurance" },
        { value: "rent", label: "Rent" },
        { value: "medical", label: "Medical" },
        { value: "other", label: "Other" },
      ] },
      { id: "provider", type: "text", label: "Current Provider", placeholder: "e.g., Comcast, AT&T", required: true },
      { id: "current_amount", type: "text", label: "Current Monthly Amount", placeholder: "e.g., $89.99/month", required: true },
      { id: "zip", type: "text", label: "ZIP Code", placeholder: "e.g., 94105" },
    ],
  },
  "tax-deduction-finder": {
    fields: [
      { id: "employment_type", type: "select", label: "Employment Type", required: true, options: [
        { value: "w2", label: "W-2 Employee" },
        { value: "self-employed", label: "Self-Employed / 1099" },
        { value: "small-business", label: "Small Business Owner" },
        { value: "freelancer", label: "Freelancer" },
        { value: "mixed", label: "Mixed (W-2 + Side Income)" },
      ] },
      { id: "situation", type: "textarea", label: "Your Situation", placeholder: "Describe your financial situation: homeowner? kids? student loans? home office? car for work? medical expenses?", required: true, fullWidth: true },
      { id: "state", type: "text", label: "State", placeholder: "e.g., California" },
    ],
  },
  "credit-score-coach": {
    fields: [
      { id: "score_range", type: "select", label: "Current Score Range", required: true, options: [
        { value: "300-579", label: "Poor (300-579)" },
        { value: "580-669", label: "Fair (580-669)" },
        { value: "670-739", label: "Good (670-739)" },
        { value: "740-799", label: "Very Good (740-799)" },
        { value: "800-850", label: "Excellent (800-850)" },
      ] },
      { id: "situation", type: "textarea", label: "Credit Situation", placeholder: "Describe your credit situation: any late payments? collections? credit card balances? how many accounts?", required: true, fullWidth: true },
      { id: "goal", type: "select", label: "Goal", options: [
        { value: "mortgage", label: "Qualify for a mortgage" },
        { value: "auto-loan", label: "Get a better auto loan rate" },
        { value: "credit-card", label: "Get approved for a credit card" },
        { value: "general", label: "General improvement" },
      ], defaultValue: "general" },
    ],
  },
  "deal-spotter": {
    fields: [
      { id: "item", type: "text", label: "What are you looking for?", placeholder: "e.g., Sony WH-1000XM5 headphones", required: true },
      { id: "budget", type: "text", label: "Budget", placeholder: "e.g., Under $300" },
      { id: "urgency", type: "select", label: "How soon do you need it?", options: [
        { value: "now", label: "ASAP" },
        { value: "week", label: "Within a week" },
        { value: "flexible", label: "Can wait for a deal" },
      ], defaultValue: "flexible" },
    ],
  },

  // ── Legal & Rights ──────────────────────────────────
  "dispute-fighter": {
    fields: [
      { id: "dispute_type", type: "select", label: "Dispute Type", required: true, options: [
        { value: "billing", label: "Billing Error" },
        { value: "credit-report", label: "Credit Report Error" },
        { value: "warranty", label: "Warranty Claim" },
        { value: "service", label: "Poor Service / Breach" },
        { value: "insurance", label: "Insurance Claim Denial" },
        { value: "other", label: "Other" },
      ] },
      { id: "details", type: "textarea", label: "Dispute Details", placeholder: "Describe what happened, when, and what you've tried so far", required: true, fullWidth: true },
      { id: "company", type: "text", label: "Company / Organization", placeholder: "e.g., Chase Bank, Verizon", required: true },
    ],
  },
  "benefits-finder": {
    fields: [
      { id: "situation", type: "textarea", label: "Your Situation", placeholder: "Describe your situation: employment status, family size, income range, any disabilities, veteran status, etc.", required: true, fullWidth: true },
      { id: "categories", type: "text", label: "Benefit Categories (optional)", placeholder: "e.g., healthcare, food assistance, housing, education" },
    ],
  },
  "lease-reviewer": {
    fields: [
      { id: "lease_text", type: "textarea", label: "Lease Text", placeholder: "Paste your lease agreement text here", required: true, fullWidth: true },
      { id: "state", type: "text", label: "State", placeholder: "e.g., New York" },
      { id: "concerns", type: "textarea", label: "Specific Concerns", placeholder: "Any specific clauses or terms you're worried about?" },
    ],
  },
  "immigration-helper": {
    fields: [
      { id: "current_country", type: "text", label: "Current Country", placeholder: "e.g., India", required: true },
      { id: "destination", type: "text", label: "Destination Country", placeholder: "e.g., United States", required: true },
      { id: "purpose", type: "select", label: "Purpose", required: true, options: [
        { value: "work", label: "Work" },
        { value: "study", label: "Study" },
        { value: "family", label: "Family Reunification" },
        { value: "business", label: "Business / Investment" },
        { value: "permanent", label: "Permanent Residency" },
        { value: "tourist", label: "Tourism / Visit" },
      ] },
      { id: "details", type: "textarea", label: "Additional Details", placeholder: "Education, work experience, any existing applications or status", fullWidth: true },
    ],
  },
  "small-claims-advisor": {
    fields: [
      { id: "dispute", type: "textarea", label: "Dispute Description", placeholder: "Describe what happened and why you're considering small claims court", required: true, fullWidth: true },
      { id: "amount", type: "text", label: "Amount in Dispute", placeholder: "e.g., $3,500", required: true },
      { id: "state", type: "text", label: "State", placeholder: "e.g., California", required: true },
    ],
  },

  // ── Housing & Moving ──────────────────────────────────
  "apartment-scout": {
    fields: [
      { id: "city", type: "text", label: "City / Area", placeholder: "e.g., Austin, TX", required: true },
      { id: "budget", type: "text", label: "Monthly Budget", placeholder: "e.g., $1,500-$2,000", required: true },
      { id: "bedrooms", type: "select", label: "Bedrooms", options: [
        { value: "studio", label: "Studio" },
        { value: "1", label: "1 Bedroom" },
        { value: "2", label: "2 Bedrooms" },
        { value: "3+", label: "3+ Bedrooms" },
      ], defaultValue: "1" },
      { id: "priorities", type: "text", label: "Top Priorities", placeholder: "e.g., near transit, pet-friendly, in-unit laundry, safe neighborhood" },
    ],
  },
  "moving-coordinator": {
    fields: [
      { id: "from_to", type: "text", label: "Moving From → To", placeholder: "e.g., NYC to Austin, TX", required: true },
      { id: "move_date", type: "text", label: "Target Move Date", placeholder: "e.g., June 1, 2025", required: true },
      { id: "home_size", type: "select", label: "Home Size", options: [
        { value: "studio", label: "Studio / 1BR" },
        { value: "2br", label: "2-3 Bedroom" },
        { value: "house", label: "House / 4+ BR" },
      ], defaultValue: "studio" },
      { id: "budget", type: "select", label: "Moving Budget", options: [
        { value: "diy", label: "DIY / Minimal" },
        { value: "moderate", label: "Moderate ($1K-$5K)" },
        { value: "full-service", label: "Full Service ($5K+)" },
      ], defaultValue: "moderate" },
    ],
  },
  "utility-optimizer": {
    fields: [
      { id: "utility_type", type: "select", label: "Utility Type", required: true, options: [
        { value: "internet", label: "Internet" },
        { value: "electric", label: "Electricity" },
        { value: "gas", label: "Gas" },
        { value: "phone", label: "Phone / Mobile" },
        { value: "bundle", label: "Internet + TV Bundle" },
      ] },
      { id: "zip", type: "text", label: "ZIP Code", placeholder: "e.g., 78701", required: true },
      { id: "current_plan", type: "text", label: "Current Plan & Price", placeholder: "e.g., AT&T 300Mbps $65/mo" },
      { id: "needs", type: "textarea", label: "Your Needs", placeholder: "e.g., work from home, need 500+ Mbps, 2 people streaming" },
    ],
  },
  // ── Health & Medical ──────────────────────────────────
  "medical-bill-auditor": {
    fields: [
      { id: "bill_details", type: "textarea", label: "Bill Details", placeholder: "List each charge: procedure name, CPT code (if shown), and amount charged", required: true, fullWidth: true },
      { id: "insurance_status", type: "select", label: "Insurance Status", options: [
        { value: "insured", label: "Have Insurance" },
        { value: "uninsured", label: "No Insurance" },
        { value: "denied", label: "Claim Denied" },
      ], defaultValue: "insured" },
      { id: "total_amount", type: "text", label: "Total Amount", placeholder: "e.g., $4,350", required: true },
    ],
  },
  "insurance-comparer": {
    fields: [
      { id: "insurance_type", type: "select", label: "Insurance Type", required: true, options: [
        { value: "health", label: "Health Insurance" },
        { value: "auto", label: "Auto Insurance" },
        { value: "home", label: "Home / Renters Insurance" },
        { value: "life", label: "Life Insurance" },
        { value: "pet", label: "Pet Insurance" },
      ] },
      { id: "location", type: "text", label: "Location", placeholder: "e.g., Chicago, IL", required: true },
      { id: "situation", type: "textarea", label: "Your Situation", placeholder: "Describe what you need: family size, health conditions, vehicle details, home value, etc.", required: true, fullWidth: true },
    ],
  },
  "symptom-researcher": {
    fields: [
      { id: "symptoms", type: "textarea", label: "Symptoms", placeholder: "Describe your symptoms: what, where, when they started, severity, what makes it better/worse", required: true, fullWidth: true },
      { id: "age_gender", type: "text", label: "Age & Gender (optional)", placeholder: "e.g., 35, Female" },
      { id: "history", type: "textarea", label: "Relevant Medical History", placeholder: "Any existing conditions, medications, recent changes" },
    ],
  },
  "prescription-saver": {
    fields: [
      { id: "medications", type: "textarea", label: "Medications", placeholder: "List each medication with dosage\ne.g., Lisinopril 10mg, Atorvastatin 20mg", required: true, fullWidth: true },
      { id: "zip", type: "text", label: "ZIP Code", placeholder: "e.g., 60601" },
      { id: "insurance", type: "select", label: "Insurance Status", options: [
        { value: "insured", label: "Have Insurance" },
        { value: "uninsured", label: "No Insurance" },
        { value: "medicare", label: "Medicare" },
        { value: "medicaid", label: "Medicaid" },
      ], defaultValue: "insured" },
    ],
  },

  // ── Education ──────────────────────────────────
  "scholarship-hunter": {
    fields: [
      { id: "profile", type: "textarea", label: "Your Profile", placeholder: "GPA, major, extracurriculars, background, financial need, etc.", required: true, fullWidth: true },
      { id: "education_level", type: "select", label: "Education Level", required: true, options: [
        { value: "high-school", label: "High School Senior" },
        { value: "undergrad", label: "Undergraduate" },
        { value: "graduate", label: "Graduate / Masters" },
        { value: "phd", label: "PhD / Doctoral" },
      ] },
      { id: "field", type: "text", label: "Field of Study", placeholder: "e.g., Computer Science, Nursing" },
    ],
  },
  "college-advisor": {
    fields: [
      { id: "major", type: "text", label: "Major / Field", placeholder: "e.g., Computer Science, Pre-Med", required: true },
      { id: "degree_level", type: "select", label: "Degree Level", required: true, options: [
        { value: "bachelors", label: "Bachelor's" },
        { value: "masters", label: "Master's" },
        { value: "phd", label: "PhD" },
        { value: "associate", label: "Associate's" },
      ] },
      { id: "preferences", type: "textarea", label: "Preferences", placeholder: "Location, campus size, budget, public vs private, etc." },
      { id: "profile", type: "textarea", label: "Your Profile", placeholder: "GPA, test scores, activities, work experience", fullWidth: true },
    ],
  },

  // ── Smart Shopping ──────────────────────────────────
  "return-assistant": {
    fields: [
      { id: "store", type: "text", label: "Store / Retailer", placeholder: "e.g., Amazon, Best Buy, Zara", required: true },
      { id: "product", type: "text", label: "Product", placeholder: "e.g., Wireless earbuds, Winter jacket", required: true },
      { id: "issue", type: "textarea", label: "Issue / Reason for Return", placeholder: "Describe what's wrong or why you want to return it", required: true, fullWidth: true },
    ],
  },
  "car-buy-negotiator": {
    fields: [
      { id: "car", type: "text", label: "Car Make & Model", placeholder: "e.g., 2024 Toyota RAV4 XLE", required: true },
      { id: "zip", type: "text", label: "ZIP Code", placeholder: "e.g., 90210" },
      { id: "buying_type", type: "select", label: "Buying Type", options: [
        { value: "new", label: "New" },
        { value: "used", label: "Used" },
        { value: "lease", label: "Lease" },
        { value: "cpo", label: "Certified Pre-Owned" },
      ], defaultValue: "new" },
      { id: "budget", type: "text", label: "Budget", placeholder: "e.g., Under $35,000" },
    ],
  },

  // ── Freelance & Side Income ──────────────────────────────────
  "freelance-bid-writer": {
    fields: [
      { id: "project_listing", type: "textarea", label: "Project Listing", placeholder: "Paste the project description / job listing", required: true, fullWidth: true },
      { id: "your_skills", type: "textarea", label: "Your Skills & Experience", placeholder: "Describe your relevant skills, past projects, and expertise", required: true, fullWidth: true },
      { id: "rate", type: "text", label: "Your Rate", placeholder: "e.g., $75/hour or $2,000 fixed" },
    ],
  },
  "side-hustle-matcher": {
    fields: [
      { id: "skills", type: "textarea", label: "Your Skills & Interests", placeholder: "What are you good at? What do you enjoy? Include both professional and personal skills.", required: true, fullWidth: true },
      { id: "hours", type: "select", label: "Available Hours/Week", options: [
        { value: "5", label: "Under 5 hours" },
        { value: "10", label: "5-10 hours" },
        { value: "20", label: "10-20 hours" },
        { value: "30+", label: "20+ hours" },
      ], defaultValue: "10" },
      { id: "capital", type: "select", label: "Startup Capital", options: [
        { value: "0", label: "$0 (No investment)" },
        { value: "500", label: "Under $500" },
        { value: "2000", label: "$500-$2,000" },
        { value: "5000+", label: "$2,000+" },
      ], defaultValue: "0" },
      { id: "income_goal", type: "select", label: "Monthly Income Goal", options: [
        { value: "500", label: "$500/month" },
        { value: "1000", label: "$1,000/month" },
        { value: "3000", label: "$3,000/month" },
        { value: "5000+", label: "$5,000+/month" },
      ], defaultValue: "1000" },
    ],
  },
  "contract-reviewer": {
    fields: [
      { id: "contract_text", type: "textarea", label: "Contract Text", placeholder: "Paste the contract text here", required: true, fullWidth: true },
      { id: "contract_type", type: "select", label: "Contract Type", options: [
        { value: "freelance", label: "Freelance / Service Agreement" },
        { value: "employment", label: "Employment Contract" },
        { value: "nda", label: "NDA / Confidentiality" },
        { value: "partnership", label: "Partnership Agreement" },
        { value: "saas", label: "SaaS / Software License" },
        { value: "other", label: "Other" },
      ] },
      { id: "your_role", type: "select", label: "Your Role", options: [
        { value: "signing", label: "I'm signing this" },
        { value: "drafting", label: "I drafted this" },
        { value: "reviewing", label: "Reviewing for someone else" },
      ], defaultValue: "signing" },
    ],
  },
};

// Serialize form values into a structured description string for the task
export function serializeAgentInput(values: Record<string, unknown>): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      lines.push(`${key}: ${value.join(", ")}`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  return lines.join("\n");
}

// Generate a human-readable task title from agent-specific form values
export function generateTaskTitle(slug: string, values: Record<string, unknown>): string {
  switch (slug) {
    case "investment-analyst": {
      const tickers = (values.tickers as string[]) || [];
      const type = values.analysis_type || "analysis";
      return `Analyze ${tickers.join(", ")} — ${type}`;
    }
    case "deep-research":
      return ((values.topic as string) || "Research task").slice(0, 80);
    case "data-analyst":
      return ((values.question as string) || "Data analysis").slice(0, 80);
    case "journalist":
      return ((values.story as string) || "Article").slice(0, 80);
    case "travel-planner":
      return `Plan trip to ${values.destination || "destination"}`;
    case "competitor-intel": {
      const competitors = (values.competitors as string[]) || [];
      return `Competitive analysis: ${values.company || ""} vs ${competitors.join(", ")}`.slice(0, 80);
    }
    case "web-intel":
      return ((values.extract as string) || "Web intelligence").slice(0, 80);
    case "sales-rep":
      return `Sales intel: ${values.company || "target company"}`;
    case "fitness-coach":
      return `${values.goal || "Fitness"} plan — ${values.days_per_week || 4}x/week`;
    case "personal-finance":
      return `Financial plan: ${values.goal || "review"}`;
    case "legal-advisor":
      return ((values.question as string) || "Legal analysis").slice(0, 80);
    case "recruitment-agent":
      return `Recruit: ${values.role || "open role"}`;
    case "product-launch":
      return ((values.product as string) || "Product launch plan").slice(0, 80);
    // ── Life Utility Agents ──────────────────────────────────
    case "job-hunter":
      return `Job search: ${values.job_title || "open roles"}`;
    case "auto-applier":
      return ((values.job_posting as string) || "Job application").slice(0, 60);
    case "resume-optimizer":
      return `Resume for ${values.target_role || "target role"}`;
    case "interview-coach":
      return `Interview prep: ${values.role || "upcoming interview"}`;
    case "salary-negotiator":
      return `Salary research: ${values.job_title || "role"}`;
    case "subscription-killer":
      return "Subscription audit & savings plan";
    case "bill-negotiator":
      return `Negotiate ${values.bill_type || "bill"}: ${values.provider || "provider"}`;
    case "tax-deduction-finder":
      return `Tax deductions: ${values.employment_type || "review"}`;
    case "credit-score-coach":
      return `Credit improvement plan (${values.score_range || "current score"})`;
    case "deal-spotter":
      return `Find best price: ${values.item || "item"}`;
    case "dispute-fighter":
      return `Dispute: ${values.company || "company"} — ${values.dispute_type || "issue"}`;
    case "benefits-finder":
      return "Benefits eligibility search";
    case "lease-reviewer":
      return "Lease agreement review";
    case "immigration-helper":
      return `Visa research: ${values.current_country || ""} → ${values.destination || "destination"}`;
    case "small-claims-advisor":
      return `Small claims assessment: $${values.amount || "amount"}`;
    case "apartment-scout":
      return `Apartment search: ${values.city || "city"}`;
    case "moving-coordinator":
      return `Moving plan: ${values.from_to || "move"}`;
    case "utility-optimizer":
      return `Compare ${values.utility_type || "utility"} plans`;
    case "medical-bill-auditor":
      return `Medical bill audit: $${values.total_amount || "amount"}`;
    case "insurance-comparer":
      return `Compare ${values.insurance_type || "insurance"} plans`;
    case "symptom-researcher":
      return ((values.symptoms as string) || "Symptom research").slice(0, 60);
    case "prescription-saver":
      return "Prescription savings search";
    case "scholarship-hunter":
      return `Scholarship search: ${values.field || "all fields"}`;
    case "college-advisor":
      return `College research: ${values.major || "programs"}`;
    case "return-assistant":
      return `Return: ${values.product || "product"} at ${values.store || "store"}`;
    case "car-buy-negotiator":
      return `Car pricing: ${values.car || "vehicle"}`;
    case "freelance-bid-writer":
      return ((values.project_listing as string) || "Freelance proposal").slice(0, 60);
    case "side-hustle-matcher":
      return "Side income opportunities";
    case "contract-reviewer":
      return `Contract review: ${values.contract_type || "agreement"}`;
    default:
      return (values.topic || values.question || values.story || "New task") as string;
  }
}
