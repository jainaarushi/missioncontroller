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
  {
    id: "engineering",
    name: "Engineering",
    tagline: "Build robust systems at scale",
    icon: "wrench",
    color: "#4F46E5",
    gradient: "linear-gradient(135deg, #4F46E5, #818CF8)",
    order: 8,
  },
  {
    id: "design",
    name: "Design",
    tagline: "Pixel-perfect experiences",
    icon: "palette",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6, #A78BFA)",
    order: 9,
  },
  {
    id: "testing",
    name: "Testing & QA",
    tagline: "Ship with confidence",
    icon: "flask",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #10B981, #34D399)",
    order: 10,
  },
  {
    id: "paid_media",
    name: "Paid Media",
    tagline: "Maximize ad ROI",
    icon: "target",
    color: "#F43F5E",
    gradient: "linear-gradient(135deg, #F43F5E, #FB7185)",
    order: 11,
  },
  {
    id: "project_mgmt",
    name: "Project Management",
    tagline: "Deliver on time, every time",
    icon: "clipboard",
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B, #FBBF24)",
    order: 12,
  },
  {
    id: "support",
    name: "Support & Finance",
    tagline: "Keep the lights on",
    icon: "lifebuoy",
    color: "#0EA5E9",
    gradient: "linear-gradient(135deg, #0EA5E9, #38BDF8)",
    order: 13,
  },
  {
    id: "game_dev",
    name: "Game Development",
    tagline: "Build immersive worlds",
    icon: "gamepad",
    color: "#EC4899",
    gradient: "linear-gradient(135deg, #EC4899, #F472B6)",
    order: 14,
  },
  {
    id: "spatial",
    name: "Spatial Computing",
    tagline: "Design for XR and 3D",
    icon: "cube",
    color: "#7C3AED",
    gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)",
    order: 15,
  },
  {
    id: "academic",
    name: "Academic Research",
    tagline: "Rigorous scholarly analysis",
    icon: "book",
    color: "#0891B2",
    gradient: "linear-gradient(135deg, #0891B2, #22D3EE)",
    order: 16,
  },
  {
    id: "specialized",
    name: "Specialized",
    tagline: "Niche expertise on demand",
    icon: "star",
    color: "#D97706",
    gradient: "linear-gradient(135deg, #D97706, #FBBF24)",
    order: 17,
  },
  {
    id: "career",
    name: "Career & Job Search",
    tagline: "Land your dream job",
    icon: "briefcase",
    color: "#2563EB",
    gradient: "linear-gradient(135deg, #2563EB, #3B82F6)",
    order: 8,
  },
  {
    id: "finance_personal",
    name: "Money & Bills",
    tagline: "Save more, spend smarter",
    icon: "wallet",
    color: "#059669",
    gradient: "linear-gradient(135deg, #059669, #34D399)",
    order: 9,
  },
  {
    id: "legal_personal",
    name: "Legal & Rights",
    tagline: "Know your rights",
    icon: "shield",
    color: "#7C3AED",
    gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)",
    order: 10,
  },
  {
    id: "housing",
    name: "Housing & Moving",
    tagline: "Find your perfect home",
    icon: "home",
    color: "#D97706",
    gradient: "linear-gradient(135deg, #D97706, #FBBF24)",
    order: 11,
  },
  {
    id: "health_personal",
    name: "Health & Medical",
    tagline: "Navigate healthcare smarter",
    icon: "stethoscope",
    color: "#DC2626",
    gradient: "linear-gradient(135deg, #DC2626, #F87171)",
    order: 12,
  },
  {
    id: "education",
    name: "Education & Learning",
    tagline: "Your academic advantage",
    icon: "graduation",
    color: "#0891B2",
    gradient: "linear-gradient(135deg, #0891B2, #22D3EE)",
    order: 13,
  },
  {
    id: "shopping",
    name: "Smart Shopping",
    tagline: "Shop smarter, save more",
    icon: "tag",
    color: "#C026D3",
    gradient: "linear-gradient(135deg, #C026D3, #E879F9)",
    order: 14,
  },
  {
    id: "freelance",
    name: "Freelance & Side Income",
    tagline: "Earn on your own terms",
    icon: "zap",
    color: "#EA580C",
    gradient: "linear-gradient(135deg, #EA580C, #FB923C)",
    order: 15,
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
  "devops-agent": "product",
  "ui-designer": "product",
  "qa-tester": "product",
  "api-tester": "product",
  "a11y-auditor": "product",
  "security-engineer": "product",
  "product-manager": "product",

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
  "ux-researcher": "research",
  "data-engineer": "research",
  "analytics-reporter": "research",

  // Sales & Revenue
  "sales-rep": "sales",
  "investment-analyst": "sales",
  "personal-finance": "sales",
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
  "seo-agent": "marketing",
  "social-media": "marketing",
  "ad-copy": "marketing",
  "newsletter-agent": "marketing",
  "video-script": "marketing",
  "brand-guardian": "marketing",
  "growth-hacker": "marketing",
  "ppc-strategist": "marketing",
  "paid-social": "marketing",
  "podcast-strategist": "marketing",

  // Operations & Productivity
  "general-assistant": "operations",
  "meeting-notes": "operations",
  "customer-support": "operations",
  "recruitment-agent": "operations",
  "legal-advisor": "operations",
  "cover-letter": "operations",
  "scrum-master": "operations",

  // Health & Lifestyle
  "fitness-coach": "lifestyle",
  "mental-wellbeing": "lifestyle",
  "recipe-planner": "lifestyle",
  "travel-planner": "lifestyle",

  // Creative & Fun
  "roast-master": "creative",
  "song-lyrics": "creative",

  // Career & Job Search
  "job-hunter": "career",
  "auto-applier": "career",
  "resume-optimizer": "career",
  "interview-coach": "career",
  "salary-negotiator": "career",

  // Money & Bills
  "subscription-killer": "finance_personal",
  "bill-negotiator": "finance_personal",
  "tax-deduction-finder": "finance_personal",
  "credit-score-coach": "finance_personal",
  "deal-spotter": "finance_personal",

  // Legal & Rights
  "dispute-fighter": "legal_personal",
  "benefits-finder": "legal_personal",
  "lease-reviewer": "legal_personal",
  "immigration-helper": "legal_personal",
  "small-claims-advisor": "legal_personal",

  // Housing & Moving
  "apartment-scout": "housing",
  "moving-coordinator": "housing",
  "utility-optimizer": "housing",
  "roommate-matcher": "housing",

  // Health & Medical
  "medical-bill-auditor": "health_personal",
  "insurance-comparer": "health_personal",
  "symptom-researcher": "health_personal",
  "prescription-saver": "health_personal",

  // Education
  "scholarship-hunter": "education",
  "college-advisor": "education",

  // Smart Shopping
  "return-assistant": "shopping",
  "car-buy-negotiator": "shopping",

  // Freelance & Side Income
  "freelance-bid-writer": "freelance",
  "side-hustle-matcher": "freelance",
  "contract-reviewer": "freelance",

  // Engineering
  "ai-data-remediation-engineer": "engineering",
  "ai-engineer": "engineering",
  "autonomous-optimization-architect": "engineering",
  "backend-architect": "engineering",
  "database-optimizer": "engineering",
  "devops-automator": "engineering",
  "embedded-firmware-engineer": "engineering",
  "feishu-integration-developer": "engineering",
  "frontend-developer": "engineering",
  "git-workflow-master": "engineering",
  "incident-response-commander": "engineering",
  "mobile-app-builder": "engineering",
  "rapid-prototyper": "engineering",
  "senior-developer": "engineering",
  "software-architect": "engineering",
  "solidity-smart-contract-engineer": "engineering",
  "eng-sre": "engineering",
  "threat-detection-engineer": "engineering",
  "wechat-mini-program-developer": "engineering",

  // Design
  "image-prompt-engineer": "design",
  "inclusive-visuals-specialist": "design",
  "ux-architect": "design",
  "visual-storyteller": "design",
  "whimsy-injector": "design",

  // Testing & QA
  "evidence-collector": "testing",
  "performance-benchmarker": "testing",
  "reality-checker": "testing",
  "test-results-analyzer": "testing",
  "tool-evaluator": "testing",
  "workflow-optimizer": "testing",

  // Paid Media
  "pm-auditor": "paid_media",
  "creative-strategist": "paid_media",
  "programmatic-buyer": "paid_media",
  "search-query-analyst": "paid_media",
  "tracking-specialist": "paid_media",

  // Project Management
  "experiment-tracker": "project_mgmt",
  "jira-workflow-steward": "project_mgmt",
  "project-shepherd": "project_mgmt",
  "studio-operations": "project_mgmt",
  "studio-producer": "project_mgmt",
  "proj-senior": "project_mgmt",

  // Support & Finance
  "executive-summary-generator": "support",
  "finance-tracker": "support",
  "infrastructure-maintainer": "support",
  "legal-compliance-checker": "support",
  "support-responder": "support",

  // Game Development
  "game-audio-engineer": "game_dev",
  "game-designer": "game_dev",
  "level-designer": "game_dev",
  "narrative-designer": "game_dev",
  "technical-artist": "game_dev",
  "unreal-multiplayer-architect": "game_dev",
  "unreal-systems-engineer": "game_dev",
  "unreal-technical-artist": "game_dev",
  "unreal-world-builder": "game_dev",
  "unity-architect": "game_dev",
  "unity-editor-tool-developer": "game_dev",
  "unity-multiplayer-engineer": "game_dev",
  "unity-shader-graph-artist": "game_dev",
  "roblox-avatar-creator": "game_dev",
  "roblox-experience-designer": "game_dev",
  "roblox-systems-scripter": "game_dev",
  "blender-addon-engineer": "game_dev",
  "godot-gameplay-scripter": "game_dev",
  "godot-multiplayer-engineer": "game_dev",
  "godot-shader-developer": "game_dev",

  // Spatial Computing
  "macos-spatial-metal-engineer": "spatial",
  "terminal-integration-specialist": "spatial",
  "visionos-spatial-engineer": "spatial",
  "xr-cockpit-interaction-specialist": "spatial",
  "xr-immersive-developer": "spatial",
  "xr-interface-architect": "spatial",

  // Academic Research
  "academic-anthropologist": "academic",
  "academic-geographer": "academic",
  "academic-historian": "academic",
  "academic-narratologist": "academic",
  "academic-psychologist": "academic",

  // Specialized
  "accounts-payable-agent": "specialized",
  "agentic-identity-trust": "specialized",
  "agents-orchestrator": "specialized",
  "automation-governance-architect": "specialized",
  "blockchain-security-auditor": "specialized",
  "compliance-auditor": "specialized",
  "corporate-training-designer": "specialized",
  "data-consolidation-agent": "specialized",
  "government-digital-presales-consultant": "specialized",
  "healthcare-marketing-compliance": "specialized",
  "identity-graph-operator": "specialized",
  "lsp-index-engineer": "specialized",
  "recruitment-specialist": "specialized",
  "report-distribution-agent": "specialized",
  "data-extraction-agent": "specialized",
  "cultural-intelligence-strategist": "specialized",
  "developer-advocate": "specialized",
  "document-generator": "specialized",
  "french-consulting-market": "specialized",
  "korean-business-navigator": "specialized",
  "mcp-builder": "specialized",
  "model-qa": "specialized",
  "salesforce-architect": "specialized",
  "workflow-architect": "specialized",
  "study-abroad-advisor": "specialized",
  "supply-chain-strategist": "specialized",
  "zk-steward": "specialized",

  // Additional Sales
  "account-strategist": "sales",
  "sales-coach": "sales",
  "deal-strategist": "sales",
  "discovery-coach": "sales",
  "sales-engineer": "sales",
  "outbound-strategist": "sales",
  "pipeline-analyst": "sales",
  "proposal-strategist": "sales",

  // Additional Marketing
  "ai-citation-strategist": "marketing",
  "app-store-optimizer": "marketing",
  "baidu-seo-specialist": "marketing",
  "bilibili-content-strategist": "marketing",
  "book-co-author": "marketing",
  "carousel-growth-engine": "marketing",
  "china-ecommerce-operator": "marketing",
  "cross-border-ecommerce": "marketing",
  "douyin-strategist": "marketing",
  "instagram-curator": "marketing",
  "kuaishou-strategist": "marketing",
  "linkedin-content-creator": "marketing",
  "livestream-commerce-coach": "marketing",
  "private-domain-operator": "marketing",
  "reddit-community-builder": "marketing",
  "short-video-editing-coach": "marketing",
  "tiktok-strategist": "marketing",
  "twitter-engager": "marketing",
  "wechat-official-account": "marketing",
  "weibo-strategist": "marketing",
  "xiaohongshu-specialist": "marketing",
  "zhihu-strategist": "marketing",

  // Additional Product
  "behavioral-nudge-engine": "product",
  "feedback-synthesizer": "product",
  "sprint-prioritizer": "product",
  "trend-researcher": "product",
};

// ── Category classification ─────────────────────────────────

export const SPECIALIST_CATEGORY_IDS = [
  "product", "research", "sales", "marketing", "operations", "creative", "lifestyle",
  "engineering", "design", "testing", "paid_media", "project_mgmt", "support",
  "game_dev", "spatial", "academic", "specialized"
];

export const TEMPLATE_CATEGORY_IDS = [
  "career", "finance_personal", "legal_personal", "housing",
  "health_personal", "education", "shopping", "freelance"
];

export function isTemplateAgent(slug: string): boolean {
  const catId = AGENT_CATEGORY_MAP[slug];
  return catId ? TEMPLATE_CATEGORY_IDS.includes(catId) : false;
}

export function getAgentCategory(slug: string): AgentCategory {
  const categoryId = AGENT_CATEGORY_MAP[slug] || "creative";
  return AGENT_CATEGORIES.find(c => c.id === categoryId) || AGENT_CATEGORIES[6];
}
