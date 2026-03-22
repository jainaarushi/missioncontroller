// Shared avatar image mapping for all agents
// 100 specialist character avatars distributed across all agent slugs

const AVATAR_POOL: string[] = [];
for (let i = 1; i <= 100; i++) {
  AVATAR_POOL.push(`/agents/specialists/avatar-${String(i).padStart(3, "0")}.png`);
}

// All agent slugs from AGENT_CATEGORY_MAP
const ALL_SLUGS = [
  // Product & Engineering
  "startup-idea-gen", "product-launch", "system-architect", "ux-designer",
  "fullstack-developer", "python-expert", "code-reviewer", "debugger",
  "sprint-planner", "project-planner", "devops-agent",
  // Research & Intelligence
  "deep-research", "academic-researcher", "fact-checker", "startup-trends",
  "competitor-intel", "web-intel", "data-analyst", "visualization-expert",
  "strategy-advisor", "decision-helper", "vc-due-diligence", "market-sizing",
  // Sales & Revenue
  "sales-rep", "investment-analyst", "personal-finance",
  "pricing-strategist", "proposal-writer",
  // Marketing & Content
  "content-creator", "linkedin-post", "blog-to-podcast", "journalist",
  "technical-writer", "editor", "email-drafter",
  "seo-agent", "social-media", "ad-copy", "newsletter-agent", "video-script",
  // Operations & Productivity
  "general-assistant", "meeting-notes", "customer-support", "recruitment-agent",
  "legal-advisor", "cover-letter",
  // Health & Lifestyle
  "fitness-coach", "mental-wellbeing", "recipe-planner", "travel-planner",
  // Creative & Fun
  "roast-master", "song-lyrics",
  // Career & Job Search
  "job-hunter", "resume-optimizer", "interview-coach", "salary-negotiator",
  // Money & Bills
  "subscription-killer", "bill-negotiator", "tax-deduction-finder", "budget-builder",
  // Legal & Rights
  "lease-reviewer",
  // Health & Medical
  "medical-bill-auditor",
];

// Deterministic mapping: each slug gets a unique avatar (100 avatars for ~59 slugs)
export const AGENT_AVATAR_MAP: Record<string, string> = {};
for (let i = 0; i < ALL_SLUGS.length; i++) {
  AGENT_AVATAR_MAP[ALL_SLUGS[i]] = AVATAR_POOL[i % AVATAR_POOL.length];
}

export function getAgentAvatar(slug: string): string | null {
  return AGENT_AVATAR_MAP[slug] || null;
}
