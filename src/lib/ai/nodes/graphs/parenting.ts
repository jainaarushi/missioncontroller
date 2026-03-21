import type { PipelineGraph } from "../types";

export const PARENTING_GRAPHS: Record<string, PipelineGraph> = {
  "baby-name-picker": {
    nodes: [
      { id: "input", type: "input", label: "Your Preferences", description: "Understanding your name preferences", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_names", type: "search", label: "Research Names", description: "Searching name trends and meanings", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`baby names ${ctx.latestText.slice(0, 50)} trending ${ctx.today.split(",").pop()?.trim()}`, `baby name meanings ${ctx.latestText.slice(0, 40)}`, `unique baby names popular`], maxResults: 5 } },
      { id: "curate", type: "ai", label: "Curate Name List", description: "Creating your personalized name recommendations", icon: "👶", color: "#a99cf5", inputs: ["input", "search_names"], config: { type: "ai", specialistSlug: "deep-research", userPromptTemplate: "Find baby names for: {{input}}\n\nName research:\n{{search_names}}\n\nProvide:\n1. Top 20 Name Recommendations Table (Name | Origin | Meaning | Popularity Rank | Nickname Options)\n2. Classic names\n3. Unique/uncommon names\n4. Names by origin/culture requested\n5. Sibling name compatibility\n6. Initials check (avoid unfortunate acronyms)\n7. Famous people with each name\n8. Pronunciation guide\n9. Middle name pairings", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "school-chooser": {
    nodes: [
      { id: "input", type: "input", label: "Your Criteria", description: "Understanding your school preferences", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_schools", type: "search", label: "Research Schools", description: "Searching for schools in your area", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`best schools ${ctx.latestText.slice(0, 50)}`, `school ratings reviews ${ctx.latestText.slice(0, 40)}`, `school comparison ${ctx.latestText.slice(0, 30)}`], maxResults: 6 } },
      { id: "scrape", type: "scrape", label: "Get School Details", description: "Extracting school ratings and info", icon: "🌐", color: "#10b981", inputs: ["search_schools"], config: { type: "scrape", urlsFrom: "search_schools", maxUrls: 4 } },
      { id: "compare", type: "ai", label: "Compare Schools", description: "Ranking schools by your criteria", icon: "🏫", color: "#a99cf5", inputs: ["input", "search_schools", "scrape"], config: { type: "ai", specialistSlug: "deep-research", userPromptTemplate: "Compare schools for: {{input}}\n\nResearch:\n{{search_schools}}\n\nDetails:\n{{scrape}}\n\nProvide:\n1. School Comparison Table (School | Rating | Test Scores | Class Size | Programs | Cost | Score)\n2. Top 3 recommendations with detailed reasoning\n3. Pros and cons of each\n4. Application process and deadlines\n5. Questions to ask during tours\n6. Red flags to watch for\n7. After-school program comparison\n8. Parent review summary", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "Web Scrape", icon: "🌐", color: "#10b981" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "college-savings": {
    nodes: [
      { id: "input", type: "input", label: "Your Savings Goals", description: "Understanding your college savings situation", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_options", type: "search", label: "Research 529 Plans", description: "Finding the best college savings options", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`best 529 plans ${ctx.today.split(",").pop()?.trim()}`, `college savings strategies ${ctx.latestText.slice(0, 40)}`, `education savings account comparison`], maxResults: 5 } },
      { id: "plan", type: "ai", label: "Build Savings Plan", description: "Creating your college savings strategy", icon: "🎓", color: "#a99cf5", inputs: ["input", "search_options"], config: { type: "ai", specialistSlug: "investment-analyst", userPromptTemplate: "Create a college savings plan for: {{input}}\n\nOptions:\n{{search_options}}\n\nProvide:\n1. Savings Vehicle Comparison (529 vs ESA vs UTMA vs taxable)\n2. Recommended plan with projected growth\n3. Monthly contribution schedule\n4. State tax benefit analysis\n5. Investment allocation by child age\n6. Financial aid impact assessment\n7. Scholarship strategy to reduce needed savings\n8. Backup plan if funds fall short", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

};
