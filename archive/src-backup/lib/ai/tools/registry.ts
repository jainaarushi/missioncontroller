// Central registry of all tools available to agents
// Each tool is created at runtime with the user's API keys

export type ToolId =
  | "web-search"      // Tavily (paid) or DuckDuckGo (free fallback)
  | "web-scrape"      // Firecrawl (paid) or basic fetch (free fallback)
  | "finance-data"    // Yahoo Finance (free)
  | "data-query"      // AlaSQL on uploaded data (free)
  | "deep-research"   // Multi-query search (uses web-search under the hood)
  | "calculator"      // Math evaluator (free)
  | "duckduckgo";     // DuckDuckGo search (always free)

// Maps agent slugs to the tool keys they REQUIRE (hard requirement — agent won't run without them)
// With DuckDuckGo fallback, most agents no longer require Tavily
// Only agents that absolutely need premium search quality should be listed here
export const AGENT_REQUIRED_TOOL_KEYS: Record<string, string[]> = {
  // No agents strictly require Tavily anymore — DuckDuckGo is the free fallback
  // Tavily is used when available for better quality, but not required
};

// Maps agent slugs to the tool keys that ENHANCE them (optional — agent works without them but better with them)
export const AGENT_ENHANCED_TOOL_KEYS: Record<string, string[]> = {
  "deep-research": ["tavily"],
  "journalist": ["tavily"],
  "web-intel": ["tavily", "firecrawl"],
  "competitor-intel": ["tavily"],
  "sales-rep": ["tavily"],
  "product-launch": ["tavily"],
  "travel-planner": ["tavily"],
  "legal-advisor": ["tavily"],
  "recruitment-agent": ["tavily"],
  "fact-checker": ["tavily"],
  "startup-trends": ["tavily"],
  "academic-researcher": ["tavily"],
  "strategy-advisor": ["tavily"],
};

export function getRequiredToolKeys(agentSlug: string): string[] {
  return AGENT_REQUIRED_TOOL_KEYS[agentSlug] || [];
}

export function getEnhancedToolKeys(agentSlug: string): string[] {
  return AGENT_ENHANCED_TOOL_KEYS[agentSlug] || [];
}
