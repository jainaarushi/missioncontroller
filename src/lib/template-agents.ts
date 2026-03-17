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
};

/* ─── Template categories with slugs ─── */
export const TEMPLATE_CATEGORIES: { id: string; title: string; slugs: string[] }[] = [
  { id: "career", title: "Career & Job Search", slugs: ["job-hunter", "auto-applier", "resume-optimizer", "interview-coach", "salary-negotiator", "linkedin-optimizer", "career-pivoter", "remote-job-finder", "portfolio-builder", "networking-coach"] },
  { id: "finance_personal", title: "Money & Bills", slugs: ["subscription-killer", "bill-negotiator", "tax-deduction-finder", "credit-score-coach", "deal-spotter", "debt-snowball", "budget-builder", "crypto-tax-helper", "retirement-planner", "cashback-maximizer"] },
  { id: "legal_personal", title: "Legal & Rights", slugs: ["dispute-fighter", "benefits-finder", "lease-reviewer", "immigration-helper", "small-claims-advisor", "tenant-rights", "will-planner", "traffic-ticket"] },
  { id: "housing", title: "Housing & Moving", slugs: ["apartment-scout", "moving-coordinator", "utility-optimizer", "roommate-matcher", "home-inspector", "renovation-planner", "neighborhood-scout"] },
  { id: "health_personal", title: "Health & Medical", slugs: ["medical-bill-auditor", "insurance-comparer", "symptom-researcher", "prescription-saver", "meal-prep-planner", "sleep-optimizer", "therapy-finder", "supplement-advisor", "allergy-navigator"] },
  { id: "education", title: "Education", slugs: ["scholarship-hunter", "college-advisor", "study-plan-maker", "essay-coach", "skill-roadmap", "language-tutor"] },
  { id: "shopping", title: "Smart Shopping", slugs: ["return-assistant", "car-buy-negotiator", "warranty-claimer", "tech-buyer", "grocery-optimizer", "gift-finder"] },
  { id: "freelance", title: "Freelance & Side Income", slugs: ["freelance-bid-writer", "side-hustle-matcher", "contract-reviewer", "invoice-generator", "client-proposal", "rate-calculator"] },
  { id: "parenting", title: "Parenting & Family", slugs: ["baby-name-picker", "school-chooser", "chore-organizer", "college-savings", "childcare-finder", "summer-camp-finder"] },
  { id: "travel_events", title: "Travel & Events", slugs: ["flight-deal-hunter", "wedding-planner", "party-planner", "visa-advisor", "road-trip-planner", "packing-assistant"] },
  { id: "personal_growth", title: "Personal Growth", slugs: ["habit-tracker", "journaling-coach", "morning-routine", "social-skills", "dating-profile", "pet-care-advisor"] },
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
  "crypto-tax-helper": [
    { icon: "🔗", label: "Transaction Parser", color: "#f5a623" },
    { icon: "📊", label: "Gains Calculator", color: "#60a5fa" },
    { icon: "📝", label: "Report Writer", color: "#4ade80" },
  ],
  "retirement-planner": [
    { icon: "📊", label: "Asset Analyzer", color: "#60a5fa" },
    { icon: "📈", label: "Growth Projector", color: "#4ade80" },
    { icon: "📋", label: "Plan Builder", color: "#f5a623" },
  ],
  "cashback-maximizer": [
    { icon: "💳", label: "Card Analyzer", color: "#60a5fa" },
    { icon: "🏷️", label: "Category Mapper", color: "#c084fc" },
    { icon: "💰", label: "Reward Optimizer", color: "#4ade80" },
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
  "roommate-matcher": [
    { icon: "📋", label: "Profile Builder", color: "#60a5fa" },
    { icon: "🎯", label: "Compatibility Scorer", color: "#f5a623" },
    { icon: "📝", label: "Agreement Drafter", color: "#4ade80" },
  ],
  "home-inspector": [
    { icon: "🔍", label: "Checklist Builder", color: "#60a5fa" },
    { icon: "🏠", label: "Issue Spotter", color: "#ef4444" },
    { icon: "📝", label: "Report Generator", color: "#4ade80" },
  ],
  "renovation-planner": [
    { icon: "📋", label: "Scope Builder", color: "#60a5fa" },
    { icon: "💰", label: "Budget Estimator", color: "#f5a623" },
    { icon: "📅", label: "Timeline Planner", color: "#4ade80" },
  ],
  "neighborhood-scout": [
    { icon: "🌐", label: "Area Researcher", color: "#60a5fa" },
    { icon: "📊", label: "Safety Scorer", color: "#ef4444" },
    { icon: "🏠", label: "Livability Ranker", color: "#4ade80" },
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
  "supplement-advisor": [
    { icon: "🔍", label: "Health Analyzer", color: "#60a5fa" },
    { icon: "📊", label: "Research Scanner", color: "#c084fc" },
    { icon: "💊", label: "Stack Builder", color: "#4ade80" },
  ],
  "allergy-navigator": [
    { icon: "🔍", label: "Allergen Mapper", color: "#ef4444" },
    { icon: "📋", label: "Diet Planner", color: "#60a5fa" },
    { icon: "📝", label: "Guide Builder", color: "#4ade80" },
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
  "gift-finder": [
    { icon: "📋", label: "Profile Analyzer", color: "#60a5fa" },
    { icon: "🔍", label: "Gift Scanner", color: "#c084fc" },
    { icon: "🎁", label: "Pick Ranker", color: "#4ade80" },
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
  "chore-organizer": [
    { icon: "📋", label: "Task Mapper", color: "#60a5fa" },
    { icon: "📅", label: "Schedule Builder", color: "#a99cf5" },
    { icon: "✅", label: "Tracker", color: "#4ade80" },
  ],
  "college-savings": [
    { icon: "📊", label: "Cost Projector", color: "#60a5fa" },
    { icon: "📈", label: "529 Analyzer", color: "#f5a623" },
    { icon: "📋", label: "Plan Builder", color: "#4ade80" },
  ],
  "childcare-finder": [
    { icon: "🔍", label: "Provider Scanner", color: "#60a5fa" },
    { icon: "📊", label: "Review Analyzer", color: "#f5a623" },
    { icon: "🎯", label: "Match Ranker", color: "#4ade80" },
  ],
  "summer-camp-finder": [
    { icon: "🔍", label: "Camp Scanner", color: "#60a5fa" },
    { icon: "🎯", label: "Interest Matcher", color: "#a99cf5" },
    { icon: "📊", label: "Comparison Builder", color: "#4ade80" },
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
  "packing-assistant": [
    { icon: "🌤️", label: "Weather Checker", color: "#60a5fa" },
    { icon: "📋", label: "List Builder", color: "#22d3ee" },
    { icon: "✅", label: "Packing Organizer", color: "#4ade80" },
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
  "dating-profile": [
    { icon: "📋", label: "Profile Analyzer", color: "#f472b6" },
    { icon: "✍️", label: "Bio Writer", color: "#c084fc" },
    { icon: "📸", label: "Photo Advisor", color: "#4ade80" },
  ],
  "pet-care-advisor": [
    { icon: "🔍", label: "Breed Researcher", color: "#60a5fa" },
    { icon: "📋", label: "Care Planner", color: "#f5a623" },
    { icon: "🏥", label: "Vet Prep Guide", color: "#4ade80" },
  ],
};

/* ─── Ratings and runs per template ─── */
export const TEMPLATE_RATINGS: Record<string, number> = {
  "job-hunter": 4.9, "auto-applier": 4.7, "resume-optimizer": 4.8, "interview-coach": 4.8,
  "salary-negotiator": 4.7, "linkedin-optimizer": 4.6, "career-pivoter": 4.7, "remote-job-finder": 4.6,
  "portfolio-builder": 4.5, "networking-coach": 4.6,
  "subscription-killer": 4.8, "bill-negotiator": 4.7, "tax-deduction-finder": 4.9, "credit-score-coach": 4.6,
  "deal-spotter": 4.7, "debt-snowball": 4.8, "budget-builder": 4.7, "crypto-tax-helper": 4.5,
  "retirement-planner": 4.6, "cashback-maximizer": 4.5,
  "dispute-fighter": 4.8, "benefits-finder": 4.7, "lease-reviewer": 4.9, "immigration-helper": 4.6,
  "small-claims-advisor": 4.7, "tenant-rights": 4.8, "will-planner": 4.6, "traffic-ticket": 4.7,
  "apartment-scout": 4.7, "moving-coordinator": 4.6, "utility-optimizer": 4.5, "roommate-matcher": 4.4,
  "home-inspector": 4.7, "renovation-planner": 4.6, "neighborhood-scout": 4.7,
  "medical-bill-auditor": 4.9, "insurance-comparer": 4.7, "symptom-researcher": 4.6,
  "prescription-saver": 4.8, "meal-prep-planner": 4.8, "sleep-optimizer": 4.5,
  "therapy-finder": 4.6, "supplement-advisor": 4.5, "allergy-navigator": 4.6,
  "scholarship-hunter": 4.8, "college-advisor": 4.7, "study-plan-maker": 4.6,
  "essay-coach": 4.7, "skill-roadmap": 4.6, "language-tutor": 4.5,
  "return-assistant": 4.6, "car-buy-negotiator": 4.8, "warranty-claimer": 4.5,
  "tech-buyer": 4.7, "grocery-optimizer": 4.5, "gift-finder": 4.6,
  "freelance-bid-writer": 4.7, "side-hustle-matcher": 4.5, "contract-reviewer": 4.8,
  "invoice-generator": 4.4, "client-proposal": 4.7, "rate-calculator": 4.5,
  "baby-name-picker": 4.6, "school-chooser": 4.7, "chore-organizer": 4.4,
  "college-savings": 4.6, "childcare-finder": 4.5, "summer-camp-finder": 4.5,
  "flight-deal-hunter": 4.8, "wedding-planner": 4.7, "party-planner": 4.6,
  "visa-advisor": 4.7, "road-trip-planner": 4.6, "packing-assistant": 4.4,
  "habit-tracker": 4.6, "journaling-coach": 4.5, "morning-routine": 4.5,
  "social-skills": 4.4, "dating-profile": 4.6, "pet-care-advisor": 4.7,
};

export const TEMPLATE_RUNS: Record<string, string> = {
  "job-hunter": "5.2k", "auto-applier": "3.8k", "resume-optimizer": "6.1k", "interview-coach": "3.1k",
  "salary-negotiator": "2.4k", "linkedin-optimizer": "2.9k", "career-pivoter": "1.8k", "remote-job-finder": "2.6k",
  "portfolio-builder": "1.5k", "networking-coach": "1.7k",
  "subscription-killer": "4.1k", "bill-negotiator": "3.2k", "tax-deduction-finder": "5.3k", "credit-score-coach": "2.7k",
  "deal-spotter": "3.6k", "debt-snowball": "2.1k", "budget-builder": "3.4k", "crypto-tax-helper": "1.4k",
  "retirement-planner": "1.9k", "cashback-maximizer": "1.6k",
  "dispute-fighter": "2.3k", "benefits-finder": "2.8k", "lease-reviewer": "2.8k", "immigration-helper": "1.7k",
  "small-claims-advisor": "1.3k", "tenant-rights": "2.1k", "will-planner": "1.5k", "traffic-ticket": "1.9k",
  "apartment-scout": "2.4k", "moving-coordinator": "1.8k", "utility-optimizer": "1.3k", "roommate-matcher": "0.9k",
  "home-inspector": "1.6k", "renovation-planner": "1.4k", "neighborhood-scout": "1.7k",
  "medical-bill-auditor": "3.7k", "insurance-comparer": "2.5k", "symptom-researcher": "3.9k",
  "prescription-saver": "2.8k", "meal-prep-planner": "1.9k", "sleep-optimizer": "1.2k",
  "therapy-finder": "1.6k", "supplement-advisor": "1.1k", "allergy-navigator": "1.3k",
  "scholarship-hunter": "2.9k", "college-advisor": "2.3k", "study-plan-maker": "4.5k",
  "essay-coach": "2.1k", "skill-roadmap": "1.8k", "language-tutor": "1.4k",
  "return-assistant": "1.7k", "car-buy-negotiator": "2.2k", "warranty-claimer": "1.1k",
  "tech-buyer": "2.6k", "grocery-optimizer": "1.3k", "gift-finder": "1.8k",
  "freelance-bid-writer": "2.2k", "side-hustle-matcher": "1.5k", "contract-reviewer": "2.4k",
  "invoice-generator": "1.0k", "client-proposal": "1.9k", "rate-calculator": "1.2k",
  "baby-name-picker": "1.6k", "school-chooser": "1.4k", "chore-organizer": "0.8k",
  "college-savings": "1.1k", "childcare-finder": "1.0k", "summer-camp-finder": "0.9k",
  "flight-deal-hunter": "3.1k", "wedding-planner": "2.4k", "party-planner": "1.7k",
  "visa-advisor": "1.9k", "road-trip-planner": "1.5k", "packing-assistant": "1.1k",
  "habit-tracker": "1.8k", "journaling-coach": "1.2k", "morning-routine": "1.4k",
  "social-skills": "0.9k", "dating-profile": "1.6k", "pet-care-advisor": "1.3k",
};

/* ─── Quick-fill suggestions per template category ─── */
const QUICK_FILLS: Record<string, string[]> = {
  career: ["Senior React dev, remote London", "Junior Python dev, first job", "Product Manager, Series B startup"],
  finance_personal: ["Monthly budget for $5k income", "Student loans + credit card debt", "Optimize tax deductions for freelancer"],
  legal_personal: ["Landlord won't return deposit", "Wrongful parking ticket", "Review standard NDA"],
  housing: ["2BR apartment, $2k budget, Brooklyn", "Moving from NYC to Austin", "First-time homebuyer checklist"],
  health_personal: ["Persistent headaches for 2 weeks", "Compare family health plans", "Weekly meal prep, 1800 cal/day"],
  education: ["STEM scholarships for sophomores", "Study plan for SAT in 3 months", "College essays for engineering"],
  shopping: ["Best laptop under $1500 for dev", "Return defective AirPods Pro", "Wedding gift, $100 budget"],
  freelance: ["Freelance web dev proposal", "Calculate hourly rate as designer", "Review client contract"],
  parenting: ["Biblical boy names, unique", "Best elementary schools in Austin", "Summer STEM camps for 10yo"],
  travel_events: ["London to Tokyo, cheapest month", "Weekend birthday party for 30", "10-day road trip, California coast"],
  personal_growth: ["Build morning routine for productivity", "Start daily journaling habit", "Improve networking at events"],
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
  "crypto-tax-helper": "Calculate gains and generate tax reports for crypto transactions.",
  "retirement-planner": "Project your retirement savings and optimize your strategy.",
  "cashback-maximizer": "Optimize credit card rewards for your spending categories.",
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
  "roommate-matcher": "Build a compatibility profile and draft a roommate agreement.",
  "home-inspector": "Create a home inspection checklist and spot issues.",
  "renovation-planner": "Scope your renovation, estimate costs, and plan the timeline.",
  "neighborhood-scout": "Research neighborhoods for safety, amenities, and livability.",
  "medical-bill-auditor": "Scan medical bills for errors and find savings.",
  "insurance-comparer": "Compare insurance plans and get a recommendation.",
  "symptom-researcher": "Research symptoms and get a structured report for your doctor.",
  "prescription-saver": "Find the cheapest prices for your prescriptions.",
  "meal-prep-planner": "Plan weekly meals with nutrition targets and a grocery list.",
  "sleep-optimizer": "Analyze your sleep habits and build a better routine.",
  "therapy-finder": "Find therapists that match your needs and insurance.",
  "supplement-advisor": "Research supplements based on your health goals.",
  "allergy-navigator": "Map allergens and build a safe diet plan.",
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
  "gift-finder": "Find the perfect gift based on interests and budget.",
  "freelance-bid-writer": "Analyze the project and write a winning bid.",
  "side-hustle-matcher": "Match your skills to side income opportunities.",
  "contract-reviewer": "Parse contracts for risks and write a summary.",
  "invoice-generator": "Collect project details and generate a professional invoice.",
  "client-proposal": "Analyze the brief and write a compelling proposal.",
  "rate-calculator": "Research market rates and calculate your optimal pricing.",
  "baby-name-picker": "Research names with meanings, popularity, and compatibility.",
  "school-chooser": "Compare schools by ratings, programs, and fit.",
  "chore-organizer": "Map household tasks and build a fair schedule.",
  "college-savings": "Project costs and optimize your 529 plan.",
  "childcare-finder": "Find and compare childcare providers.",
  "summer-camp-finder": "Find camps matching your child's interests.",
  "flight-deal-hunter": "Scan fares across dates and airlines for the best deals.",
  "wedding-planner": "Plan your wedding budget, vendors, and timeline.",
  "party-planner": "Plan the theme, vendors, and checklist for your event.",
  "visa-advisor": "Research visa requirements and build an application guide.",
  "road-trip-planner": "Plan your route, stops, and create an itinerary.",
  "packing-assistant": "Check weather and build a smart packing list.",
  "habit-tracker": "Analyze habits and design a tracking system.",
  "journaling-coach": "Get reflection prompts and build a journaling practice.",
  "morning-routine": "Design a morning routine optimized for your goals.",
  "social-skills": "Assess skills and get practice scenarios.",
  "dating-profile": "Analyze and rewrite your dating profile.",
  "pet-care-advisor": "Research your pet's breed and build a care plan.",
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

  return {
    estimatedTime: "45s",
    estimatedCost: "$0.06",
    tagline,
    agents,
    quickFills,
  };
}
