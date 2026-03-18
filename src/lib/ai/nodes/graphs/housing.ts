import type { PipelineGraph } from "../types";

export const HOUSING_GRAPHS: Record<string, PipelineGraph> = {
  "apartment-scout": {
    nodes: [
      { id: "input", type: "input", label: "Your Preferences", description: "Understanding your housing needs", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_listings", type: "search", label: "Search Listings", description: "Searching apartment listing sites", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`apartments for rent ${ctx.latestText.slice(0, 60)}`, `${ctx.latestText.slice(0, 40)} rental listings`, `best neighborhoods ${ctx.latestText.slice(0, 30)}`], maxResults: 8 } },
      { id: "scrape", type: "scrape", label: "Get Listing Details", description: "Extracting apartment details and prices", icon: "🌐", color: "#10b981", inputs: ["search_listings"], config: { type: "scrape", urlsFrom: "search_listings", maxUrls: 5 } },
      { id: "analyze", type: "ai", label: "Score & Recommend", description: "Ranking apartments by your criteria", icon: "🏠", color: "#fb923c", inputs: ["input", "search_listings", "scrape"], config: { type: "ai", specialistSlug: "data-analyst", userPromptTemplate: "Find the best apartments for: {{input}}\n\nListings found:\n{{search_listings}}\n\nDetails:\n{{scrape}}\n\nProvide:\n1. Top Apartments Table (Name | Location | Price | Beds/Baths | Score | Pros | Cons)\n2. Neighborhood comparison\n3. Commute analysis\n4. Hidden costs to expect\n5. Application tips for top picks\n6. Negotiation leverage points\n7. Red flags to watch for\n8. Viewing checklist", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "Web Scrape", icon: "🌐", color: "#10b981" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "moving-coordinator": {
    nodes: [
      { id: "input", type: "input", label: "Your Move", description: "Understanding your moving details", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_movers", type: "search", label: "Find Movers", description: "Searching for moving companies and costs", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`best moving companies ${ctx.latestText.slice(0, 50)}`, `moving cost calculator ${ctx.latestText.slice(0, 40)}`, `moving checklist tips`], maxResults: 6 } },
      { id: "plan", type: "ai", label: "Build Moving Plan", description: "Creating your complete moving timeline", icon: "📦", color: "#fb923c", inputs: ["input", "search_movers"], config: { type: "ai", specialistSlug: "project-planner", userPromptTemplate: "Create a moving plan for: {{input}}\n\nMover research:\n{{search_movers}}\n\nProvide:\n1. Moving Timeline (8 weeks before → moving day → 1 week after)\n2. Mover Comparison Table (Company | Estimate | Rating | Notes)\n3. Budget breakdown\n4. Packing strategy by room\n5. Address change checklist (all accounts/services)\n6. Utilities setup guide\n7. Cost-saving tips\n8. Day-of moving checklist\n9. First-week essentials box list", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "utility-optimizer": {
    nodes: [
      { id: "input", type: "input", label: "Your Utility Bills", description: "Reviewing your utility costs", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_rates", type: "search", label: "Research Better Rates", description: "Finding competitive utility rates", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`reduce utility bills tips ${ctx.latestText.slice(0, 40)}`, `compare electricity rates ${ctx.latestText.slice(0, 30)}`, `energy saving rebates programs`], maxResults: 5 } },
      { id: "optimize", type: "ai", label: "Optimize Bills", description: "Finding ways to reduce every utility bill", icon: "⚡", color: "#f5a623", inputs: ["input", "search_rates"], config: { type: "ai", specialistSlug: "personal-finance", userPromptTemplate: "Optimize utility bills for: {{input}}\n\nRate research:\n{{search_rates}}\n\nProvide:\n1. Bill Analysis Table (Utility | Current Cost | Average for Area | Savings Opportunity)\n2. Quick wins (same-day changes)\n3. Provider switching recommendations\n4. Energy efficiency upgrades (ROI for each)\n5. Available rebates and programs\n6. Seasonal optimization tips\n7. Smart home recommendations\n8. Estimated monthly savings", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "roommate-matcher": {
    nodes: [
      { id: "input", type: "input", label: "Your Preferences", description: "Understanding your roommate preferences", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_tips", type: "search", label: "Research Best Practices", description: "Finding roommate matching tips", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`roommate compatibility questions checklist`, `roommate agreement template ${ctx.today.split(",").pop()?.trim()}`, `find roommates ${ctx.latestText.slice(0, 30)}`], maxResults: 5 } },
      { id: "guide", type: "ai", label: "Build Matching Guide", description: "Creating your roommate finding strategy", icon: "🤝", color: "#4ade80", inputs: ["input", "search_tips"], config: { type: "ai", specialistSlug: "decision-helper", userPromptTemplate: "Create a roommate matching guide for: {{input}}\n\nResearch:\n{{search_tips}}\n\nProvide:\n1. Your Roommate Profile (for posting)\n2. Compatibility questionnaire (20 key questions)\n3. Red flags to watch for\n4. Where to find roommates (platforms and communities)\n5. Roommate agreement template\n6. Financial arrangement recommendations\n7. Conflict resolution framework\n8. Trial period suggestions", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "home-inspector": {
    nodes: [
      { id: "input", type: "input", label: "Property Details", description: "Understanding the property to inspect", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_issues", type: "search", label: "Research Common Issues", description: "Finding common problems for this property type", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`home inspection checklist ${ctx.latestText.slice(0, 40)}`, `common home problems ${ctx.latestText.slice(0, 30)}`, `home inspection red flags`], maxResults: 5 } },
      { id: "checklist", type: "ai", label: "Build Inspection Guide", description: "Creating your property inspection checklist", icon: "🔍", color: "#fb923c", inputs: ["input", "search_issues"], config: { type: "ai", specialistSlug: "data-analyst", userPromptTemplate: "Create a home inspection guide for: {{input}}\n\nCommon issues:\n{{search_issues}}\n\nProvide:\n1. Room-by-Room Inspection Checklist\n2. Critical Systems Check (electrical, plumbing, HVAC, roof)\n3. Red flags specific to this property type\n4. Questions to ask the seller/landlord\n5. Estimated repair costs for common issues\n6. Negotiation points based on findings\n7. Professional inspections to order\n8. Photo documentation guide", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "renovation-planner": {
    nodes: [
      { id: "input", type: "input", label: "Your Project", description: "Understanding your renovation goals", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_costs", type: "search", label: "Research Costs", description: "Finding typical renovation costs and ROI", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`${ctx.latestText.slice(0, 40)} renovation cost ${ctx.today.split(",").pop()?.trim()}`, `home renovation ROI best value`, `contractor tips ${ctx.latestText.slice(0, 30)}`], maxResults: 5 } },
      { id: "plan", type: "ai", label: "Build Renovation Plan", description: "Creating your renovation timeline and budget", icon: "🏗️", color: "#fb923c", inputs: ["input", "search_costs"], config: { type: "ai", specialistSlug: "project-planner", userPromptTemplate: "Create a renovation plan for: {{input}}\n\nCost research:\n{{search_costs}}\n\nProvide:\n1. Project Scope and Vision\n2. Budget Breakdown Table (Item | DIY Cost | Contractor Cost | ROI)\n3. Timeline with milestones\n4. Permits needed\n5. Contractor vs DIY recommendations\n6. Materials list with estimated costs\n7. Common mistakes to avoid\n8. Contingency budget (15-20% buffer)\n9. Inspection and compliance checklist", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "neighborhood-scout": {
    nodes: [
      { id: "input", type: "input", label: "Your Criteria", description: "Understanding what matters to you", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_areas", type: "search", label: "Research Neighborhoods", description: "Gathering neighborhood data and reviews", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`best neighborhoods ${ctx.latestText.slice(0, 50)}`, `${ctx.latestText.slice(0, 40)} safety walkability schools`, `${ctx.latestText.slice(0, 30)} cost of living comparison`], maxResults: 8 } },
      { id: "scrape", type: "scrape", label: "Get Area Details", description: "Scraping neighborhood reviews and data", icon: "🌐", color: "#10b981", inputs: ["search_areas"], config: { type: "scrape", urlsFrom: "search_areas", maxUrls: 4 } },
      { id: "report", type: "ai", label: "Neighborhood Report", description: "Creating your neighborhood comparison report", icon: "📊", color: "#4ade80", inputs: ["input", "search_areas", "scrape"], config: { type: "ai", specialistSlug: "deep-research", userPromptTemplate: "Create a neighborhood comparison for: {{input}}\n\nResearch:\n{{search_areas}}\n\nDetails:\n{{scrape}}\n\nProvide:\n1. Neighborhood Comparison Table (Area | Safety | Schools | Transit | Cost | Walkability | Score)\n2. Top 3 Recommended Areas (detailed pros/cons)\n3. Cost of living comparison\n4. Commute analysis\n5. School ratings (if applicable)\n6. Lifestyle fit analysis\n7. Future development/trends\n8. Hidden gems and local tips", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "Web Scrape", icon: "🌐", color: "#10b981" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },
};
