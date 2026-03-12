// Agent category definitions for the gallery and navigation
// Covers the full business lifecycle: Idea → Build → Launch → Grow → Scale

export interface AgentCategory {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  color: string;
  gradient: string;
  order: number;
}

export const AGENT_CATEGORIES: AgentCategory[] = [
  {
    id: "product",
    name: "Product & Engineering",
    tagline: "From idea to shipped product",
    icon: "rocket",
    color: "#6366F1",
    gradient: "linear-gradient(135deg, #6366F1, #818CF8)",
    order: 1,
  },
  {
    id: "research",
    name: "Research & Intelligence",
    tagline: "Real data, not guesswork",
    icon: "search",
    color: "#0EA5E9",
    gradient: "linear-gradient(135deg, #0EA5E9, #38BDF8)",
    order: 2,
  },
  {
    id: "sales",
    name: "Sales & Revenue",
    tagline: "From cold lead to signed deal",
    icon: "chart",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #10B981, #34D399)",
    order: 3,
  },
  {
    id: "marketing",
    name: "Marketing & Content",
    tagline: "Content that converts",
    icon: "megaphone",
    color: "#F43F5E",
    gradient: "linear-gradient(135deg, #F43F5E, #FB7185)",
    order: 4,
  },
  {
    id: "operations",
    name: "Operations & Productivity",
    tagline: "Run your business on autopilot",
    icon: "gear",
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B, #FBBF24)",
    order: 5,
  },
  {
    id: "lifestyle",
    name: "Health & Lifestyle",
    tagline: "Your AI life coach",
    icon: "heart",
    color: "#EC4899",
    gradient: "linear-gradient(135deg, #EC4899, #F472B6)",
    order: 6,
  },
  {
    id: "creative",
    name: "Creative & Fun",
    tagline: "Go viral, have fun",
    icon: "sparkle",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6, #A78BFA)",
    order: 7,
  },
];

// Map every agent slug to its category
export const AGENT_CATEGORY_MAP: Record<string, string> = {
  // Product & Engineering
  "startup-idea-gen": "product",
  "product-launch": "product",
  "system-architect": "product",
  "ux-designer": "product",
  "fullstack-developer": "product",
  "python-expert": "product",
  "code-reviewer": "product",
  "debugger": "product",
  "sprint-planner": "product",
  "project-planner": "product",
  "home-renovation": "product",
  "game-design": "product",
  "ui-ux-feedback": "product",
  "devops-agent": "product",

  // Research & Intelligence
  "deep-research": "research",
  "academic-researcher": "research",
  "fact-checker": "research",
  "startup-trends": "research",
  "competitor-intel": "research",
  "web-intel": "research",
  "data-analyst": "research",
  "visualization-expert": "research",
  "strategy-advisor": "research",
  "decision-helper": "research",
  "vc-due-diligence": "research",
  "market-sizing": "research",

  // Sales & Revenue
  "sales-rep": "sales",
  "investment-analyst": "sales",
  "personal-finance": "sales",
  "real-estate-analyst": "sales",
  "pricing-strategist": "sales",
  "proposal-writer": "sales",

  // Marketing & Content
  "content-creator": "marketing",
  "linkedin-post": "marketing",
  "blog-to-podcast": "marketing",
  "journalist": "marketing",
  "technical-writer": "marketing",
  "editor": "marketing",
  "email-drafter": "marketing",
  "meme-caption": "marketing",
  "seo-agent": "marketing",
  "social-media": "marketing",
  "ad-copy": "marketing",
  "newsletter-agent": "marketing",
  "video-script": "marketing",

  // Operations & Productivity
  "general-assistant": "operations",
  "meeting-notes": "operations",
  "customer-support": "operations",
  "recruitment-agent": "operations",
  "legal-advisor": "operations",
  "cover-letter": "operations",
  "speech-trainer": "operations",
  "ecommerce-agent": "operations",
  "teaching-agent": "operations",

  // Health & Lifestyle
  "fitness-coach": "lifestyle",
  "mental-wellbeing": "lifestyle",
  "recipe-planner": "lifestyle",
  "travel-planner": "lifestyle",
  "life-coach": "lifestyle",
  "baby-name": "lifestyle",

  // Creative & Fun
  "roast-master": "creative",
  "dream-interpreter": "creative",
  "villain-origin": "creative",
  "fortune-teller": "creative",
  "rap-battle": "creative",
  "alien-anthropologist": "creative",
  "toxic-trait": "creative",
  "dating-profile": "creative",
  "movie-plot": "creative",
  "song-lyrics": "creative",
  "bedtime-story": "creative",
  "excuse-generator": "creative",
  "apology-writer": "creative",
  "future-coach": "creative",
  "debate-champion": "creative",
  "music-generator": "creative",
};

export function getAgentCategory(slug: string): AgentCategory {
  const categoryId = AGENT_CATEGORY_MAP[slug] || "creative";
  return AGENT_CATEGORIES.find(c => c.id === categoryId) || AGENT_CATEGORIES[6];
}
