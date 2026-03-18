import type { PipelineGraph } from "../types";

export const LEGAL_GRAPHS: Record<string, PipelineGraph> = {
  "dispute-fighter": {
    nodes: [
      { id: "input", type: "input", label: "Your Dispute", description: "Understanding your dispute details", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_rights", type: "search", label: "Research Your Rights", description: "Finding relevant consumer protection laws", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`consumer rights ${ctx.latestText.slice(0, 50)} dispute`, `how to file complaint ${ctx.latestText.slice(0, 40)}`, `consumer protection laws ${ctx.latestText.slice(0, 30)}`], maxResults: 6 } },
      { id: "strategy", type: "ai", label: "Build Dispute Strategy", description: "Creating your dispute resolution plan", icon: "⚖️", color: "#c084fc", inputs: ["input", "search_rights"], config: { type: "ai", specialistSlug: "legal-advisor", userPromptTemplate: "Create a dispute resolution strategy for: {{input}}\n\nRights research:\n{{search_rights}}\n\nProvide:\n1. Your Rights Summary (applicable laws/regulations)\n2. Dispute letter template (formal, citing specific laws)\n3. Escalation path (company → regulatory body → small claims)\n4. Evidence to gather\n5. Timeline and deadlines\n6. Regulatory agencies to contact\n7. Social media leverage strategy\n8. Expected outcomes and remedies", tools: ["web-search"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "benefits-finder": {
    nodes: [
      { id: "input", type: "input", label: "Your Situation", description: "Understanding your eligibility", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_benefits", type: "search", label: "Find Benefits", description: "Searching for available government and private benefits", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`government benefits eligibility ${ctx.latestText.slice(0, 50)}`, `assistance programs ${ctx.latestText.slice(0, 40)} apply`, `free resources ${ctx.latestText.slice(0, 30)}`], maxResults: 6 } },
      { id: "analyze", type: "ai", label: "Match Benefits", description: "Matching you with eligible programs", icon: "🎯", color: "#4ade80", inputs: ["input", "search_benefits"], config: { type: "ai", specialistSlug: "legal-advisor", userPromptTemplate: "Find all applicable benefits for: {{input}}\n\nBenefits research:\n{{search_benefits}}\n\nProvide:\n1. Eligible Programs Table (Program | Type | Estimated Value | How to Apply | Deadline)\n2. Federal programs\n3. State/local programs\n4. Private assistance programs\n5. Application checklist for each\n6. Documents needed\n7. Total potential value\n8. Application priority order (easiest wins first)", tools: ["web-search"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

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

  "immigration-helper": {
    nodes: [
      { id: "input", type: "input", label: "Your Immigration Case", description: "Understanding your immigration situation", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_info", type: "search", label: "Research Requirements", description: "Finding current immigration requirements and timelines", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`${ctx.latestText.slice(0, 50)} immigration requirements ${ctx.today.split(",").pop()?.trim()}`, `${ctx.latestText.slice(0, 40)} visa processing time`, `USCIS ${ctx.latestText.slice(0, 30)} eligibility`], maxResults: 6 } },
      { id: "guide", type: "ai", label: "Build Immigration Guide", description: "Creating your step-by-step immigration plan", icon: "🗺️", color: "#4ade80", inputs: ["input", "search_info"], config: { type: "ai", specialistSlug: "legal-advisor", userPromptTemplate: "Create an immigration guide for: {{input}}\n\nResearch:\n{{search_info}}\n\nProvide:\n1. Eligibility Assessment\n2. Recommended visa/status pathway\n3. Required documents checklist\n4. Step-by-step filing guide\n5. Current processing times\n6. Cost breakdown (filing fees, attorney fees)\n7. Common mistakes and how to avoid them\n8. Timeline with milestones\n9. When to hire an attorney vs self-file\n10. Disclaimer: not legal advice, consult an immigration attorney", tools: ["web-search"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "small-claims-advisor": {
    nodes: [
      { id: "input", type: "input", label: "Your Case", description: "Understanding your small claims case", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_process", type: "search", label: "Research Court Process", description: "Finding small claims court procedures", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`small claims court process ${ctx.latestText.slice(0, 40)}`, `how to file small claims court ${ctx.today.split(",").pop()?.trim()}`, `small claims court limits fees`], maxResults: 5 } },
      { id: "prepare", type: "ai", label: "Prepare Your Case", description: "Building your small claims court strategy", icon: "⚖️", color: "#c084fc", inputs: ["input", "search_process"], config: { type: "ai", specialistSlug: "legal-advisor", userPromptTemplate: "Prepare a small claims court case for: {{input}}\n\nCourt process research:\n{{search_process}}\n\nProvide:\n1. Case Strength Assessment (1-10)\n2. Claim amount and court limits\n3. Filing instructions step-by-step\n4. Evidence to gather (with checklist)\n5. Demand letter template (pre-filing)\n6. Court presentation outline\n7. What to say and what NOT to say\n8. Filing fees and expected timeline\n9. Settlement negotiation strategy\n10. Disclaimer: not legal advice", tools: ["web-search"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "tenant-rights": {
    nodes: [
      { id: "input", type: "input", label: "Your Tenant Issue", description: "Understanding your rental situation", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_rights", type: "search", label: "Research Tenant Laws", description: "Finding relevant tenant protection laws", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`tenant rights ${ctx.latestText.slice(0, 50)}`, `landlord tenant law ${ctx.latestText.slice(0, 40)}`, `renter protection ${ctx.today.split(",").pop()?.trim()}`], maxResults: 6 } },
      { id: "advise", type: "ai", label: "Your Rights Report", description: "Creating your tenant rights action plan", icon: "🏠", color: "#fb923c", inputs: ["input", "search_rights"], config: { type: "ai", specialistSlug: "legal-advisor", userPromptTemplate: "Analyze tenant rights for: {{input}}\n\nLaw research:\n{{search_rights}}\n\nProvide:\n1. Your Rights Summary\n2. Applicable laws and protections\n3. Landlord obligations\n4. Action plan with templates (letters, complaints)\n5. Regulatory bodies to contact\n6. Documentation strategy\n7. Escalation path\n8. Disclaimer: not legal advice", tools: ["web-search"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "will-planner": {
    nodes: [
      { id: "input", type: "input", label: "Your Estate Info", description: "Understanding your estate planning needs", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_info", type: "search", label: "Research Requirements", description: "Finding estate planning requirements for your state", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`will requirements ${ctx.latestText.slice(0, 40)}`, `estate planning checklist ${ctx.today.split(",").pop()?.trim()}`, `basic will template requirements`], maxResults: 5 } },
      { id: "plan", type: "ai", label: "Create Estate Plan", description: "Building your estate planning guide", icon: "📋", color: "#4ade80", inputs: ["input", "search_info"], config: { type: "ai", specialistSlug: "legal-advisor", userPromptTemplate: "Create an estate planning guide for: {{input}}\n\nResearch:\n{{search_info}}\n\nProvide:\n1. Estate Planning Checklist\n2. Will structure and key provisions\n3. Beneficiary designations review\n4. Power of Attorney considerations\n5. Healthcare directive\n6. Asset inventory template\n7. Digital estate plan\n8. When to use a trust vs will\n9. Cost estimates for professional help\n10. Disclaimer: consult an estate planning attorney", tools: ["web-search"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "traffic-ticket": {
    nodes: [
      { id: "input", type: "input", label: "Your Ticket", description: "Reviewing your traffic ticket details", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_options", type: "search", label: "Research Options", description: "Finding how to fight or reduce your ticket", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`fight traffic ticket ${ctx.latestText.slice(0, 40)}`, `traffic court tips reduce fine`, `traffic violation defense strategies`], maxResults: 5 } },
      { id: "strategy", type: "ai", label: "Build Defense", description: "Creating your traffic ticket defense strategy", icon: "🚗", color: "#f97316", inputs: ["input", "search_options"], config: { type: "ai", specialistSlug: "legal-advisor", userPromptTemplate: "Create a traffic ticket defense strategy for: {{input}}\n\nResearch:\n{{search_options}}\n\nProvide:\n1. Ticket Analysis (violation, fine, points)\n2. Defense options ranked by success likelihood\n3. Court hearing preparation\n4. What to say to the judge\n5. Evidence to bring\n6. Traffic school option analysis\n7. Insurance impact assessment\n8. Cost-benefit: fight vs pay\n9. Letter template if contesting by mail\n10. Disclaimer: not legal advice", tools: ["web-search"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },
};
