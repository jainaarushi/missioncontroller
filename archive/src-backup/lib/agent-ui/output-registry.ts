// Maps agent slugs to custom output renderer component names
// Agents not listed here use the default markdown renderer

export const AGENT_OUTPUT_RENDERERS: Record<string, string> = {
  "investment-analyst": "FinanceOutput",
  "data-analyst": "DataOutput",
  "deep-research": "ResearchOutput",
  "travel-planner": "TravelOutput",
  "competitor-intel": "ComparisonOutput",
  "fitness-coach": "FitnessOutput",
  "sales-rep": "SalesOutput",
  "journalist": "ArticleOutput",
  "content-creator": "ArticleOutput",
  "technical-writer": "ArticleOutput",
  "blog-to-podcast": "ArticleOutput",
};
