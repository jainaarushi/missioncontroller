import type { PipelineGraph } from "../types";

export const HEALTH_GRAPHS: Record<string, PipelineGraph> = {
  "medical-bill-auditor": {
    nodes: [
      { id: "input", type: "input", label: "Your Medical Bill", description: "Reviewing your medical bill details", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_costs", type: "search", label: "Research Fair Prices", description: "Finding fair market prices for procedures", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`fair price ${ctx.latestText.slice(0, 50)} medical procedure`, `medical bill negotiation tips`, `hospital bill errors common overcharges`], maxResults: 6 } },
      { id: "audit", type: "ai", label: "Audit Your Bill", description: "Identifying errors and overcharges", icon: "🔍", color: "#f472b6", inputs: ["input", "search_costs"], config: { type: "ai", specialistSlug: "data-analyst", userPromptTemplate: "Audit this medical bill: {{input}}\n\nFair price research:\n{{search_costs}}\n\nProvide:\n1. Line-by-Line Audit Table (Item | Billed Amount | Fair Price | Flag | Action)\n2. Common billing errors found\n3. Items to dispute\n4. Negotiation script for the billing department\n5. Financial assistance programs\n6. Payment plan negotiation tips\n7. Appeal letter template\n8. Estimated savings after negotiation", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

};
