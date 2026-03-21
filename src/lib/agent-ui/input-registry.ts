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
  // ── Legal & Rights ──────────────────────────────────
  "lease-reviewer": {
    fields: [
      { id: "lease_text", type: "textarea", label: "Lease Text", placeholder: "Paste your lease agreement text here", required: true, fullWidth: true },
      { id: "state", type: "text", label: "State", placeholder: "e.g., New York" },
      { id: "concerns", type: "textarea", label: "Specific Concerns", placeholder: "Any specific clauses or terms you're worried about?" },
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
    case "lease-reviewer":
      return "Lease agreement review";
    case "medical-bill-auditor":
      return `Medical bill audit: $${values.total_amount || "amount"}`;
    default:
      return (values.topic || values.question || values.story || "New task") as string;
  }
}
