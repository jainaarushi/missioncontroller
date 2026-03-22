import type { PipelineGraph } from "../types";

export const LEGAL_GRAPHS: Record<string, PipelineGraph> = {
  "lease-reviewer": {
    nodes: [
      { id: "input", type: "input", label: "Your Lease", description: "Reviewing your lease agreement", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_laws", type: "search", label: "Research Tenant Laws", description: "Finding relevant tenant protection laws", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`tenant rights lease review ${ctx.latestText.slice(0, 40)}`, `illegal lease clauses ${ctx.today.split(",").pop()?.trim()}`, `standard lease terms rental agreement`], maxResults: 5 } },
      { id: "review", type: "ai", label: "Analyze Lease", description: "Identifying red flags and negotiation points", icon: "⚖️", color: "#c084fc", inputs: ["input", "search_laws"], config: { type: "ai", specialistSlug: "legal-advisor", userPromptTemplate: "Review this lease agreement: {{input}}\n\nTenant law research:\n{{search_laws}}\n\nProvide:\n1. Lease Summary (key terms at a glance)\n2. Red Flags Table (Clause | Issue | Risk Level | Recommendation)\n3. Potentially illegal or unenforceable clauses\n4. Missing protections\n5. Negotiation points (what to push back on)\n6. Counter-proposal language for each issue\n7. Move-in/move-out checklist\n8. Disclaimer: not legal advice", tools: ["web-search"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

};
