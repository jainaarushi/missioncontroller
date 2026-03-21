import type { PipelineGraph } from "../types";

export const MONEY_GRAPHS: Record<string, PipelineGraph> = {
  "subscription-killer": {
    nodes: [
      { id: "input", type: "input", label: "Your Subscriptions", description: "Listing your current subscriptions", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_alternatives", type: "search", label: "Find Free Alternatives", description: "Searching for free alternatives to paid services", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`free alternatives to ${ctx.latestText.slice(0, 60)}`, `cancel subscription save money tips`], maxResults: 6 } },
      { id: "analyze", type: "ai", label: "Audit Subscriptions", description: "Analyzing spend and identifying savings", icon: "💸", color: "#4ade80", inputs: ["input", "search_alternatives"], config: { type: "ai", specialistSlug: "personal-finance", userPromptTemplate: "Audit these subscriptions: {{input}}\n\nFree alternatives found:\n{{search_alternatives}}\n\nProvide:\n1. Subscription Audit Table (Service | Monthly Cost | Annual Cost | Usage Level | Verdict: Keep/Cancel/Downgrade)\n2. Total monthly/annual savings possible\n3. Free alternative for each cancellation\n4. Cancellation scripts (what to say to retention teams)\n5. Cancellation links/instructions for each service\n6. Recommended subscription budget\n7. Hidden charges to watch for", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "bill-negotiator": {
    nodes: [
      { id: "input", type: "input", label: "Your Bills", description: "Reviewing your current bills", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_deals", type: "search", label: "Research Current Deals", description: "Finding competitor offers and promotions", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`${ctx.latestText.slice(0, 50)} competitor deals promotions`, `how to negotiate ${ctx.latestText.slice(0, 30)} bill lower price`, `${ctx.latestText.slice(0, 30)} retention offer discount`], maxResults: 6 } },
      { id: "strategy", type: "ai", label: "Build Negotiation Scripts", description: "Creating word-for-word negotiation scripts", icon: "📞", color: "#f5a623", inputs: ["input", "search_deals"], config: { type: "ai", specialistSlug: "sales-rep", userPromptTemplate: "Create bill negotiation scripts for: {{input}}\n\nCompetitor deals:\n{{search_deals}}\n\nFor each bill provide:\n1. Best time to call and department to ask for\n2. Opening script (word-for-word)\n3. Competitor leverage points (specific deals found)\n4. Escalation script if first agent says no\n5. Retention department negotiation script\n6. Expected savings amount\n7. Follow-up strategy\n8. Total estimated annual savings across all bills", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "tax-deduction-finder": {
    nodes: [
      { id: "input", type: "input", label: "Your Tax Situation", description: "Understanding your income and expenses", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_deductions", type: "search", label: "Research Deductions", description: "Finding applicable tax deductions", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`tax deductions ${ctx.latestText.slice(0, 40)} ${ctx.today.split(",").pop()?.trim()}`, `overlooked tax deductions self-employed freelancer`, `tax credits low income families`], maxResults: 6 } },
      { id: "analyze", type: "ai", label: "Find Deductions", description: "Identifying all applicable deductions and credits", icon: "🧮", color: "#f97316", inputs: ["input", "search_deductions"], config: { type: "ai", specialistSlug: "personal-finance", userPromptTemplate: "Find all applicable tax deductions for: {{input}}\n\nResearch:\n{{search_deductions}}\n\nProvide:\n1. Deductions Table (Deduction | Category | Estimated Value | Confidence | Documentation Needed)\n2. Tax credits you may qualify for\n3. Total estimated tax savings\n4. Documents to gather\n5. Common deductions people miss\n6. Quarterly estimated tax adjustments\n7. Disclaimer: consult a CPA for final advice", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "credit-score-coach": {
    nodes: [
      { id: "input", type: "input", label: "Your Credit Info", description: "Reviewing your credit situation", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_tips", type: "search", label: "Research Strategies", description: "Finding latest credit improvement strategies", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`improve credit score fast tips ${ctx.today.split(",").pop()?.trim()}`, `credit score factors ${ctx.latestText.slice(0, 40)}`], maxResults: 5 } },
      { id: "plan", type: "ai", label: "Build Credit Plan", description: "Creating your personalized credit improvement plan", icon: "📈", color: "#4ade80", inputs: ["input", "search_tips"], config: { type: "ai", specialistSlug: "personal-finance", userPromptTemplate: "Create a credit score improvement plan for: {{input}}\n\nStrategies:\n{{search_tips}}\n\nProvide:\n1. Current Score Assessment\n2. Factor-by-Factor Analysis (Payment History, Utilization, Age, Mix, Inquiries)\n3. Quick wins (30 days)\n4. Medium-term strategy (90 days)\n5. Long-term plan (12 months)\n6. Credit card recommendations (if applicable)\n7. Disputes to file (if applicable)\n8. Score projection timeline\n9. Monthly action checklist", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "deal-spotter": {
    nodes: [
      { id: "input", type: "input", label: "What to Find", description: "Understanding what you're looking for", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_products", type: "search", label: "Search Products", description: "Searching for products and reviews", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`best ${ctx.latestText} deals ${ctx.today.split(",").pop()?.trim()}`, `${ctx.latestText} review comparison`, `${ctx.latestText} coupon discount code`], maxResults: 8 } },
      { id: "scrape", type: "scrape", label: "Get Price Details", description: "Extracting prices from retailer sites", icon: "🌐", color: "#10b981", inputs: ["search_products"], config: { type: "scrape", urlsFrom: "search_products", maxUrls: 5 } },
      { id: "analyze", type: "ai", label: "Compare & Recommend", description: "Comparing prices and finding the best deal", icon: "🤖", color: "#f59e0b", inputs: ["search_products", "scrape"], config: { type: "ai", specialistSlug: "data-analyst", userPromptTemplate: "Find the best deals for: {{input}}\n\nSearch results:\n{{search_products}}\n\nPrice details:\n{{scrape}}\n\nProvide:\n1. Deal Comparison Table (Product | Store | Price | Rating | Shipping | Total Cost)\n2. Best Overall Pick (and why)\n3. Best Budget Pick\n4. Active coupon codes found\n5. Price history insights (if available)\n6. When to buy (seasonal pricing tips)\n7. Hidden costs to watch for\n8. Return policy comparison", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "Web Scrape", icon: "🌐", color: "#10b981" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "debt-snowball": {
    nodes: [
      { id: "input", type: "input", label: "Your Debts", description: "Listing all your debts", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_rates", type: "search", label: "Research Rates", description: "Finding current refinancing and consolidation options", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`debt consolidation rates ${ctx.today.split(",").pop()?.trim()}`, `balance transfer credit card 0 APR`, `debt payoff strategies snowball avalanche`], maxResults: 5 } },
      { id: "plan", type: "ai", label: "Build Payoff Plan", description: "Creating your optimized debt payoff plan", icon: "📊", color: "#4ade80", inputs: ["input", "search_rates"], config: { type: "ai", specialistSlug: "personal-finance", userPromptTemplate: "Create a debt payoff plan for: {{input}}\n\nCurrent rates/options:\n{{search_rates}}\n\nProvide:\n1. Debt Summary Table (Creditor | Balance | APR | Min Payment | Payoff Order)\n2. Snowball vs Avalanche comparison (total interest saved)\n3. Recommended strategy with monthly payment schedule\n4. Consolidation/refinancing opportunities\n5. Monthly budget allocation\n6. Milestone celebrations along the way\n7. Debt-free date projection\n8. Total interest savings vs minimum payments", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "budget-builder": {
    nodes: [
      { id: "input", type: "input", label: "Your Finances", description: "Understanding your income and expenses", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_tips", type: "search", label: "Research Budgeting Methods", description: "Finding best budgeting strategies", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`best budgeting method ${ctx.today.split(",").pop()?.trim()}`, `50 30 20 budget rule tips`, `budgeting apps free ${ctx.latestText.slice(0, 30)}`], maxResults: 5 } },
      { id: "build", type: "ai", label: "Build Budget", description: "Creating your personalized budget", icon: "📊", color: "#4ade80", inputs: ["input", "search_tips"], config: { type: "ai", specialistSlug: "personal-finance", userPromptTemplate: "Create a personalized budget for: {{input}}\n\nResearch:\n{{search_tips}}\n\nProvide:\n1. Income Summary\n2. Budget Allocation Table (Category | Budgeted | Recommended % | Notes)\n3. Recommended budgeting method and why\n4. Savings goals and timeline\n5. Emergency fund strategy\n6. Areas to cut spending\n7. App recommendations\n8. Monthly review checklist\n9. Quarterly adjustment plan", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "retirement-planner": {
    nodes: [
      { id: "input", type: "input", label: "Your Retirement Info", description: "Understanding your retirement goals", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_options", type: "search", label: "Research Options", description: "Finding retirement account options and strategies", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`retirement planning strategies ${ctx.today.split(",").pop()?.trim()}`, `401k IRA Roth contribution limits`, `retirement savings calculator`], maxResults: 5 } },
      { id: "plan", type: "ai", label: "Build Retirement Plan", description: "Creating your personalized retirement roadmap", icon: "📈", color: "#4ade80", inputs: ["input", "search_options"], config: { type: "ai", specialistSlug: "investment-analyst", userPromptTemplate: "Create a retirement plan for: {{input}}\n\nOptions research:\n{{search_options}}\n\nProvide:\n1. Current retirement readiness score\n2. Account recommendations (401k, IRA, Roth, HSA) with contribution strategy\n3. Investment allocation by age\n4. Savings trajectory table (Year | Balance | Contribution | Growth)\n5. Gap analysis (current pace vs goal)\n6. Social Security optimization strategy\n7. Retirement income plan\n8. Key milestones and action items", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

};
