import type { PipelineGraph } from "../types";

export const FREELANCE_GRAPHS: Record<string, PipelineGraph> = {
  "freelance-bid-writer": {
    nodes: [
      { id: "input", type: "input", label: "Project Details", description: "Understanding the project you're bidding on", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_rates", type: "search", label: "Research Market Rates", description: "Finding competitive freelance rates", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`freelance rates ${ctx.latestText.slice(0, 50)}`, `upwork proposal tips winning bid`, `freelance pricing ${ctx.latestText.slice(0, 30)}`], maxResults: 5 } },
      { id: "write", type: "ai", label: "Write Winning Bid", description: "Crafting your proposal", icon: "✍️", color: "#fb923c", inputs: ["input", "search_rates"], config: { type: "ai", specialistSlug: "proposal-writer", userPromptTemplate: "Write a winning freelance bid for: {{input}}\n\nRate research:\n{{search_rates}}\n\nProvide:\n1. Proposal (ready to submit)\n2. Pricing strategy (hourly vs fixed, with justification)\n3. Three pricing tiers (basic/standard/premium)\n4. Timeline estimate\n5. Portfolio pieces to highlight\n6. Questions to ask the client\n7. Red flags to watch for\n8. Follow-up message template", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "side-hustle-matcher": {
    nodes: [
      { id: "input", type: "input", label: "Your Skills & Time", description: "Understanding your available skills and time", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_hustles", type: "search", label: "Research Opportunities", description: "Finding side hustle opportunities", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`best side hustles ${ctx.latestText.slice(0, 50)} ${ctx.today.split(",").pop()?.trim()}`, `make money online ${ctx.latestText.slice(0, 40)}`, `side income ideas ${ctx.latestText.slice(0, 30)}`], maxResults: 6 } },
      { id: "match", type: "ai", label: "Match & Plan", description: "Matching you with the best opportunities", icon: "💰", color: "#4ade80", inputs: ["input", "search_hustles"], config: { type: "ai", specialistSlug: "strategy-advisor", userPromptTemplate: "Find side hustles for: {{input}}\n\nOpportunities:\n{{search_hustles}}\n\nProvide:\n1. Side Hustle Match Table (Hustle | Earning Potential | Time Needed | Startup Cost | Fit Score)\n2. Top 3 recommendations with detailed plans\n3. Getting started checklist for each\n4. Time management strategy\n5. Tax considerations\n6. Scaling path for each\n7. Tools and platforms needed\n8. Expected first-month earnings", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "contract-reviewer": {
    nodes: [
      { id: "input", type: "input", label: "Your Contract", description: "Reviewing your freelance contract", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_standards", type: "search", label: "Research Standards", description: "Finding standard contract terms", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`freelance contract review checklist`, `standard contract terms ${ctx.latestText.slice(0, 40)}`, `contract red flags freelancers`], maxResults: 5 } },
      { id: "review", type: "ai", label: "Review & Advise", description: "Analyzing contract terms and risks", icon: "⚖️", color: "#c084fc", inputs: ["input", "search_standards"], config: { type: "ai", specialistSlug: "legal-advisor", userPromptTemplate: "Review this contract: {{input}}\n\nStandard terms:\n{{search_standards}}\n\nProvide:\n1. Contract Summary (key terms at a glance)\n2. Risk Assessment Table (Clause | Risk Level | Issue | Recommended Change)\n3. Missing protections\n4. Payment terms analysis\n5. IP and ownership concerns\n6. Non-compete/NDA analysis\n7. Termination clause review\n8. Suggested counter-proposals\n9. Disclaimer: not legal advice", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "invoice-generator": {
    nodes: [
      { id: "input", type: "input", label: "Invoice Details", description: "Understanding your billing details", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_templates", type: "search", label: "Research Best Practices", description: "Finding invoicing best practices", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`freelance invoice best practices`, `invoice template ${ctx.latestText.slice(0, 30)}`, `late payment terms invoice`], maxResults: 4 } },
      { id: "generate", type: "ai", label: "Generate Invoice", description: "Creating your professional invoice", icon: "📄", color: "#fb923c", inputs: ["input", "search_templates"], config: { type: "ai", specialistSlug: "personal-finance", userPromptTemplate: "Generate a professional invoice for: {{input}}\n\nBest practices:\n{{search_templates}}\n\nProvide:\n1. Complete invoice in markdown format\n2. Line items with descriptions\n3. Payment terms recommendation\n4. Late payment policy language\n5. Follow-up email template\n6. Payment reminder schedule\n7. Invoicing tips for getting paid faster\n8. Tax documentation notes", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "client-proposal": {
    nodes: [
      { id: "input", type: "input", label: "Project Scope", description: "Understanding the project and client", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_client", type: "search", label: "Research Client", description: "Learning about the prospective client", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`${ctx.latestText.slice(0, 50)} company about`, `freelance proposal template ${ctx.latestText.slice(0, 30)}`, `winning client proposal tips`], maxResults: 5 } },
      { id: "write", type: "ai", label: "Write Proposal", description: "Creating your client proposal", icon: "📋", color: "#fb923c", inputs: ["input", "search_client"], config: { type: "ai", specialistSlug: "proposal-writer", userPromptTemplate: "Write a client proposal for: {{input}}\n\nClient research:\n{{search_client}}\n\nProvide:\n1. Executive Summary\n2. Understanding of their needs\n3. Proposed solution with deliverables\n4. Project timeline\n5. Three pricing packages (with feature breakdown)\n6. Why you're the right choice\n7. Case studies/past work references\n8. Next steps and CTA\n9. Terms and conditions summary", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "rate-calculator": {
    nodes: [
      { id: "input", type: "input", label: "Your Details", description: "Understanding your freelance situation", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_rates", type: "search", label: "Research Market Rates", description: "Finding competitive rates for your skill set", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`freelance rates ${ctx.latestText.slice(0, 50)} ${ctx.today.split(",").pop()?.trim()}`, `average hourly rate ${ctx.latestText.slice(0, 40)}`, `freelance pricing calculator`], maxResults: 5 } },
      { id: "calculate", type: "ai", label: "Calculate Your Rate", description: "Determining your optimal freelance rate", icon: "🧮", color: "#f97316", inputs: ["input", "search_rates"], config: { type: "ai", specialistSlug: "personal-finance", userPromptTemplate: "Calculate the optimal freelance rate for: {{input}}\n\nMarket rates:\n{{search_rates}}\n\nProvide:\n1. Rate Breakdown (Hourly | Daily | Weekly | Monthly | Project-based)\n2. Cost of living calculation\n3. Tax and benefits buffer (30% rule)\n4. Market rate comparison\n5. Value-based pricing approach\n6. Rate for different client types (startup vs enterprise)\n7. When to raise rates\n8. Package pricing strategy\n9. Retainer model options", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },
};
