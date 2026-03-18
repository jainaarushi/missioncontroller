import type { PipelineGraph } from "../types";

export const SHOPPING_GRAPHS: Record<string, PipelineGraph> = {
  "return-assistant": {
    nodes: [
      { id: "input", type: "input", label: "Your Return", description: "Understanding your return situation", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_policy", type: "search", label: "Research Return Policy", description: "Finding the store's return policy", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`${ctx.latestText.slice(0, 50)} return policy`, `how to return ${ctx.latestText.slice(0, 40)}`, `consumer return rights`], maxResults: 5 } },
      { id: "guide", type: "ai", label: "Build Return Guide", description: "Creating your return strategy", icon: "📦", color: "#c084fc", inputs: ["input", "search_policy"], config: { type: "ai", specialistSlug: "legal-advisor", userPromptTemplate: "Create a return strategy for: {{input}}\n\nPolicy research:\n{{search_policy}}\n\nProvide:\n1. Return eligibility assessment\n2. Step-by-step return instructions\n3. Return method comparison (in-store vs mail)\n4. Script for customer service\n5. Escalation strategy if denied\n6. Credit card chargeback as backup plan\n7. Consumer protection rights\n8. Timeline and deadlines\n9. Return shipping cost tips", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "car-buy-negotiator": {
    nodes: [
      { id: "input", type: "input", label: "Car Details", description: "Understanding the car you want to buy", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_prices", type: "search", label: "Research Fair Price", description: "Finding fair market prices and dealer costs", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`${ctx.latestText.slice(0, 50)} fair price invoice price`, `${ctx.latestText.slice(0, 40)} dealer cost markup`, `car buying negotiation tips ${ctx.today.split(",").pop()?.trim()}`], maxResults: 6 } },
      { id: "scrape", type: "scrape", label: "Get Price Data", description: "Extracting pricing details", icon: "🌐", color: "#10b981", inputs: ["search_prices"], config: { type: "scrape", urlsFrom: "search_prices", maxUrls: 4 } },
      { id: "strategy", type: "ai", label: "Build Negotiation Plan", description: "Creating your car buying strategy", icon: "🚗", color: "#f5a623", inputs: ["input", "search_prices", "scrape"], config: { type: "ai", specialistSlug: "sales-rep", userPromptTemplate: "Create a car buying negotiation strategy for: {{input}}\n\nPrice research:\n{{search_prices}}\n\nDetails:\n{{scrape}}\n\nProvide:\n1. Fair Price Analysis (MSRP | Invoice | Target Price | Walk-away Price)\n2. Negotiation script (word-for-word)\n3. Fees to refuse (dealer add-ons)\n4. Financing vs cash strategy\n5. Trade-in negotiation (negotiate separately)\n6. Best time to buy\n7. Competing dealer leverage\n8. Total cost of ownership analysis\n9. Pre-purchase inspection checklist", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "Web Scrape", icon: "🌐", color: "#10b981" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "warranty-claimer": {
    nodes: [
      { id: "input", type: "input", label: "Your Product Issue", description: "Documenting your warranty claim", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_warranty", type: "search", label: "Research Warranty", description: "Finding warranty terms and claim procedures", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`${ctx.latestText.slice(0, 50)} warranty claim process`, `${ctx.latestText.slice(0, 40)} warranty coverage terms`, `how to make warranty claim`], maxResults: 5 } },
      { id: "claim", type: "ai", label: "Build Claim Strategy", description: "Creating your warranty claim", icon: "📋", color: "#c084fc", inputs: ["input", "search_warranty"], config: { type: "ai", specialistSlug: "legal-advisor", userPromptTemplate: "Build a warranty claim for: {{input}}\n\nWarranty research:\n{{search_warranty}}\n\nProvide:\n1. Warranty coverage assessment\n2. Claim letter template\n3. Required documentation checklist\n4. Step-by-step filing process\n5. Escalation path if denied\n6. Consumer protection rights\n7. Alternative remedies (credit card extended warranty, etc.)\n8. Timeline expectations", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "tech-buyer": {
    nodes: [
      { id: "input", type: "input", label: "What You Need", description: "Understanding your tech requirements", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_reviews", type: "search", label: "Research Reviews", description: "Finding expert reviews and comparisons", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`best ${ctx.latestText.slice(0, 50)} ${ctx.today.split(",").pop()?.trim()} review`, `${ctx.latestText.slice(0, 40)} comparison vs`, `${ctx.latestText.slice(0, 30)} buying guide`], maxResults: 8 } },
      { id: "scrape", type: "scrape", label: "Get Review Details", description: "Extracting detailed specs and reviews", icon: "🌐", color: "#10b981", inputs: ["search_reviews"], config: { type: "scrape", urlsFrom: "search_reviews", maxUrls: 4 } },
      { id: "recommend", type: "ai", label: "Compare & Recommend", description: "Comparing options and picking the best", icon: "💻", color: "#22d3ee", inputs: ["input", "search_reviews", "scrape"], config: { type: "ai", specialistSlug: "deep-research", userPromptTemplate: "Find the best tech purchase for: {{input}}\n\nReviews:\n{{search_reviews}}\n\nDetails:\n{{scrape}}\n\nProvide:\n1. Top Picks Table (Product | Price | Key Specs | Pros | Cons | Score)\n2. Best Overall, Best Value, Best Premium\n3. Spec comparison chart\n4. Real user feedback summary\n5. Price tracking and deal alerts\n6. Accessories to get\n7. When to buy (new model timing)\n8. Where to buy for best price", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "Web Scrape", icon: "🌐", color: "#10b981" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "grocery-optimizer": {
    nodes: [
      { id: "input", type: "input", label: "Your Grocery List", description: "Reviewing your grocery needs", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_deals", type: "search", label: "Find Deals", description: "Searching for grocery deals and coupons", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`grocery deals this week ${ctx.latestText.slice(0, 40)}`, `coupon codes grocery ${ctx.today.split(",").pop()?.trim()}`, `cheapest grocery store comparison`], maxResults: 5 } },
      { id: "optimize", type: "ai", label: "Optimize Shopping", description: "Optimizing your grocery budget", icon: "🛒", color: "#4ade80", inputs: ["input", "search_deals"], config: { type: "ai", specialistSlug: "personal-finance", userPromptTemplate: "Optimize grocery shopping for: {{input}}\n\nDeals found:\n{{search_deals}}\n\nProvide:\n1. Optimized Shopping List (Item | Store | Price | Alternative | Savings)\n2. Store-by-store route (minimize trips)\n3. Generic vs brand recommendations\n4. Seasonal produce picks\n5. Bulk buying recommendations\n6. Coupon and app strategies\n7. Meal planning integration\n8. Estimated total savings vs regular shopping", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "gift-finder": {
    nodes: [
      { id: "input", type: "input", label: "Gift Recipient", description: "Understanding who you're shopping for", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_gifts", type: "search", label: "Search Gift Ideas", description: "Finding trending and unique gift ideas", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`best gift ideas ${ctx.latestText.slice(0, 50)} ${ctx.today.split(",").pop()?.trim()}`, `unique gifts ${ctx.latestText.slice(0, 40)}`, `trending gifts ${ctx.latestText.slice(0, 30)}`], maxResults: 6 } },
      { id: "recommend", type: "ai", label: "Curate Gift List", description: "Creating your personalized gift recommendations", icon: "🎁", color: "#c084fc", inputs: ["input", "search_gifts"], config: { type: "ai", specialistSlug: "content-creator", userPromptTemplate: "Find the perfect gifts for: {{input}}\n\nGift research:\n{{search_gifts}}\n\nProvide:\n1. Top Gift Recommendations Table (Gift | Price | Category | Why They'll Love It | Where to Buy)\n2. Budget categories: Under $25, $25-50, $50-100, $100+\n3. Experience gifts\n4. Personalized gift ideas\n5. Subscription gift options\n6. DIY/homemade alternatives\n7. Last-minute options\n8. Gift wrapping and presentation tips", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },
};
