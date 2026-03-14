// Shared avatar image mapping for all agents
// 12 chibi character images distributed across all agent slugs

const AVATAR_POOL = [
  "/avatars/batch1-1.png",
  "/avatars/batch1-2.png",
  "/avatars/batch1-3.png",
  "/avatars/batch1-4.png",
  "/avatars/batch1-5.png",
  "/avatars/batch1-6.png",
  "/avatars/batch2-1.png",
  "/avatars/batch2-2.png",
  "/avatars/batch2-3.png",
  "/avatars/batch2-4.png",
  "/avatars/batch2-5.png",
  "/avatars/batch2-6.png",
];

// All agent slugs from AGENT_CATEGORY_MAP
const ALL_SLUGS = [
  // Product & Engineering
  "startup-idea-gen", "product-launch", "system-architect", "ux-designer",
  "fullstack-developer", "python-expert", "code-reviewer", "debugger",
  "sprint-planner", "project-planner", "home-renovation", "game-design",
  "ui-ux-feedback", "devops-agent",
  // Research & Intelligence
  "deep-research", "academic-researcher", "fact-checker", "startup-trends",
  "competitor-intel", "web-intel", "data-analyst", "visualization-expert",
  "strategy-advisor", "decision-helper", "vc-due-diligence", "market-sizing",
  // Sales & Revenue
  "sales-rep", "investment-analyst", "personal-finance", "real-estate-analyst",
  "pricing-strategist", "proposal-writer",
  // Marketing & Content
  "content-creator", "linkedin-post", "blog-to-podcast", "journalist",
  "technical-writer", "editor", "email-drafter", "meme-caption",
  "seo-agent", "social-media", "ad-copy", "newsletter-agent", "video-script",
  // Operations & Productivity
  "general-assistant", "meeting-notes", "customer-support", "recruitment-agent",
  "legal-advisor", "cover-letter", "speech-trainer", "ecommerce-agent", "teaching-agent",
  // Health & Lifestyle
  "fitness-coach", "mental-wellbeing", "recipe-planner", "travel-planner",
  "life-coach", "baby-name",
  // Creative & Fun
  "roast-master", "dream-interpreter", "villain-origin", "fortune-teller",
  "rap-battle", "alien-anthropologist", "toxic-trait", "dating-profile",
  "movie-plot", "song-lyrics", "bedtime-story", "excuse-generator",
  "apology-writer", "future-coach", "debate-champion", "music-generator",
];

// Deterministic mapping: each slug gets an avatar based on its position
// This ensures the same avatar is always shown for the same agent
export const AGENT_AVATAR_MAP: Record<string, string> = {};
for (let i = 0; i < ALL_SLUGS.length; i++) {
  AGENT_AVATAR_MAP[ALL_SLUGS[i]] = AVATAR_POOL[i % AVATAR_POOL.length];
}

export function getAgentAvatar(slug: string): string | null {
  return AGENT_AVATAR_MAP[slug] || null;
}
