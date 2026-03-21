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
  health_personal: { label: "Health", color: "#f472b6", catBg: "rgba(244,114,182,0.10)" },
  social_media: { label: "Social Media", color: "#0A66C2", catBg: "rgba(10,102,194,0.10)" },
};

/* ─── Template categories with slugs ─── */
export const TEMPLATE_CATEGORIES: { id: string; title: string; slugs: string[] }[] = [
  { id: "career", title: "Career & Job Search", slugs: ["job-hunter", "resume-optimizer", "interview-coach", "salary-negotiator"] },
  { id: "finance_personal", title: "Money & Bills", slugs: ["subscription-killer", "bill-negotiator", "tax-deduction-finder", "budget-builder"] },
  { id: "legal_personal", title: "Legal & Rights", slugs: ["lease-reviewer"] },
  { id: "health_personal", title: "Health & Medical", slugs: ["medical-bill-auditor"] },
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
  "lease-reviewer": [
    { icon: "📋", label: "Clause Parser", color: "#60a5fa" },
    { icon: "🔒", label: "Risk Analyzer", color: "#ef4444" },
    { icon: "⚖️", label: "Legal Checker", color: "#c084fc" },
    { icon: "📝", label: "Report Writer", color: "#4ade80" },
  ],
  "medical-bill-auditor": [
    { icon: "📊", label: "Bill Scanner", color: "#60a5fa" },
    { icon: "🔍", label: "Code Checker", color: "#ef4444" },
    { icon: "💰", label: "Savings Finder", color: "#4ade80" },
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
  "job-hunter": 4.9, "resume-optimizer": 4.8, "interview-coach": 4.8,
  "salary-negotiator": 4.7,
  "subscription-killer": 4.8, "bill-negotiator": 4.7, "tax-deduction-finder": 4.9,
  "budget-builder": 4.7,
  "lease-reviewer": 4.9,
  "medical-bill-auditor": 4.9,
  "social-media": 4.8,
};

export const TEMPLATE_RUNS: Record<string, string> = {
  "job-hunter": "5.2k", "resume-optimizer": "6.1k", "interview-coach": "3.1k",
  "salary-negotiator": "2.4k",
  "subscription-killer": "4.1k", "bill-negotiator": "3.2k", "tax-deduction-finder": "5.3k",
  "budget-builder": "3.4k",
  "lease-reviewer": "2.8k",
  "medical-bill-auditor": "3.7k",
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
  health_personal: [
    "I've had persistent tension headaches for 2 weeks, usually in the afternoon. I work at a computer 8+ hours a day. No nausea or vision changes. Taking ibuprofen daily.",
    "Family of 4, comparing health insurance plans for open enrollment. We need good pediatric coverage, mental health benefits, and a reasonable deductible under $3,000.",
    "I want to meal prep for the week. Target: 1,800 cal/day, high protein (150g+). I'm lactose intolerant and don't eat pork. Budget: $80/week for groceries. Cooking time: 2 hours on Sunday.",
  ],
  social_media: [
    "I just launched a SaaS product for freelancers to track invoices. I want to announce it on LinkedIn and Twitter to attract early users. Target audience: freelance designers and developers.",
    "Write a thought leadership post about how AI is changing the hiring process. I'm a recruiter with 8 years experience and want to share my perspective on resume screening tools.",
    "I got promoted to VP of Engineering and want to share the news professionally. Include lessons learned from 10 years in tech, starting as a junior developer.",
  ],
};

/* ─── Taglines per template ─── */
const TAGLINES: Record<string, string> = {
  "job-hunter": "Find matching jobs from across the web based on your skills, experience, and preferences.",
  "resume-optimizer": "Optimize your resume for ATS systems and human recruiters.",
  "interview-coach": "Prepare for your next interview with company-specific questions and coached answers.",
  "salary-negotiator": "Research market rates and build a negotiation strategy.",
  "budget-builder": "Create a personalized budget based on your income and spending patterns.",
  "subscription-killer": "Find and cancel subscriptions you don't use anymore.",
  "bill-negotiator": "Get scripts and strategies to lower your bills.",
  "tax-deduction-finder": "Find tax deductions you might be missing.",
  "lease-reviewer": "Review your lease for red flags, missing protections, and unfair terms.",
  "medical-bill-auditor": "Scan medical bills for errors and find savings.",
  "social-media": "Create ready-to-publish LinkedIn posts and Twitter/X threads from any topic.",
};

/* ─── Template-specific input labels and placeholders ─── */
const INPUT_PROMPTS: Record<string, { label: string; placeholder: string }> = {
  "resume-optimizer": { label: "Paste your resume or describe your experience", placeholder: "Paste your full resume text here, OR describe:\n- Your current role and years of experience\n- Key skills and technologies\n- Target job titles you're applying for\n- Any specific job posting you want to optimize for" },
  "job-hunter": { label: "Describe what you're looking for", placeholder: "Include:\n- Your skills and experience level (e.g. 5 years React/Node.js)\n- Desired role (e.g. Senior Frontend Engineer)\n- Location preference (e.g. remote, NYC, London)\n- Salary range (e.g. $120-150k)\n- Industry preferences (e.g. fintech, healthtech)" },
  "interview-coach": { label: "Tell us about the interview", placeholder: "Include:\n- Company name and role you're interviewing for\n- Interview stage (phone screen, technical, final round)\n- Your relevant experience for this role\n- Any specific concerns or areas you want help with" },
  "salary-negotiator": { label: "Describe your negotiation situation", placeholder: "Include:\n- Your current or offered salary\n- Role and company name\n- Years of experience\n- Location\n- Any competing offers\n- What you'd like to negotiate (base, equity, benefits)" },
  "budget-builder": { label: "Describe your financial situation", placeholder: "Include:\n- Monthly income (after tax)\n- Major recurring expenses (rent, utilities, loans)\n- Financial goals (save for house, pay off debt, etc.)\n- Any specific spending categories to track" },
  "subscription-killer": { label: "List your current subscriptions", placeholder: "List all your subscriptions with monthly costs:\n- Streaming (Netflix, Spotify, etc.)\n- Software (Adobe, Microsoft, etc.)\n- Memberships (gym, clubs, etc.)\n- Any other recurring charges\n\nNote which ones you use regularly vs. rarely." },
  "tax-deduction-finder": { label: "Describe your tax situation", placeholder: "Include:\n- Employment type (W-2, 1099, self-employed)\n- Industry/profession\n- Major expenses (home office, education, medical)\n- Filing status (single, married, etc.)\n- Any significant life changes this year" },
  "lease-reviewer": { label: "Paste your lease agreement", placeholder: "Paste the full lease text or key sections you're concerned about.\nInclude:\n- Type of property (apartment, house, commercial)\n- Lease duration and monthly rent\n- Any specific clauses that worry you" },
  "medical-bill-auditor": { label: "Describe your medical bills", placeholder: "Include:\n- Total amount billed\n- Type of procedure/visit\n- Insurance coverage status\n- Any specific charges that seem too high\n- Your insurance provider and plan type" },
  "social-media": { label: "What do you want to post about?", placeholder: "Describe your topic, angle, or announcement:\n- What's the key message or story?\n- Who is your target audience?\n- Any specific tone (professional, casual, inspirational)?\n- Include any data, achievements, or context to reference" },
};

const CATEGORY_INPUT_PROMPTS: Record<string, { label: string; placeholder: string }> = {
  career: { label: "Describe your career situation", placeholder: "Include your current role, years of experience, skills, and what you're looking for. The more detail you provide, the better the results." },
  finance_personal: { label: "Describe your financial situation", placeholder: "Include relevant financial details like income, expenses, debts, and your goals. Be specific about amounts and timelines." },
  legal_personal: { label: "Describe your legal situation", placeholder: "Include what happened, who's involved, relevant dates, amounts, and what outcome you want. The more context you provide, the better." },
  health_personal: { label: "Describe your health goals", placeholder: "Include relevant health details, goals, constraints, and preferences. Be as specific as possible for personalized advice." },
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
