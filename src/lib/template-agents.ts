// Template agent configs — maps pipeline steps to virtual "agents" for the run page UI
// Each template has 3-4 virtual agents that cover the 5 backend pipeline steps

export interface TemplateAgent {
  id: string;
  name: string;
  icon: string;
  color: string;
  role: string;
  model: string;
  mcpTools: string[];
  outputLabel: string;
  stepIndices: number[]; // Maps to pipeline step indices (0-based, 5 steps per tmpl_*)
}

export interface TemplateRunConfig {
  estimatedTime: string;
  estimatedCost: string;
  tagline: string;
  agents: TemplateAgent[];
  quickFills: string[];
  inputLabel: string;
  inputPlaceholder: string;
}

/* ─── Category metadata (shared) ─── */
export const CATEGORY_META: Record<string, { label: string; color: string; catBg: string }> = {
  career: { label: "Career", color: "#60a5fa", catBg: "rgba(96,165,250,0.13)" },
  finance_personal: { label: "Finance", color: "#4ade80", catBg: "rgba(74,222,128,0.10)" },
  legal_personal: { label: "Legal", color: "#c084fc", catBg: "rgba(192,132,252,0.10)" },
  housing: { label: "Housing", color: "#fb923c", catBg: "rgba(251,146,60,0.10)" },
  health_personal: { label: "Health", color: "#f472b6", catBg: "rgba(244,114,182,0.10)" },
  education: { label: "Education", color: "#22d3ee", catBg: "rgba(34,211,238,0.10)" },
  shopping: { label: "Shopping", color: "#c084fc", catBg: "rgba(192,132,252,0.10)" },
  freelance: { label: "Freelance", color: "#fb923c", catBg: "rgba(251,146,60,0.10)" },
  parenting: { label: "Parenting", color: "#a99cf5", catBg: "rgba(169,156,245,0.10)" },
  travel_events: { label: "Travel", color: "#2dd4bf", catBg: "rgba(45,212,191,0.10)" },
  personal_growth: { label: "Wellness", color: "#f5a623", catBg: "rgba(245,166,35,0.10)" },
  social_media: { label: "Social Media", color: "#0A66C2", catBg: "rgba(10,102,194,0.10)" },
};

/* ─── Template categories with slugs ─── */
export const TEMPLATE_CATEGORIES: { id: string; title: string; slugs: string[] }[] = [
  { id: "career", title: "Career & Job Search", slugs: ["job-hunter", "auto-applier", "resume-optimizer", "interview-coach", "salary-negotiator", "linkedin-optimizer", "career-pivoter", "remote-job-finder", "portfolio-builder", "networking-coach"] },
  { id: "finance_personal", title: "Money & Bills", slugs: ["subscription-killer", "bill-negotiator", "tax-deduction-finder", "credit-score-coach", "deal-spotter", "debt-snowball", "budget-builder", "retirement-planner"] },
  { id: "legal_personal", title: "Legal & Rights", slugs: ["dispute-fighter", "benefits-finder", "lease-reviewer", "immigration-helper", "small-claims-advisor", "tenant-rights", "will-planner", "traffic-ticket"] },
  { id: "housing", title: "Housing & Moving", slugs: ["apartment-scout", "moving-coordinator", "utility-optimizer", "renovation-planner"] },
  { id: "health_personal", title: "Health & Medical", slugs: ["medical-bill-auditor", "insurance-comparer", "symptom-researcher", "prescription-saver", "meal-prep-planner", "sleep-optimizer", "therapy-finder"] },
  { id: "education", title: "Education", slugs: ["scholarship-hunter", "college-advisor", "study-plan-maker", "essay-coach", "skill-roadmap", "language-tutor"] },
  { id: "shopping", title: "Smart Shopping", slugs: ["return-assistant", "car-buy-negotiator", "warranty-claimer", "tech-buyer", "grocery-optimizer"] },
  { id: "freelance", title: "Freelance & Side Income", slugs: ["freelance-bid-writer", "side-hustle-matcher", "contract-reviewer", "invoice-generator", "client-proposal", "rate-calculator"] },
  { id: "parenting", title: "Parenting & Family", slugs: ["baby-name-picker", "school-chooser", "college-savings"] },
  { id: "travel_events", title: "Travel & Events", slugs: ["flight-deal-hunter", "wedding-planner", "party-planner", "visa-advisor", "road-trip-planner"] },
  { id: "personal_growth", title: "Personal Growth", slugs: ["habit-tracker", "journaling-coach", "morning-routine", "social-skills"] },
  { id: "social_media", title: "Social Media", slugs: ["social-media"] },
];

/* ─── Pipeline agent preview data per template ─── */
export const TEMPLATE_PIPELINES: Record<string, { icon: string; label: string; color: string }[]> = {
  "resume-optimizer": [
    { icon: "🔍", label: "ATS Scanner", color: "#fb923c" },
    { icon: "🏷️", label: "Keyword Analyzer", color: "#c084fc" },
    { icon: "✏️", label: "Bullet Rewriter", color: "#22d3ee" },
    { icon: "⭐", label: "Scorer", color: "#4ade80" },
  ],
  "job-hunter": [
    { icon: "👤", label: "Profile Analyzer", color: "#60a5fa" },
    { icon: "🌐", label: "Web Scraper", color: "#c084fc" },
    { icon: "🎯", label: "Job Matcher", color: "#f5a623" },
    { icon: "📊", label: "Ranker", color: "#4ade80" },
  ],
  "auto-applier": [
    { icon: "📋", label: "Job Parser", color: "#60a5fa" },
    { icon: "📄", label: "Resume Tailor", color: "#f472b6" },
    { icon: "✍️", label: "Cover Letter Writer", color: "#c5f135" },
  ],
  "interview-coach": [
    { icon: "🔍", label: "Company Research", color: "#60a5fa" },
    { icon: "🎯", label: "Question Predictor", color: "#f5a623" },
    { icon: "💬", label: "Answer Coach", color: "#4ade80" },
  ],
  "salary-negotiator": [
    { icon: "📊", label: "Market Researcher", color: "#60a5fa" },
    { icon: "💰", label: "Comp Analyzer", color: "#f5a623" },
    { icon: "🎯", label: "Negotiation Coach", color: "#4ade80" },
  ],
  "linkedin-optimizer": [
    { icon: "🔍", label: "Profile Scanner", color: "#60a5fa" },
    { icon: "🏷️", label: "SEO Optimizer", color: "#c084fc" },
    { icon: "✍️", label: "Content Writer", color: "#22d3ee" },
  ],
  "career-pivoter": [
    { icon: "🧠", label: "Skills Mapper", color: "#7c6fef" },
    { icon: "🌐", label: "Industry Research", color: "#60a5fa" },
    { icon: "📋", label: "Action Planner", color: "#4ade80" },
  ],
  "remote-job-finder": [
    { icon: "🌐", label: "Remote Board Scanner", color: "#22d3ee" },
    { icon: "🎯", label: "Skill Matcher", color: "#f5a623" },
    { icon: "📊", label: "Ranker", color: "#4ade80" },
  ],
  "portfolio-builder": [
    { icon: "📋", label: "Work Analyzer", color: "#60a5fa" },
    { icon: "🎨", label: "Layout Designer", color: "#f472b6" },
    { icon: "✍️", label: "Copy Writer", color: "#c5f135" },
  ],
  "networking-coach": [
    { icon: "🔍", label: "Network Mapper", color: "#60a5fa" },
    { icon: "✍️", label: "Intro Crafter", color: "#c084fc" },
    { icon: "📅", label: "Follow-up Planner", color: "#4ade80" },
  ],
  "budget-builder": [
    { icon: "📊", label: "Income Analyzer", color: "#60a5fa" },
    { icon: "💳", label: "Expense Tracker", color: "#f472b6" },
    { icon: "🎯", label: "Budget Planner", color: "#4ade80" },
    { icon: "📈", label: "Savings Optimizer", color: "#f5a623" },
  ],
  "subscription-killer": [
    { icon: "🔍", label: "Sub Scanner", color: "#60a5fa" },
    { icon: "💸", label: "Cost Analyzer", color: "#ef4444" },
    { icon: "✂️", label: "Cut Recommender", color: "#4ade80" },
  ],
  "bill-negotiator": [
    { icon: "📋", label: "Bill Analyzer", color: "#60a5fa" },
    { icon: "📊", label: "Market Comparer", color: "#f5a623" },
    { icon: "💬", label: "Script Writer", color: "#4ade80" },
  ],
  "tax-deduction-finder": [
    { icon: "📊", label: "Income Classifier", color: "#60a5fa" },
    { icon: "🔍", label: "Deduction Scanner", color: "#c084fc" },
    { icon: "💰", label: "Savings Calculator", color: "#4ade80" },
  ],
  "credit-score-coach": [
    { icon: "📊", label: "Score Analyzer", color: "#60a5fa" },
    { icon: "🔍", label: "Factor Scanner", color: "#f5a623" },
    { icon: "📋", label: "Action Planner", color: "#4ade80" },
  ],
  "deal-spotter": [
    { icon: "🔍", label: "Price Scanner", color: "#60a5fa" },
    { icon: "📊", label: "Deal Comparer", color: "#f5a623" },
    { icon: "🏷️", label: "Coupon Finder", color: "#4ade80" },
  ],
  "debt-snowball": [
    { icon: "📊", label: "Debt Mapper", color: "#ef4444" },
    { icon: "🧮", label: "Strategy Calculator", color: "#60a5fa" },
    { icon: "📅", label: "Payoff Scheduler", color: "#4ade80" },
  ],
  "retirement-planner": [
    { icon: "📊", label: "Asset Analyzer", color: "#60a5fa" },
    { icon: "📈", label: "Growth Projector", color: "#4ade80" },
    { icon: "📋", label: "Plan Builder", color: "#f5a623" },
  ],
  "lease-reviewer": [
    { icon: "📋", label: "Clause Parser", color: "#60a5fa" },
    { icon: "🔒", label: "Risk Analyzer", color: "#ef4444" },
    { icon: "⚖️", label: "Legal Checker", color: "#c084fc" },
    { icon: "📝", label: "Report Writer", color: "#4ade80" },
  ],
  "dispute-fighter": [
    { icon: "📋", label: "Case Builder", color: "#60a5fa" },
    { icon: "⚖️", label: "Law Researcher", color: "#c084fc" },
    { icon: "✍️", label: "Letter Drafter", color: "#4ade80" },
  ],
  "benefits-finder": [
    { icon: "🔍", label: "Eligibility Scanner", color: "#60a5fa" },
    { icon: "📊", label: "Benefit Ranker", color: "#f5a623" },
    { icon: "📋", label: "Application Guide", color: "#4ade80" },
  ],
  "immigration-helper": [
    { icon: "🔍", label: "Visa Researcher", color: "#60a5fa" },
    { icon: "📋", label: "Doc Checker", color: "#f5a623" },
    { icon: "📝", label: "Timeline Builder", color: "#4ade80" },
  ],
  "small-claims-advisor": [
    { icon: "📋", label: "Case Evaluator", color: "#60a5fa" },
    { icon: "⚖️", label: "Law Researcher", color: "#c084fc" },
    { icon: "📝", label: "Filing Guide", color: "#4ade80" },
  ],
  "tenant-rights": [
    { icon: "🔍", label: "Rights Researcher", color: "#60a5fa" },
    { icon: "⚖️", label: "State Law Finder", color: "#c084fc" },
    { icon: "📋", label: "Action Guide", color: "#4ade80" },
  ],
  "will-planner": [
    { icon: "📋", label: "Asset Mapper", color: "#60a5fa" },
    { icon: "⚖️", label: "Legal Advisor", color: "#c084fc" },
    { icon: "📝", label: "Document Drafter", color: "#4ade80" },
  ],
  "traffic-ticket": [
    { icon: "🔍", label: "Case Analyzer", color: "#60a5fa" },
    { icon: "⚖️", label: "Defense Researcher", color: "#c084fc" },
    { icon: "📝", label: "Response Drafter", color: "#4ade80" },
  ],
  "apartment-scout": [
    { icon: "🔍", label: "Listing Scanner", color: "#60a5fa" },
    { icon: "📊", label: "Price Analyzer", color: "#f5a623" },
    { icon: "🏠", label: "Match Ranker", color: "#4ade80" },
  ],
  "moving-coordinator": [
    { icon: "📋", label: "Task Planner", color: "#60a5fa" },
    { icon: "🔍", label: "Mover Finder", color: "#f5a623" },
    { icon: "📅", label: "Timeline Builder", color: "#4ade80" },
  ],
  "utility-optimizer": [
    { icon: "📊", label: "Usage Analyzer", color: "#60a5fa" },
    { icon: "🔍", label: "Plan Comparer", color: "#f5a623" },
    { icon: "💰", label: "Savings Finder", color: "#4ade80" },
  ],
  "renovation-planner": [
    { icon: "📋", label: "Scope Builder", color: "#60a5fa" },
    { icon: "💰", label: "Budget Estimator", color: "#f5a623" },
    { icon: "📅", label: "Timeline Planner", color: "#4ade80" },
  ],
  "medical-bill-auditor": [
    { icon: "📊", label: "Bill Scanner", color: "#60a5fa" },
    { icon: "🔍", label: "Code Checker", color: "#ef4444" },
    { icon: "💰", label: "Savings Finder", color: "#4ade80" },
  ],
  "insurance-comparer": [
    { icon: "🔍", label: "Plan Scanner", color: "#60a5fa" },
    { icon: "📊", label: "Coverage Comparer", color: "#f5a623" },
    { icon: "📝", label: "Recommendation Writer", color: "#4ade80" },
  ],
  "symptom-researcher": [
    { icon: "🔍", label: "Symptom Analyzer", color: "#60a5fa" },
    { icon: "🌐", label: "Medical Researcher", color: "#c084fc" },
    { icon: "📋", label: "Report Builder", color: "#4ade80" },
  ],
  "prescription-saver": [
    { icon: "💊", label: "Drug Lookup", color: "#60a5fa" },
    { icon: "🔍", label: "Price Scanner", color: "#f5a623" },
    { icon: "💰", label: "Savings Finder", color: "#4ade80" },
  ],
  "meal-prep-planner": [
    { icon: "📊", label: "Nutrition Analyzer", color: "#4ade80" },
    { icon: "🍽️", label: "Recipe Planner", color: "#f5a623" },
    { icon: "🛒", label: "Grocery Lister", color: "#60a5fa" },
  ],
  "sleep-optimizer": [
    { icon: "🔍", label: "Sleep Analyzer", color: "#60a5fa" },
    { icon: "🌙", label: "Habit Mapper", color: "#7c6fef" },
    { icon: "📋", label: "Routine Builder", color: "#4ade80" },
  ],
  "therapy-finder": [
    { icon: "🔍", label: "Needs Assessor", color: "#60a5fa" },
    { icon: "🌐", label: "Provider Scanner", color: "#c084fc" },
    { icon: "📊", label: "Match Ranker", color: "#4ade80" },
  ],
  "scholarship-hunter": [
    { icon: "🔍", label: "Scholarship Scanner", color: "#60a5fa" },
    { icon: "🎯", label: "Eligibility Matcher", color: "#f5a623" },
    { icon: "📝", label: "Application Drafter", color: "#4ade80" },
  ],
  "college-advisor": [
    { icon: "🔍", label: "School Researcher", color: "#60a5fa" },
    { icon: "📊", label: "Fit Scorer", color: "#f5a623" },
    { icon: "📋", label: "Application Planner", color: "#4ade80" },
  ],
  "study-plan-maker": [
    { icon: "📚", label: "Syllabus Analyzer", color: "#22d3ee" },
    { icon: "🧠", label: "Knowledge Mapper", color: "#7c6fef" },
    { icon: "📅", label: "Schedule Builder", color: "#fb923c" },
    { icon: "✅", label: "Progress Tracker", color: "#4ade80" },
  ],
  "essay-coach": [
    { icon: "📋", label: "Structure Planner", color: "#60a5fa" },
    { icon: "✍️", label: "Draft Advisor", color: "#c084fc" },
    { icon: "✏️", label: "Editor", color: "#4ade80" },
  ],
  "skill-roadmap": [
    { icon: "🎯", label: "Goal Mapper", color: "#60a5fa" },
    { icon: "📊", label: "Resource Finder", color: "#f5a623" },
    { icon: "📅", label: "Roadmap Builder", color: "#4ade80" },
  ],
  "language-tutor": [
    { icon: "📊", label: "Level Assessor", color: "#60a5fa" },
    { icon: "📚", label: "Curriculum Builder", color: "#22d3ee" },
    { icon: "📅", label: "Practice Planner", color: "#4ade80" },
  ],
  "return-assistant": [
    { icon: "📋", label: "Policy Scanner", color: "#60a5fa" },
    { icon: "📝", label: "Letter Drafter", color: "#c084fc" },
    { icon: "📅", label: "Deadline Tracker", color: "#4ade80" },
  ],
  "car-buy-negotiator": [
    { icon: "🔍", label: "Price Researcher", color: "#60a5fa" },
    { icon: "📊", label: "Value Analyzer", color: "#f5a623" },
    { icon: "💬", label: "Negotiation Coach", color: "#4ade80" },
  ],
  "warranty-claimer": [
    { icon: "📋", label: "Coverage Checker", color: "#60a5fa" },
    { icon: "📝", label: "Claim Drafter", color: "#c084fc" },
    { icon: "📅", label: "Follow-up Tracker", color: "#4ade80" },
  ],
  "tech-buyer": [
    { icon: "🔍", label: "Spec Researcher", color: "#60a5fa" },
    { icon: "📊", label: "Model Comparer", color: "#f5a623" },
    { icon: "💰", label: "Deal Finder", color: "#4ade80" },
  ],
  "grocery-optimizer": [
    { icon: "📋", label: "List Builder", color: "#60a5fa" },
    { icon: "🔍", label: "Price Comparer", color: "#f5a623" },
    { icon: "💰", label: "Savings Calculator", color: "#4ade80" },
  ],
  "freelance-bid-writer": [
    { icon: "📋", label: "Project Analyzer", color: "#60a5fa" },
    { icon: "✍️", label: "Bid Writer", color: "#c084fc" },
    { icon: "💰", label: "Price Optimizer", color: "#4ade80" },
  ],
  "side-hustle-matcher": [
    { icon: "📋", label: "Skill Mapper", color: "#60a5fa" },
    { icon: "🔍", label: "Opportunity Scanner", color: "#f5a623" },
    { icon: "📊", label: "Income Estimator", color: "#4ade80" },
  ],
  "contract-reviewer": [
    { icon: "📋", label: "Clause Parser", color: "#60a5fa" },
    { icon: "⚖️", label: "Risk Analyzer", color: "#ef4444" },
    { icon: "📝", label: "Summary Writer", color: "#4ade80" },
  ],
  "invoice-generator": [
    { icon: "📋", label: "Data Collector", color: "#60a5fa" },
    { icon: "📊", label: "Rate Calculator", color: "#f5a623" },
    { icon: "📝", label: "Invoice Builder", color: "#4ade80" },
  ],
  "client-proposal": [
    { icon: "📋", label: "Brief Analyzer", color: "#60a5fa" },
    { icon: "✍️", label: "Proposal Writer", color: "#c084fc" },
    { icon: "💰", label: "Pricing Optimizer", color: "#4ade80" },
  ],
  "rate-calculator": [
    { icon: "📊", label: "Market Researcher", color: "#60a5fa" },
    { icon: "🧮", label: "Cost Analyzer", color: "#f5a623" },
    { icon: "💰", label: "Rate Builder", color: "#4ade80" },
  ],
  "baby-name-picker": [
    { icon: "🔍", label: "Name Researcher", color: "#a99cf5" },
    { icon: "📊", label: "Meaning Analyzer", color: "#f472b6" },
    { icon: "🎯", label: "Match Ranker", color: "#4ade80" },
  ],
  "school-chooser": [
    { icon: "🔍", label: "School Scanner", color: "#60a5fa" },
    { icon: "📊", label: "Rating Comparer", color: "#f5a623" },
    { icon: "🏫", label: "Fit Analyzer", color: "#4ade80" },
  ],
  "college-savings": [
    { icon: "📊", label: "Cost Projector", color: "#60a5fa" },
    { icon: "📈", label: "529 Analyzer", color: "#f5a623" },
    { icon: "📋", label: "Plan Builder", color: "#4ade80" },
  ],
  "flight-deal-hunter": [
    { icon: "🌐", label: "Fare Scanner", color: "#22d3ee" },
    { icon: "📊", label: "Price Tracker", color: "#f5a623" },
    { icon: "✈️", label: "Deal Ranker", color: "#4ade80" },
  ],
  "wedding-planner": [
    { icon: "📋", label: "Budget Builder", color: "#f472b6" },
    { icon: "🔍", label: "Vendor Researcher", color: "#60a5fa" },
    { icon: "📅", label: "Timeline Planner", color: "#4ade80" },
  ],
  "party-planner": [
    { icon: "📋", label: "Theme Builder", color: "#c084fc" },
    { icon: "🔍", label: "Vendor Finder", color: "#60a5fa" },
    { icon: "📅", label: "Checklist Maker", color: "#4ade80" },
  ],
  "visa-advisor": [
    { icon: "🔍", label: "Requirement Researcher", color: "#60a5fa" },
    { icon: "📋", label: "Doc Checker", color: "#f5a623" },
    { icon: "📝", label: "Application Guide", color: "#4ade80" },
  ],
  "road-trip-planner": [
    { icon: "🗺️", label: "Route Planner", color: "#22d3ee" },
    { icon: "🔍", label: "Stop Finder", color: "#f5a623" },
    { icon: "📋", label: "Itinerary Builder", color: "#4ade80" },
  ],
  "habit-tracker": [
    { icon: "📋", label: "Habit Analyzer", color: "#f5a623" },
    { icon: "🧠", label: "System Designer", color: "#7c6fef" },
    { icon: "📅", label: "Tracker Builder", color: "#4ade80" },
  ],
  "journaling-coach": [
    { icon: "🧠", label: "Reflection Guide", color: "#7c6fef" },
    { icon: "✍️", label: "Prompt Generator", color: "#f5a623" },
    { icon: "📊", label: "Progress Tracker", color: "#4ade80" },
  ],
  "morning-routine": [
    { icon: "🌅", label: "Schedule Analyzer", color: "#f5a623" },
    { icon: "🧠", label: "Routine Designer", color: "#7c6fef" },
    { icon: "📋", label: "Plan Builder", color: "#4ade80" },
  ],
  "social-skills": [
    { icon: "🧠", label: "Skill Assessor", color: "#7c6fef" },
    { icon: "💬", label: "Scenario Builder", color: "#60a5fa" },
    { icon: "📋", label: "Practice Planner", color: "#4ade80" },
  ],
  "social-media": [
    { icon: "🔍", label: "Trend Researcher", color: "#3b82f6" },
    { icon: "💼", label: "LinkedIn Writer", color: "#0A66C2" },
    { icon: "🐦", label: "Twitter/X Writer", color: "#000000" },
    { icon: "📊", label: "Content Packager", color: "#8b5cf6" },
  ],
};

/* ─── Ratings and runs per template ─── */
export const TEMPLATE_RATINGS: Record<string, number> = {
  "job-hunter": 4.9, "auto-applier": 4.7, "resume-optimizer": 4.8, "interview-coach": 4.8,
  "salary-negotiator": 4.7, "linkedin-optimizer": 4.6, "career-pivoter": 4.7, "remote-job-finder": 4.6,
  "portfolio-builder": 4.5, "networking-coach": 4.6,
  "subscription-killer": 4.8, "bill-negotiator": 4.7, "tax-deduction-finder": 4.9, "credit-score-coach": 4.6,
  "deal-spotter": 4.7, "debt-snowball": 4.8, "budget-builder": 4.7,
  "retirement-planner": 4.6,
  "dispute-fighter": 4.8, "benefits-finder": 4.7, "lease-reviewer": 4.9, "immigration-helper": 4.6,
  "small-claims-advisor": 4.7, "tenant-rights": 4.8, "will-planner": 4.6, "traffic-ticket": 4.7,
  "apartment-scout": 4.7, "moving-coordinator": 4.6, "utility-optimizer": 4.5,
  "renovation-planner": 4.6,
  "medical-bill-auditor": 4.9, "insurance-comparer": 4.7, "symptom-researcher": 4.6,
  "prescription-saver": 4.8, "meal-prep-planner": 4.8, "sleep-optimizer": 4.5,
  "therapy-finder": 4.6,
  "scholarship-hunter": 4.8, "college-advisor": 4.7, "study-plan-maker": 4.6,
  "essay-coach": 4.7, "skill-roadmap": 4.6, "language-tutor": 4.5,
  "return-assistant": 4.6, "car-buy-negotiator": 4.8, "warranty-claimer": 4.5,
  "tech-buyer": 4.7, "grocery-optimizer": 4.5,
  "freelance-bid-writer": 4.7, "side-hustle-matcher": 4.5, "contract-reviewer": 4.8,
  "invoice-generator": 4.4, "client-proposal": 4.7, "rate-calculator": 4.5,
  "baby-name-picker": 4.6, "school-chooser": 4.7,
  "college-savings": 4.6,
  "flight-deal-hunter": 4.8, "wedding-planner": 4.7, "party-planner": 4.6,
  "visa-advisor": 4.7, "road-trip-planner": 4.6,
  "habit-tracker": 4.6, "journaling-coach": 4.5, "morning-routine": 4.5,
  "social-skills": 4.4,
  "social-media": 4.8,
};

export const TEMPLATE_RUNS: Record<string, string> = {
  "job-hunter": "5.2k", "auto-applier": "3.8k", "resume-optimizer": "6.1k", "interview-coach": "3.1k",
  "salary-negotiator": "2.4k", "linkedin-optimizer": "2.9k", "career-pivoter": "1.8k", "remote-job-finder": "2.6k",
  "portfolio-builder": "1.5k", "networking-coach": "1.7k",
  "subscription-killer": "4.1k", "bill-negotiator": "3.2k", "tax-deduction-finder": "5.3k", "credit-score-coach": "2.7k",
  "deal-spotter": "3.6k", "debt-snowball": "2.1k", "budget-builder": "3.4k",
  "retirement-planner": "1.9k",
  "dispute-fighter": "2.3k", "benefits-finder": "2.8k", "lease-reviewer": "2.8k", "immigration-helper": "1.7k",
  "small-claims-advisor": "1.3k", "tenant-rights": "2.1k", "will-planner": "1.5k", "traffic-ticket": "1.9k",
  "apartment-scout": "2.4k", "moving-coordinator": "1.8k", "utility-optimizer": "1.3k",
  "renovation-planner": "1.4k",
  "medical-bill-auditor": "3.7k", "insurance-comparer": "2.5k", "symptom-researcher": "3.9k",
  "prescription-saver": "2.8k", "meal-prep-planner": "1.9k", "sleep-optimizer": "1.2k",
  "therapy-finder": "1.6k",
  "scholarship-hunter": "2.9k", "college-advisor": "2.3k", "study-plan-maker": "4.5k",
  "essay-coach": "2.1k", "skill-roadmap": "1.8k", "language-tutor": "1.4k",
  "return-assistant": "1.7k", "car-buy-negotiator": "2.2k", "warranty-claimer": "1.1k",
  "tech-buyer": "2.6k", "grocery-optimizer": "1.3k",
  "freelance-bid-writer": "2.2k", "side-hustle-matcher": "1.5k", "contract-reviewer": "2.4k",
  "invoice-generator": "1.0k", "client-proposal": "1.9k", "rate-calculator": "1.2k",
  "baby-name-picker": "1.6k", "school-chooser": "1.4k",
  "college-savings": "1.1k",
  "flight-deal-hunter": "3.1k", "wedding-planner": "2.4k", "party-planner": "1.7k",
  "visa-advisor": "1.9k", "road-trip-planner": "1.5k",
  "habit-tracker": "1.8k", "journaling-coach": "1.2k", "morning-routine": "1.4k",
  "social-skills": "0.9k",
  "social-media": "2.1k",
};

/* ─── Quick-fill suggestions per template category ─── */
const QUICK_FILLS: Record<string, string[]> = {
  career: [
    "I'm a Senior React/Node.js developer with 5 years experience, looking for remote roles in fintech paying $130-160k. Strong in TypeScript, AWS, and system design.",
    "Junior Python developer graduating in May, looking for my first role in data engineering or backend development. I know Python, SQL, and basic AWS.",
    "Product Manager with 3 years at a Series B startup, looking to transition to a larger company. Experience in B2B SaaS, growth, and data-driven product decisions.",
  ],
  finance_personal: [
    "I earn $5,200/month after tax. Rent is $1,800, car payment $350, student loans $280/month. I want to save for a house down payment in 2 years and build an emergency fund.",
    "I have $18k in student loans at 6.5% and $4k on a credit card at 22% APR. Monthly income is $4,000. I want to be debt-free in 3 years.",
    "Self-employed freelance designer earning $90k/year. I work from home, have a dedicated office, and need help finding deductions for equipment, software, and health insurance.",
  ],
  legal_personal: [
    "My landlord is keeping my $2,500 security deposit despite no damage to the apartment. I lived there for 2 years in San Francisco. I have move-in and move-out photos.",
    "I received a wrongful parking ticket for $150 in NYC. My car was legally parked and I have a photo with the street sign showing it was allowed. How do I contest this?",
    "I need to review a standard NDA from a potential client. It's for a 6-month consulting engagement. I want to make sure the non-compete and IP clauses are reasonable.",
  ],
  housing: [
    "Looking for a 2BR apartment in Brooklyn, budget $2,000-2,500/month. Need laundry in-building, pet-friendly (small dog), and within 30 min commute to Midtown Manhattan.",
    "Moving from NYC to Austin, TX in 3 months. Family of 3. Need to coordinate selling furniture, hiring movers, and finding a temporary rental.",
    "First-time homebuyer in Denver, CO. Budget $400-500k. Looking for a 3BR single family home with a yard. Pre-approved for a conventional mortgage at 6.5%.",
  ],
  health_personal: [
    "I've had persistent tension headaches for 2 weeks, usually in the afternoon. I work at a computer 8+ hours a day. No nausea or vision changes. Taking ibuprofen daily.",
    "Family of 4, comparing health insurance plans for open enrollment. We need good pediatric coverage, mental health benefits, and a reasonable deductible under $3,000.",
    "I want to meal prep for the week. Target: 1,800 cal/day, high protein (150g+). I'm lactose intolerant and don't eat pork. Budget: $80/week for groceries. Cooking time: 2 hours on Sunday.",
  ],
  education: [
    "Sophomore engineering student at a state university, GPA 3.7. Looking for STEM scholarships for the 2026-27 school year. I have financial need and am first-generation.",
    "Preparing for the SAT in 3 months. Current practice score: 1200, target: 1400+. Weaker in math (algebra, geometry). Can study 1.5 hours per day on weekdays.",
    "Writing college application essays for 5 engineering programs (MIT, Stanford, Georgia Tech, Michigan, Purdue). I have a robotics club background and interned at a startup.",
  ],
  shopping: [
    "Looking for the best laptop under $1,500 for software development. Need: 16GB+ RAM, good keyboard, Linux-friendly, 14-inch screen. Current candidates: ThinkPad, MacBook Air, Framework.",
    "Need to return defective AirPods Pro purchased 3 weeks ago from the Apple Store. Right earbud has crackling noise. I have the receipt and original packaging.",
    "Finding a wedding gift for $100 budget. Couple is in their late 20s, loves cooking and hiking. They live in a small apartment. Already checked their registry.",
  ],
  freelance: [
    "I'm a freelance web developer bidding on a Next.js e-commerce project. Client budget is $8-12k, timeline is 6 weeks. I specialize in Shopify headless and have 3 similar portfolio pieces.",
    "Need to calculate my hourly rate as a freelance UX/UI designer. Based in Chicago, 4 years experience, specializing in mobile apps. Currently charging $75/hr but think I'm underpriced.",
    "Reviewing a client contract for a 3-month design engagement. Fixed fee of $15k with 30/30/40 payment schedule. Concerned about the IP assignment and revision limits clauses.",
  ],
  parenting: [
    "Looking for unique biblical boy names that work well internationally. My partner is French so it needs to sound good in both English and French. Last name is 2 syllables.",
    "Researching elementary schools in Austin, TX (78704 zip code). Looking for strong STEM programs, diversity, and active parent community. Open to public and charter schools.",
    "Finding summer STEM camps for my 10-year-old daughter in the Bay Area. She loves coding (Scratch) and robotics. Budget: $500-1000 per week. Preferably 2+ weeks in July.",
  ],
  travel_events: [
    "Planning a trip from London to Tokyo. Flexible on dates within Sept-Oct 2026. 2 travelers, economy class. Willing to do a layover if it saves $200+. We have BA Avios points.",
    "Planning a 30th birthday party for 30 people. Budget $2,000. Venue: NYC. Theme: casual cocktail. Need venue, catering, and music recommendations for a Saturday evening in April.",
    "10-day road trip along the California coast, starting from San Francisco to San Diego. 2 adults, 1 dog. Budget: $3,000 including hotels. Want scenic stops, good food, and dog-friendly beaches.",
  ],
  social_media: [
    "I just launched a SaaS product for freelancers to track invoices. I want to announce it on LinkedIn and Twitter to attract early users. Target audience: freelance designers and developers.",
    "Write a thought leadership post about how AI is changing the hiring process. I'm a recruiter with 8 years experience and want to share my perspective on resume screening tools.",
    "I got promoted to VP of Engineering and want to share the news professionally. Include lessons learned from 10 years in tech, starting as a junior developer.",
  ],
  personal_growth: [
    "I want to build a productive morning routine. Currently I wake at 8am and rush to work by 9. I want to wake at 6am and include exercise, reading, and planning. I've failed at this 3 times before.",
    "Starting a daily journaling practice. I tend to overthink and have anxiety. Looking for guided prompts that help with gratitude, reflection, and goal-setting. Prefer 10-15 min sessions.",
    "I want to improve my professional networking skills. I'm an introvert software engineer who struggles with small talk at meetups and conferences. I have 3 tech events coming up this month.",
  ],
};

/* ─── Taglines per template ─── */
const TAGLINES: Record<string, string> = {
  "job-hunter": "Find matching jobs from across the web based on your skills, experience, and preferences.",
  "auto-applier": "Auto-tailor your resume and cover letter for each job posting.",
  "resume-optimizer": "Optimize your resume for ATS systems and human recruiters.",
  "interview-coach": "Prepare for your next interview with company-specific questions and coached answers.",
  "salary-negotiator": "Research market rates and build a negotiation strategy.",
  "linkedin-optimizer": "Optimize your LinkedIn profile for recruiter search and engagement.",
  "career-pivoter": "Map your skills to new industries and build a transition plan.",
  "remote-job-finder": "Find remote-friendly roles that match your skills and preferences.",
  "portfolio-builder": "Structure and present your work to impress hiring managers.",
  "networking-coach": "Build a networking strategy with personalized outreach templates.",
  "budget-builder": "Create a personalized budget based on your income and spending patterns.",
  "subscription-killer": "Find and cancel subscriptions you don't use anymore.",
  "bill-negotiator": "Get scripts and strategies to lower your bills.",
  "tax-deduction-finder": "Find tax deductions you might be missing.",
  "credit-score-coach": "Analyze your credit factors and get an improvement plan.",
  "deal-spotter": "Find the best deals and coupons for what you want to buy.",
  "debt-snowball": "Create a debt payoff strategy optimized for your situation.",
  "retirement-planner": "Project your retirement savings and optimize your strategy.",
  "lease-reviewer": "Review your lease for red flags, missing protections, and unfair terms.",
  "dispute-fighter": "Build a legal case and draft dispute letters.",
  "benefits-finder": "Find government benefits you may be eligible for.",
  "immigration-helper": "Research visa options and build a document checklist.",
  "small-claims-advisor": "Evaluate your case and get a filing guide.",
  "tenant-rights": "Research your tenant rights and get an action plan.",
  "will-planner": "Map your assets and draft a basic will structure.",
  "traffic-ticket": "Analyze your ticket and draft a response.",
  "apartment-scout": "Find apartments matching your budget and preferences.",
  "moving-coordinator": "Plan your move with task lists and mover comparisons.",
  "utility-optimizer": "Compare utility plans and find savings.",
  "renovation-planner": "Scope your renovation, estimate costs, and plan the timeline.",
  "medical-bill-auditor": "Scan medical bills for errors and find savings.",
  "insurance-comparer": "Compare insurance plans and get a recommendation.",
  "symptom-researcher": "Research symptoms and get a structured report for your doctor.",
  "prescription-saver": "Find the cheapest prices for your prescriptions.",
  "meal-prep-planner": "Plan weekly meals with nutrition targets and a grocery list.",
  "sleep-optimizer": "Analyze your sleep habits and build a better routine.",
  "therapy-finder": "Find therapists that match your needs and insurance.",
  "scholarship-hunter": "Find scholarships matching your profile and draft applications.",
  "college-advisor": "Research colleges, score fit, and plan applications.",
  "study-plan-maker": "Create a study schedule based on your syllabus and goals.",
  "essay-coach": "Plan, draft, and polish your essay.",
  "skill-roadmap": "Map learning goals to resources and build a timeline.",
  "language-tutor": "Assess your level and build a practice plan.",
  "return-assistant": "Check return policies and draft return letters.",
  "car-buy-negotiator": "Research prices and get negotiation scripts.",
  "warranty-claimer": "Check warranty coverage and draft claim letters.",
  "tech-buyer": "Compare specs, read reviews, and find the best deal.",
  "grocery-optimizer": "Build an optimized grocery list with price comparisons.",
  "freelance-bid-writer": "Analyze the project and write a winning bid.",
  "side-hustle-matcher": "Match your skills to side income opportunities.",
  "contract-reviewer": "Parse contracts for risks and write a summary.",
  "invoice-generator": "Collect project details and generate a professional invoice.",
  "client-proposal": "Analyze the brief and write a compelling proposal.",
  "rate-calculator": "Research market rates and calculate your optimal pricing.",
  "baby-name-picker": "Research names with meanings, popularity, and compatibility.",
  "school-chooser": "Compare schools by ratings, programs, and fit.",
  "college-savings": "Project costs and optimize your 529 plan.",
  "flight-deal-hunter": "Scan fares across dates and airlines for the best deals.",
  "wedding-planner": "Plan your wedding budget, vendors, and timeline.",
  "party-planner": "Plan the theme, vendors, and checklist for your event.",
  "visa-advisor": "Research visa requirements and build an application guide.",
  "road-trip-planner": "Plan your route, stops, and create an itinerary.",
  "habit-tracker": "Analyze habits and design a tracking system.",
  "journaling-coach": "Get reflection prompts and build a journaling practice.",
  "morning-routine": "Design a morning routine optimized for your goals.",
  "social-skills": "Assess skills and get practice scenarios.",
  "social-media": "Create ready-to-publish LinkedIn posts and Twitter/X threads from any topic.",
};

/* ─── Template-specific input labels and placeholders ─── */
const INPUT_PROMPTS: Record<string, { label: string; placeholder: string }> = {
  "resume-optimizer": { label: "Paste your resume or describe your experience", placeholder: "Paste your full resume text here, OR describe:\n- Your current role and years of experience\n- Key skills and technologies\n- Target job titles you're applying for\n- Any specific job posting you want to optimize for" },
  "job-hunter": { label: "Describe what you're looking for", placeholder: "Include:\n- Your skills and experience level (e.g. 5 years React/Node.js)\n- Desired role (e.g. Senior Frontend Engineer)\n- Location preference (e.g. remote, NYC, London)\n- Salary range (e.g. $120-150k)\n- Industry preferences (e.g. fintech, healthtech)" },
  "auto-applier": { label: "Paste the job posting and your background", placeholder: "Paste the full job description, then add your background:\n- Your current resume summary\n- Key achievements and metrics\n- Why you're interested in this role" },
  "interview-coach": { label: "Tell us about the interview", placeholder: "Include:\n- Company name and role you're interviewing for\n- Interview stage (phone screen, technical, final round)\n- Your relevant experience for this role\n- Any specific concerns or areas you want help with" },
  "salary-negotiator": { label: "Describe your negotiation situation", placeholder: "Include:\n- Your current or offered salary\n- Role and company name\n- Years of experience\n- Location\n- Any competing offers\n- What you'd like to negotiate (base, equity, benefits)" },
  "linkedin-optimizer": { label: "Paste your current LinkedIn profile", placeholder: "Paste your LinkedIn headline, summary, and experience sections.\nOR describe:\n- Your current role and industry\n- Target audience (recruiters, clients, etc.)\n- Key skills to highlight" },
  "budget-builder": { label: "Describe your financial situation", placeholder: "Include:\n- Monthly income (after tax)\n- Major recurring expenses (rent, utilities, loans)\n- Financial goals (save for house, pay off debt, etc.)\n- Any specific spending categories to track" },
  "subscription-killer": { label: "List your current subscriptions", placeholder: "List all your subscriptions with monthly costs:\n- Streaming (Netflix, Spotify, etc.)\n- Software (Adobe, Microsoft, etc.)\n- Memberships (gym, clubs, etc.)\n- Any other recurring charges\n\nNote which ones you use regularly vs. rarely." },
  "tax-deduction-finder": { label: "Describe your tax situation", placeholder: "Include:\n- Employment type (W-2, 1099, self-employed)\n- Industry/profession\n- Major expenses (home office, education, medical)\n- Filing status (single, married, etc.)\n- Any significant life changes this year" },
  "lease-reviewer": { label: "Paste your lease agreement", placeholder: "Paste the full lease text or key sections you're concerned about.\nInclude:\n- Type of property (apartment, house, commercial)\n- Lease duration and monthly rent\n- Any specific clauses that worry you" },
  "dispute-fighter": { label: "Describe your dispute", placeholder: "Include:\n- What company/entity the dispute is with\n- What happened (timeline of events)\n- Amount in dispute\n- What resolution you want\n- Any evidence or documentation you have" },
  "medical-bill-auditor": { label: "Describe your medical bills", placeholder: "Include:\n- Total amount billed\n- Type of procedure/visit\n- Insurance coverage status\n- Any specific charges that seem too high\n- Your insurance provider and plan type" },
  "meal-prep-planner": { label: "Describe your meal planning needs", placeholder: "Include:\n- Daily calorie target\n- Dietary restrictions (vegetarian, gluten-free, etc.)\n- Budget per week for groceries\n- Number of people eating\n- Cooking skill level and available time\n- Foods you love or hate" },
  "study-plan-maker": { label: "Describe what you're studying", placeholder: "Include:\n- Subject or exam you're preparing for\n- Current knowledge level\n- Target date (exam date, deadline)\n- Hours available per day/week\n- Learning style preferences\n- Specific topics or chapters to cover" },
  "apartment-scout": { label: "Describe what you're looking for", placeholder: "Include:\n- City/neighborhood preferences\n- Budget range (monthly rent)\n- Number of bedrooms/bathrooms\n- Must-haves (parking, laundry, pets, etc.)\n- Commute requirements\n- Move-in timeline" },
  "wedding-planner": { label: "Describe your wedding", placeholder: "Include:\n- Approximate date and location\n- Guest count\n- Total budget\n- Style/theme preferences\n- Must-have elements (live band, outdoor, etc.)\n- What's already booked vs. still needed" },
  "flight-deal-hunter": { label: "Describe your travel plans", placeholder: "Include:\n- Origin and destination cities\n- Flexible dates or specific dates\n- Number of travelers\n- Class preference (economy, business)\n- Budget limit\n- Any airline preferences or loyalty programs" },
  "contract-reviewer": { label: "Paste the contract", placeholder: "Paste the full contract text or key sections.\nInclude:\n- Type of contract (freelance, employment, NDA, etc.)\n- Your role (are you the contractor or client?)\n- Any specific terms that concern you" },
  "social-media": { label: "What do you want to post about?", placeholder: "Describe your topic, angle, or announcement:\n- What's the key message or story?\n- Who is your target audience?\n- Any specific tone (professional, casual, inspirational)?\n- Include any data, achievements, or context to reference" },
};

const CATEGORY_INPUT_PROMPTS: Record<string, { label: string; placeholder: string }> = {
  career: { label: "Describe your career situation", placeholder: "Include your current role, years of experience, skills, and what you're looking for. The more detail you provide, the better the results." },
  finance_personal: { label: "Describe your financial situation", placeholder: "Include relevant financial details like income, expenses, debts, and your goals. Be specific about amounts and timelines." },
  legal_personal: { label: "Describe your legal situation", placeholder: "Include what happened, who's involved, relevant dates, amounts, and what outcome you want. The more context you provide, the better." },
  housing: { label: "Describe your housing needs", placeholder: "Include location, budget, size requirements, must-haves, and timeline. The more specific you are, the better the recommendations." },
  health_personal: { label: "Describe your health goals", placeholder: "Include relevant health details, goals, constraints, and preferences. Be as specific as possible for personalized advice." },
  education: { label: "Describe your learning goals", placeholder: "Include what you're studying, your current level, timeline, and specific goals. The more detail, the better the plan." },
  shopping: { label: "Describe what you need", placeholder: "Include the product/item, your budget, must-have features, and any preferences. Be specific about requirements." },
  freelance: { label: "Describe your freelance situation", placeholder: "Include your skills, the project/client details, rates, and what you need help with. Be specific." },
  parenting: { label: "Describe your family situation", placeholder: "Include your children's ages, location, budget, and specific needs or preferences." },
  travel_events: { label: "Describe your plans", placeholder: "Include dates, destination, budget, number of people, and any specific requirements or preferences." },
  personal_growth: { label: "Describe your goals", placeholder: "Include what you want to improve, your current habits, available time, and what's worked or hasn't worked before." },
  social_media: { label: "What do you want to post about?", placeholder: "Describe your topic and target audience. Include any relevant context, data, or angles." },
};

/* ─── Helper: get category for a slug ─── */
export function getTemplateCategory(slug: string): string {
  for (const cat of TEMPLATE_CATEGORIES) {
    if (cat.slugs.includes(slug)) return cat.id;
  }
  return "career";
}

/* ─── Helper: derive agent status from pipeline steps ─── */
export function deriveAgentStatus(
  agent: TemplateAgent,
  steps: { status: string }[]
): "idle" | "running" | "done" | "error" {
  const agentSteps = agent.stepIndices.map(i => steps[i]).filter(Boolean);
  if (agentSteps.length === 0) return "idle";
  if (agentSteps.some(s => s.status === "failed")) return "error";
  if (agentSteps.some(s => s.status === "working")) return "running";
  if (agentSteps.every(s => s.status === "done")) return "done";
  return "idle";
}

/* ─── Main: get run config for a template ─── */
export function getTemplateRunConfig(slug: string): TemplateRunConfig {
  const pipeline = TEMPLATE_PIPELINES[slug] || [];
  const catId = getTemplateCategory(slug);

  // Build virtual agents from pipeline preview data
  // Each tmpl_* pipeline has 5 steps. Distribute steps across agents.
  const agentCount = pipeline.length || 3;
  const agents: TemplateAgent[] = pipeline.map((p, i) => {
    // Distribute 5 steps across agents
    let stepIndices: number[];
    if (agentCount === 3) {
      // 3 agents: [0,1], [2,3], [4]
      if (i === 0) stepIndices = [0, 1];
      else if (i === 1) stepIndices = [2, 3];
      else stepIndices = [4];
    } else if (agentCount === 4) {
      // 4 agents: [0], [1,2], [3], [4]
      if (i === 0) stepIndices = [0];
      else if (i === 1) stepIndices = [1, 2];
      else if (i === 2) stepIndices = [3];
      else stepIndices = [4];
    } else {
      // Fallback: evenly distribute
      const stepsPerAgent = Math.ceil(5 / agentCount);
      const start = i * stepsPerAgent;
      stepIndices = Array.from({ length: stepsPerAgent }, (_, j) => start + j).filter(j => j < 5);
    }

    return {
      id: `a${i + 1}`,
      name: p.label,
      icon: p.icon,
      color: p.color,
      role: `Handles ${p.label.toLowerCase()} for this pipeline.`,
      model: "claude-sonnet-4",
      mcpTools: [],
      outputLabel: p.label,
      stepIndices,
    };
  });

  // If no pipeline data, generate generic 3-agent config
  if (agents.length === 0) {
    agents.push(
      { id: "a1", name: "Researcher", icon: "🔍", color: "#60a5fa", role: "Researches the topic.", model: "claude-sonnet-4", mcpTools: [], outputLabel: "Research", stepIndices: [0, 1] },
      { id: "a2", name: "Analyzer", icon: "📊", color: "#f5a623", role: "Analyzes the data.", model: "claude-sonnet-4", mcpTools: [], outputLabel: "Analysis", stepIndices: [2, 3] },
      { id: "a3", name: "Writer", icon: "✍️", color: "#4ade80", role: "Writes the final output.", model: "claude-sonnet-4", mcpTools: [], outputLabel: "Report", stepIndices: [4] },
    );
  }

  const quickFills = QUICK_FILLS[catId] || QUICK_FILLS.career;
  const tagline = TAGLINES[slug] || "Describe your task and let the agent pipeline handle the rest.";
  const inputPrompt = INPUT_PROMPTS[slug] || CATEGORY_INPUT_PROMPTS[catId] || { label: "Describe your task in detail", placeholder: "The more detail you provide, the better the results. Include relevant context, goals, constraints, and preferences." };

  return {
    estimatedTime: "45s",
    estimatedCost: "$0.06",
    tagline,
    agents,
    quickFills,
    inputLabel: inputPrompt.label,
    inputPlaceholder: inputPrompt.placeholder,
  };
}
