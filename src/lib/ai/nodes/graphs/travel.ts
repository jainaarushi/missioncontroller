import type { PipelineGraph } from "../types";

export const TRAVEL_GRAPHS: Record<string, PipelineGraph> = {
  "flight-deal-hunter": {
    nodes: [
      { id: "input", type: "input", label: "Your Trip", description: "Understanding your travel plans", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_flights", type: "search", label: "Search Flights", description: "Searching for the best flight deals", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`cheap flights ${ctx.latestText.slice(0, 50)}`, `flight deals ${ctx.latestText.slice(0, 40)} ${ctx.today.split(",").pop()?.trim()}`, `best time book flights ${ctx.latestText.slice(0, 30)}`], maxResults: 8 } },
      { id: "scrape", type: "scrape", label: "Get Deal Details", description: "Extracting flight prices and options", icon: "🌐", color: "#10b981", inputs: ["search_flights"], config: { type: "scrape", urlsFrom: "search_flights", maxUrls: 4 } },
      { id: "analyze", type: "ai", label: "Find Best Deals", description: "Analyzing and ranking the best flight options", icon: "✈️", color: "#2dd4bf", inputs: ["input", "search_flights", "scrape"], config: { type: "ai", specialistSlug: "travel-planner", userPromptTemplate: "Find the best flight deals for: {{input}}\n\nSearch results:\n{{search_flights}}\n\nDetails:\n{{scrape}}\n\nProvide:\n1. Best Flights Table (Airline | Route | Dates | Price | Stops | Duration | Score)\n2. Cheapest option\n3. Best value option (price vs comfort)\n4. Booking tips and tricks\n5. Best day to fly\n6. Alternative airport options\n7. Error fare and deal alerts to set up\n8. Credit card points/miles strategy\n9. Price prediction (wait or book now)", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "Web Scrape", icon: "🌐", color: "#10b981" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "wedding-planner": {
    nodes: [
      { id: "input", type: "input", label: "Wedding Details", description: "Understanding your wedding vision", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_venues", type: "search", label: "Research Venues & Vendors", description: "Finding venues and vendors", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`wedding venues ${ctx.latestText.slice(0, 50)}`, `wedding planning checklist ${ctx.today.split(",").pop()?.trim()}`, `affordable wedding tips ${ctx.latestText.slice(0, 30)}`], maxResults: 6 } },
      { id: "plan", type: "ai", label: "Build Wedding Plan", description: "Creating your complete wedding planning guide", icon: "💒", color: "#f472b6", inputs: ["input", "search_venues"], config: { type: "ai", specialistSlug: "project-planner", userPromptTemplate: "Create a wedding plan for: {{input}}\n\nVenue research:\n{{search_venues}}\n\nProvide:\n1. Wedding Timeline (12 months out → wedding day)\n2. Budget Breakdown Table (Category | Estimated Cost | % of Budget | Priority)\n3. Venue recommendations\n4. Vendor checklist (with hiring timeline)\n5. Guest list management strategy\n6. Day-of timeline\n7. Money-saving tips\n8. Common mistakes to avoid\n9. Emergency kit checklist", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "party-planner": {
    nodes: [
      { id: "input", type: "input", label: "Party Details", description: "Understanding your event vision", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_ideas", type: "search", label: "Find Ideas", description: "Searching for party ideas and inspiration", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`${ctx.latestText.slice(0, 50)} party ideas`, `party planning checklist ${ctx.latestText.slice(0, 30)}`, `party supplies venues ${ctx.latestText.slice(0, 30)}`], maxResults: 5 } },
      { id: "plan", type: "ai", label: "Build Party Plan", description: "Creating your complete party plan", icon: "🎉", color: "#2dd4bf", inputs: ["input", "search_ideas"], config: { type: "ai", specialistSlug: "project-planner", userPromptTemplate: "Plan a party for: {{input}}\n\nIdeas:\n{{search_ideas}}\n\nProvide:\n1. Theme and decor concept\n2. Budget Breakdown Table (Item | Cost | Where to Get)\n3. Guest list and invitation strategy\n4. Food and drink menu\n5. Activities and entertainment\n6. Timeline (prep day → party day)\n7. Supplies checklist\n8. Playlist suggestions\n9. Party favors\n10. Backup plans (weather, no-shows)", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "visa-advisor": {
    nodes: [
      { id: "input", type: "input", label: "Your Travel Plans", description: "Understanding your visa requirements", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_requirements", type: "search", label: "Research Requirements", description: "Finding visa requirements and processes", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`${ctx.latestText.slice(0, 50)} visa requirements ${ctx.today.split(",").pop()?.trim()}`, `${ctx.latestText.slice(0, 40)} visa application process`, `visa processing time ${ctx.latestText.slice(0, 30)}`], maxResults: 6 } },
      { id: "guide", type: "ai", label: "Build Visa Guide", description: "Creating your visa application guide", icon: "🛂", color: "#2dd4bf", inputs: ["input", "search_requirements"], config: { type: "ai", specialistSlug: "travel-planner", userPromptTemplate: "Create a visa guide for: {{input}}\n\nRequirements:\n{{search_requirements}}\n\nProvide:\n1. Visa Type Assessment\n2. Requirements Checklist\n3. Step-by-step application process\n4. Required documents list\n5. Processing times and fees\n6. Common rejection reasons and how to avoid\n7. Interview preparation (if applicable)\n8. Expedited processing options\n9. Travel insurance requirements\n10. Emergency contacts at embassies", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "road-trip-planner": {
    nodes: [
      { id: "input", type: "input", label: "Trip Details", description: "Understanding your road trip plans", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_route", type: "search", label: "Research Route", description: "Finding the best routes and stops", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`road trip ${ctx.latestText.slice(0, 50)} best route`, `${ctx.latestText.slice(0, 40)} stops attractions`, `road trip tips ${ctx.latestText.slice(0, 30)}`], maxResults: 6 } },
      { id: "plan", type: "ai", label: "Build Trip Itinerary", description: "Creating your road trip itinerary", icon: "🗺️", color: "#2dd4bf", inputs: ["input", "search_route"], config: { type: "ai", specialistSlug: "travel-planner", userPromptTemplate: "Plan a road trip for: {{input}}\n\nRoute research:\n{{search_route}}\n\nProvide:\n1. Day-by-Day Itinerary (Day | Drive Time | Stops | Overnight | Highlight)\n2. Route overview with key highways\n3. Must-see attractions\n4. Restaurant and food recommendations\n5. Accommodation suggestions (budget range)\n6. Gas stop planning\n7. Packing checklist\n8. Emergency kit\n9. Budget estimate\n10. Playlist and podcast suggestions", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

};
