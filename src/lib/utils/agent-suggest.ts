import type { Agent } from "@/lib/types/agent";

// Keyword → agent slug mapping with relevance weights
const KEYWORD_MAP: { keywords: string[]; slugs: string[]; weight: number }[] = [
  // Research
  { keywords: ["research", "find", "discover", "investigate", "look up", "search for", "compare", "report on", "deep dive"], slugs: ["deep-research"], weight: 3 },
  { keywords: ["fact-check", "verify", "is it true", "claims", "misinformation", "debunk"], slugs: ["fact-checker"], weight: 3 },
  { keywords: ["startup", "funding", "series a", "vc", "venture", "emerging", "trend"], slugs: ["startup-trends"], weight: 3 },
  { keywords: ["academic", "literature review", "paper", "journal", "citation", "thesis", "scholarly"], slugs: ["academic-researcher"], weight: 3 },

  // Writing & Content
  { keywords: ["write", "draft", "compose", "blog", "article", "newsletter", "copy", "content", "post", "announcement", "press release", "case study"], slugs: ["content-creator"], weight: 3 },
  { keywords: ["documentation", "readme", "api docs", "tutorial", "guide", "technical writing", "docs"], slugs: ["technical-writer"], weight: 3 },
  { keywords: ["edit", "proofread", "grammar", "revise", "polish", "review my writing", "rewrite"], slugs: ["editor"], weight: 3 },
  { keywords: ["convert", "transform", "podcast", "thread", "repurpose", "social media", "turn into", "reformat", "blog to"], slugs: ["blog-to-podcast"], weight: 3 },
  { keywords: ["email", "cold email", "follow-up", "reply", "respond", "outreach email"], slugs: ["email-drafter"], weight: 3 },

  // Data & Analytics
  { keywords: ["analyze", "data", "metrics", "kpi", "dashboard", "numbers", "trends", "conversion", "analytics", "statistics", "funnel", "performance"], slugs: ["data-analyst"], weight: 3 },
  { keywords: ["chart", "graph", "visualization", "dashboard design", "visual", "diagram", "infographic"], slugs: ["visualization-expert"], weight: 3 },

  // Business & Strategy
  { keywords: ["strategy", "strategic", "market analysis", "positioning", "roadmap", "competitive", "swot", "business plan", "consulting", "tam", "market size", "go-to-market"], slugs: ["strategy-advisor"], weight: 3 },
  { keywords: ["sales", "prospect", "lead", "pipeline", "crm", "b2b", "decision maker", "icp", "gtm"], slugs: ["sales-rep"], weight: 3 },
  { keywords: ["product launch", "launch plan", "release", "go to market", "gtm plan", "launch strategy"], slugs: ["product-launch"], weight: 3 },

  // Finance
  { keywords: ["stock", "invest", "market", "portfolio", "trading", "earnings", "etf", "crypto", "valuation", "bull", "bear"], slugs: ["investment-analyst"], weight: 3 },
  { keywords: ["budget", "savings", "debt", "financial plan", "retirement", "personal finance", "expense"], slugs: ["personal-finance"], weight: 3 },

  // Engineering
  { keywords: ["architecture", "system design", "database", "tech stack", "infrastructure", "api", "microservice", "schema", "deploy", "scalab", "backend"], slugs: ["system-architect"], weight: 3 },
  { keywords: ["python", "script", "pip", "pandas", "numpy", "django", "flask", "pytest"], slugs: ["python-expert"], weight: 3 },
  { keywords: ["react", "next.js", "node", "frontend", "fullstack", "web app", "tailwind", "typescript", "javascript"], slugs: ["fullstack-developer"], weight: 3 },
  { keywords: ["code review", "pull request", "pr review", "review my code", "security review"], slugs: ["code-reviewer"], weight: 3 },
  { keywords: ["bug", "debug", "error", "fix", "crash", "stack trace", "not working", "broken"], slugs: ["debugger"], weight: 3 },

  // Planning & Productivity
  { keywords: ["project plan", "timeline", "milestone", "gantt", "work breakdown", "wbs", "project scope"], slugs: ["project-planner"], weight: 3 },
  { keywords: ["sprint", "agile", "scrum", "story points", "backlog", "sprint planning", "velocity"], slugs: ["sprint-planner"], weight: 3 },
  { keywords: ["meeting notes", "meeting summary", "action items", "minutes", "recap"], slugs: ["meeting-notes"], weight: 3 },
  { keywords: ["decide", "decision", "pros and cons", "should i", "which one", "compare options", "trade-off"], slugs: ["decision-helper"], weight: 3 },
  { keywords: ["plan", "organize", "brainstorm", "summarize", "summary", "list", "outline", "ideas", "prepare"], slugs: ["general-assistant"], weight: 2 },

  // Health & Lifestyle
  { keywords: ["workout", "exercise", "fitness", "gym", "training", "muscle", "cardio", "strength"], slugs: ["fitness-coach"], weight: 3 },
  { keywords: ["meal plan", "recipe", "cook", "dinner", "breakfast", "lunch", "grocery", "diet", "nutrition", "calories"], slugs: ["recipe-planner"], weight: 3 },
  { keywords: ["stress", "anxiety", "mindful", "meditation", "mental health", "wellbeing", "journaling", "calm", "breathe"], slugs: ["mental-wellbeing"], weight: 3 },

  // Travel & Home
  { keywords: ["travel", "trip", "itinerary", "flight", "hotel", "vacation", "destination", "booking", "tour"], slugs: ["travel-planner"], weight: 3 },
  { keywords: ["renovate", "home improvement", "remodel", "kitchen", "bathroom", "contractor", "diy", "interior"], slugs: ["home-renovation"], weight: 3 },

  // Design
  { keywords: ["ux", "user experience", "wireframe", "prototype", "user flow", "persona", "usability", "ui design"], slugs: ["ux-designer"], weight: 3 },

  // Media
  { keywords: ["news", "journalist", "article", "reporting", "interview", "story", "press"], slugs: ["journalist"], weight: 3 },
  { keywords: ["speech", "presentation", "pitch", "public speaking", "keynote", "toast", "talk"], slugs: ["speech-trainer"], weight: 3 },

  // Specialized
  { keywords: ["support", "customer", "helpdesk", "complaint", "ticket", "troubleshoot", "faq"], slugs: ["customer-support"], weight: 3 },
  { keywords: ["web scrape", "extract data", "monitor website", "competitor pricing", "web intelligence", "crawl"], slugs: ["web-intel"], weight: 3 },

  // Fun & Viral
  { keywords: ["roast", "roast me", "burn", "comedy", "savage", "funny"], slugs: ["roast-master"], weight: 4 },
  { keywords: ["dream", "dreamt", "nightmare", "sleep", "subconscious", "dream meaning"], slugs: ["dream-interpreter"], weight: 4 },
  { keywords: ["startup idea", "business idea", "app idea", "side project", "saas idea"], slugs: ["startup-idea-gen"], weight: 4 },
  { keywords: ["villain", "supervillain", "origin story", "evil", "backstory"], slugs: ["villain-origin"], weight: 4 },
  { keywords: ["dating", "dating profile", "tinder", "bumble", "hinge", "bio", "swipe"], slugs: ["dating-profile"], weight: 4 },
  { keywords: ["rap", "bars", "freestyle", "rhyme", "verse", "hip hop", "diss"], slugs: ["rap-battle"], weight: 4 },
  { keywords: ["bedtime story", "kids story", "fairy tale", "children", "bedtime"], slugs: ["bedtime-story"], weight: 4 },
  { keywords: ["meme", "caption", "funny text", "meme text", "viral"], slugs: ["meme-caption"], weight: 4 },
  { keywords: ["apology", "sorry", "apologize", "make up", "forgive"], slugs: ["apology-writer"], weight: 4 },
  { keywords: ["excuse", "skip", "get out of", "avoid", "can't make it"], slugs: ["excuse-generator"], weight: 4 },
  { keywords: ["fortune", "predict", "horoscope", "astrology", "zodiac", "future", "palm reading"], slugs: ["fortune-teller"], weight: 4 },
  { keywords: ["alien", "aliens", "earth", "human behavior", "anthropology", "field report"], slugs: ["alien-anthropologist"], weight: 4 },
  { keywords: ["song", "lyrics", "write a song", "chorus", "verse", "music"], slugs: ["song-lyrics"], weight: 4 },
  { keywords: ["toxic trait", "personality", "red flag", "toxic", "self-aware"], slugs: ["toxic-trait"], weight: 4 },
  { keywords: ["cover letter", "job application", "apply", "hiring manager", "resume"], slugs: ["cover-letter"], weight: 4 },
  { keywords: ["movie", "film", "plot", "screenplay", "movie idea", "script"], slugs: ["movie-plot"], weight: 4 },
  { keywords: ["linkedin", "linkedin post", "thought leader", "professional post"], slugs: ["linkedin-post"], weight: 4 },
  { keywords: ["future", "2050", "time travel", "future advice", "hindsight"], slugs: ["future-coach"], weight: 4 },
  { keywords: ["debate", "argue", "both sides", "argument", "controversial", "opinion"], slugs: ["debate-champion"], weight: 4 },
  { keywords: ["baby name", "name", "naming", "baby", "expecting", "pregnant"], slugs: ["baby-name"], weight: 4 },

  // Multi-agent combos
  { keywords: ["research and write", "research then write", "find and draft"], slugs: ["deep-research", "content-creator"], weight: 5 },
  { keywords: ["analyze and present", "data report", "metrics report"], slugs: ["data-analyst", "content-creator"], weight: 5 },
  { keywords: ["research competitors and strategy", "competitive analysis"], slugs: ["deep-research", "strategy-advisor"], weight: 5 },
  { keywords: ["find prospects and email", "outreach campaign", "lead generation"], slugs: ["sales-rep", "email-drafter"], weight: 5 },
  { keywords: ["design and document", "architecture document"], slugs: ["system-architect", "technical-writer"], weight: 5 },
  { keywords: ["meal and workout", "fitness plan", "health plan"], slugs: ["fitness-coach", "recipe-planner"], weight: 5 },
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
          const newScore = entry.weight + keyword.length * 0.1;
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

  // Also do fuzzy matching against agent name and description
  if (slugScores.size === 0) {
    for (const agent of agents) {
      const name = agent.name.toLowerCase();
      const desc = (agent.description || "").toLowerCase();
      if (name.includes(lower) || lower.includes(name) || desc.includes(lower)) {
        slugScores.set(agent.slug, {
          score: 2,
          reason: `Matches "${agent.name}"`,
        });
      }
    }
  }

  const suggestions: AgentSuggestion[] = [];
  for (const [slug, { score, reason }] of slugScores) {
    const agent = agents.find((a) => a.slug === slug);
    if (agent) {
      suggestions.push({ agent, reason, score });
    }
  }

  return suggestions.sort((a, b) => b.score - a.score).slice(0, 4);
}

function getReasonForSlug(slug: string, matchedKeyword: string): string {
  const reasons: Record<string, string> = {
    "deep-research": `Can research "${matchedKeyword}" thoroughly`,
    "fact-checker": `Can verify "${matchedKeyword}" claims`,
    "startup-trends": `Can analyze "${matchedKeyword}" trends`,
    "academic-researcher": `Can review "${matchedKeyword}" literature`,
    "content-creator": `Can write polished ${matchedKeyword} content`,
    "technical-writer": `Can create ${matchedKeyword} documentation`,
    "editor": `Can ${matchedKeyword} your content`,
    "blog-to-podcast": `Can ${matchedKeyword} between formats`,
    "email-drafter": `Can draft professional ${matchedKeyword}`,
    "data-analyst": `Can analyze ${matchedKeyword} data`,
    "visualization-expert": `Can create ${matchedKeyword} visualizations`,
    "strategy-advisor": `Can develop ${matchedKeyword} strategy`,
    "sales-rep": `Can handle ${matchedKeyword} outreach`,
    "product-launch": `Can plan ${matchedKeyword} launch`,
    "investment-analyst": `Can provide ${matchedKeyword} insights`,
    "personal-finance": `Can help with ${matchedKeyword} planning`,
    "system-architect": `Can design ${matchedKeyword} systems`,
    "python-expert": `Can write ${matchedKeyword} code`,
    "fullstack-developer": `Can build ${matchedKeyword} apps`,
    "code-reviewer": `Can ${matchedKeyword} thoroughly`,
    "debugger": `Can fix ${matchedKeyword} issues`,
    "project-planner": `Can plan ${matchedKeyword} projects`,
    "sprint-planner": `Can manage ${matchedKeyword} sprints`,
    "meeting-notes": `Can summarize ${matchedKeyword}`,
    "decision-helper": `Can help ${matchedKeyword} clearly`,
    "fitness-coach": `Can create ${matchedKeyword} plans`,
    "recipe-planner": `Can plan ${matchedKeyword} meals`,
    "mental-wellbeing": `Can help with ${matchedKeyword}`,
    "travel-planner": `Can plan ${matchedKeyword} in detail`,
    "home-renovation": `Can plan ${matchedKeyword} projects`,
    "ux-designer": `Can design ${matchedKeyword} experiences`,
    "journalist": `Can write ${matchedKeyword} articles`,
    "speech-trainer": `Can prepare ${matchedKeyword} delivery`,
    "customer-support": `Can handle ${matchedKeyword} issues`,
    "web-intel": `Can ${matchedKeyword} from the web`,
    "general-assistant": `Can help with ${matchedKeyword}`,
    "roast-master": `Can roast based on "${matchedKeyword}"`,
    "dream-interpreter": `Can interpret "${matchedKeyword}" symbolism`,
    "startup-idea-gen": `Can generate ${matchedKeyword} concepts`,
    "villain-origin": `Can create "${matchedKeyword}" backstory`,
    "dating-profile": `Can write killer ${matchedKeyword} bios`,
    "rap-battle": `Can drop ${matchedKeyword} bars`,
    "bedtime-story": `Can create magical ${matchedKeyword}`,
    "meme-caption": `Can write ${matchedKeyword} captions`,
    "apology-writer": `Can craft the perfect ${matchedKeyword}`,
    "excuse-generator": `Can create believable ${matchedKeyword}`,
    "fortune-teller": `Can read your ${matchedKeyword}`,
    "alien-anthropologist": `Can analyze "${matchedKeyword}" from space`,
    "song-lyrics": `Can write ${matchedKeyword} in any genre`,
    "toxic-trait": `Can analyze "${matchedKeyword}" traits`,
    "cover-letter": `Can write standout ${matchedKeyword}`,
    "movie-plot": `Can create ${matchedKeyword} plots`,
    "linkedin-post": `Can write viral ${matchedKeyword}`,
    "future-coach": `Can give ${matchedKeyword} advice`,
    "debate-champion": `Can ${matchedKeyword} both sides`,
    "baby-name": `Can suggest perfect ${matchedKeyword}`,
  };
  return reasons[slug] || `Best match for "${matchedKeyword}"`;
}
