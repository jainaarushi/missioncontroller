import type { Agent } from "@/lib/types/agent";

// Keyword → agent slug mapping with relevance weights
const KEYWORD_MAP: { keywords: string[]; slugs: string[]; weight: number }[] = [
  // Research
  { keywords: ["research", "find", "discover", "investigate", "look up", "search for", "compare", "competitor", "fact-check", "verify", "report on"], slugs: ["scout"], weight: 3 },
  // Writing
  { keywords: ["write", "draft", "compose", "email", "blog", "article", "newsletter", "copy", "content", "post", "letter", "announcement", "press release", "case study"], slugs: ["quill"], weight: 3 },
  // Data
  { keywords: ["analyze", "data", "metrics", "kpi", "dashboard", "numbers", "trends", "conversion", "analytics", "statistics", "funnel", "performance", "report"], slugs: ["metric"], weight: 3 },
  // General
  { keywords: ["plan", "organize", "brainstorm", "summarize", "summary", "list", "outline", "ideas", "prepare", "schedule", "agenda", "prioritize"], slugs: ["atlas"], weight: 2 },
  // Travel
  { keywords: ["travel", "trip", "itinerary", "flight", "hotel", "vacation", "destination", "booking", "getaway", "visit", "tour"], slugs: ["voyager"], weight: 3 },
  // Finance
  { keywords: ["stock", "finance", "invest", "market", "portfolio", "trading", "earnings", "revenue", "budget", "financial", "etf", "crypto", "valuation"], slugs: ["pulse"], weight: 3 },
  // Web Intelligence
  { keywords: ["scrape", "extract", "monitor", "track", "web", "website", "pricing", "competitor pricing", "crawl", "intelligence"], slugs: ["sleuth"], weight: 3 },
  // Content Transform
  { keywords: ["convert", "transform", "podcast", "thread", "repurpose", "social media", "presentation", "slides", "turn into", "reformat"], slugs: ["caster"], weight: 3 },
  // System Design
  { keywords: ["architecture", "system design", "database", "tech stack", "infrastructure", "api", "microservice", "schema", "deploy", "scalab", "backend", "frontend"], slugs: ["architect"], weight: 3 },
  // Sales
  { keywords: ["sales", "outreach", "prospect", "cold email", "lead", "pipeline", "crm", "b2b", "decision maker", "icp", "gtm", "go-to-market"], slugs: ["catalyst"], weight: 3 },
  // Health
  { keywords: ["workout", "exercise", "meal plan", "fitness", "health", "diet", "nutrition", "calories", "protein", "gym", "training", "wellness", "routine"], slugs: ["vitalis"], weight: 3 },
  // Strategy
  { keywords: ["strategy", "strategic", "market analysis", "positioning", "roadmap", "competitive", "swot", "business plan", "consulting", "due diligence", "tam", "market size"], slugs: ["strategist"], weight: 3 },

  // Multi-agent combos — tasks that need multiple specialists
  { keywords: ["research and write", "research then write", "find and draft"], slugs: ["scout", "quill"], weight: 5 },
  { keywords: ["analyze and present", "data report", "metrics report", "analyze and summarize"], slugs: ["metric", "quill"], weight: 5 },
  { keywords: ["research competitors and strategy", "competitive analysis"], slugs: ["scout", "strategist"], weight: 5 },
  { keywords: ["blog to podcast", "article to podcast", "convert blog"], slugs: ["scout", "caster"], weight: 5 },
  { keywords: ["find prospects and email", "outreach campaign", "lead generation"], slugs: ["catalyst", "quill"], weight: 5 },
  { keywords: ["market research and plan", "market entry"], slugs: ["scout", "strategist"], weight: 5 },
  { keywords: ["design and document", "architecture document"], slugs: ["architect", "quill"], weight: 5 },
  { keywords: ["financial analysis report", "investment report"], slugs: ["pulse", "quill"], weight: 5 },
  { keywords: ["meal and workout", "fitness plan", "health plan"], slugs: ["vitalis", "atlas"], weight: 5 },
  { keywords: ["trip and budget", "travel budget", "travel plan"], slugs: ["voyager", "pulse"], weight: 5 },
  { keywords: ["scrape and analyze", "web data analysis"], slugs: ["sleuth", "metric"], weight: 5 },
];

export interface AgentSuggestion {
  agent: Agent;
  reason: string;
  score: number;
}

export function suggestAgents(query: string, agents: Agent[]): AgentSuggestion[] {
  if (!query.trim() || query.length < 3) return [];

  const lower = query.toLowerCase();
  const slugScores = new Map<string, { score: number; reason: string }>();

  for (const entry of KEYWORD_MAP) {
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        for (const slug of entry.slugs) {
          const existing = slugScores.get(slug);
          const newScore = entry.weight + keyword.length * 0.1; // longer keyword match = more specific
          if (!existing || newScore > existing.score) {
            slugScores.set(slug, {
              score: newScore,
              reason: getReasonForSlug(slug, keyword),
            });
          }
        }
      }
    }
  }

  // Convert to agent suggestions
  const suggestions: AgentSuggestion[] = [];
  for (const [slug, { score, reason }] of slugScores) {
    const agent = agents.find((a) => a.slug === slug);
    if (agent) {
      suggestions.push({ agent, reason, score });
    }
  }

  // Sort by score descending, limit to 4
  return suggestions.sort((a, b) => b.score - a.score).slice(0, 4);
}

function getReasonForSlug(slug: string, matchedKeyword: string): string {
  const reasons: Record<string, string> = {
    scout: `Can research "${matchedKeyword}" thoroughly`,
    quill: `Can write polished ${matchedKeyword} content`,
    metric: `Can analyze ${matchedKeyword} data`,
    atlas: `Can help ${matchedKeyword} effectively`,
    voyager: `Can plan ${matchedKeyword} in detail`,
    pulse: `Can provide ${matchedKeyword} insights`,
    sleuth: `Can ${matchedKeyword} from the web`,
    caster: `Can ${matchedKeyword} between formats`,
    architect: `Can design ${matchedKeyword} systems`,
    catalyst: `Can handle ${matchedKeyword} outreach`,
    vitalis: `Can create ${matchedKeyword} plans`,
    strategist: `Can develop ${matchedKeyword} strategy`,
  };
  return reasons[slug] || `Best match for "${matchedKeyword}"`;
}
