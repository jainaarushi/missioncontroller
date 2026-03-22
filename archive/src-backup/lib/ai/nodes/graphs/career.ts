import type { PipelineGraph } from "../types";

/** Strip filler words and truncate to make a search-engine-friendly query */
function toSearchQuery(text: string, maxLen = 60): string {
  const stopWords = new Set(["i'm", "im", "i", "am", "a", "an", "the", "with", "and", "or", "for", "in", "at", "of", "to", "my", "have", "has", "been", "being", "was", "were", "is", "are", "that", "this", "it", "its", "on", "by", "as", "so", "but", "do", "does", "did", "will", "would", "could", "should", "can", "may", "about", "very", "really", "just", "also", "looking", "want", "need", "like", "currently", "experience", "years", "year"]);
  const words = text.replace(/[^\w\s/-]/g, " ").split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w.toLowerCase()));
  let query = "";
  for (const w of words) {
    if ((query + " " + w).trim().length > maxLen) break;
    query = (query + " " + w).trim();
  }
  return query || text.slice(0, maxLen).trim();
}

export const CAREER_GRAPHS: Record<string, PipelineGraph> = {
  "job-hunter": {
    nodes: [
      { id: "input", type: "input", label: "Your Job Search", description: "Capturing your job preferences", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_jobs", type: "search", label: "Search Job Boards", description: "Searching across job boards and company sites", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => { const q = toSearchQuery(ctx.latestText); return [`${q} jobs hiring now ${ctx.today.split(",")[0]}`, `${q} remote jobs 2025`, `${q} open positions site:greenhouse.io OR site:lever.co`]; }, maxResults: 8 } },
      { id: "scrape", type: "scrape", label: "Extract Listings", description: "Extracting job details from found pages", icon: "🌐", color: "#10b981", inputs: ["search_jobs"], config: { type: "scrape", urlsFrom: "search_jobs", maxUrls: 5 } },
      { id: "analyze", type: "ai", label: "Evaluate Opportunities", description: "AI analyzing and ranking job opportunities", icon: "🤖", color: "#f59e0b", inputs: ["scrape"], config: { type: "ai", specialistSlug: "recruitment-agent", userPromptTemplate: "Based on the user's job search for \"{{input}}\" and the following real job listings data:\n\n{{search_jobs}}\n\nScraped details:\n{{scrape}}\n\nIMPORTANT: If the search/scrape data above is empty, says \"No search results\", or \"No URLs found\", you MUST use your web_search tool to find real job listings yourself. Search for the user's target role + \"jobs hiring now\". Also use any MCP tools available (e.g., composio_linkedin_search_jobs) to find real job listings.\n\nCreate a comprehensive job search report with:\n1. A table of the top 10 real job opportunities found (Company | Role | Location | Key Requirements | Estimated Salary Range)\n2. For each job, rate the match quality (1-5 stars) based on the search criteria\n3. Key skills mentioned across listings\n4. Salary trends and ranges found\n5. Companies hiring the most\n6. Recommended application strategy\n\nUse ONLY the real data found. If data is limited, note that and supplement with your knowledge of the current job market.", tools: ["web-search", "calculator"] } },
      { id: "format", type: "ai", label: "Build Strategy Report", description: "Creating your personalized job search strategy", icon: "📊", color: "#8b5cf6", inputs: ["analyze"], config: { type: "ai", specialistSlug: "recruitment-agent", userPromptTemplate: "Take this job analysis and create a polished, actionable job search strategy report:\n\n{{analyze}}\n\nFormat as a professional report with:\n- Executive Summary (3 bullet points)\n- Job Opportunities Table (clean markdown table)\n- Market Insights\n- Application Priority List (which to apply to first and why)\n- Resume Keywords to Include\n- Interview Preparation Tips for top companies\n- 30-Day Action Plan", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "Web Scrape", icon: "🌐", color: "#10b981" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "resume-optimizer": {
    nodes: [
      { id: "input", type: "input", label: "Your Resume", description: "Analyzing your current resume", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_trends", type: "search", label: "Research ATS Trends", description: "Researching current ATS and hiring trends", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`resume ATS optimization tips ${ctx.today.split(",").pop()?.trim()}`, `most in-demand skills ${toSearchQuery(ctx.latestText, 50)}`], maxResults: 5 } },
      { id: "ats_scan", type: "ai", label: "ATS Scan", description: "Scanning resume for ATS compatibility", icon: "🔍", color: "#fb923c", inputs: ["input"], config: { type: "ai", userPromptTemplate: "Perform a thorough ATS (Applicant Tracking System) scan of this resume:\n\n{{input}}\n\nAnalyze:\n1. ATS compatibility score (0-100)\n2. Missing keywords for the target industry\n3. Formatting issues that ATS systems struggle with\n4. Section structure analysis\n5. Quantification of achievements (% with numbers vs without)\n6. Action verb usage\n7. Length and density assessment", tools: ["web-search", "calculator"] } },
      { id: "rewrite", type: "ai", label: "Optimize & Rewrite", description: "Rewriting resume sections for maximum impact", icon: "✏️", color: "#22d3ee", inputs: ["ats_scan", "search_trends"], config: { type: "ai", specialistSlug: "recruitment-agent", userPromptTemplate: "Based on this ATS analysis:\n{{ats_scan}}\n\nAnd current trends:\n{{search_trends}}\n\nRewrite and optimize the resume:\n1. Provide the complete optimized resume in markdown\n2. Every bullet point should start with a strong action verb\n3. Include quantified metrics where possible\n4. Add relevant keywords naturally\n5. Optimize section order for the target role\n6. Include a powerful professional summary\n7. Score the optimized version (before → after)", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "interview-coach": {
    nodes: [
      { id: "input", type: "input", label: "Interview Details", description: "Understanding your upcoming interview", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_company", type: "search", label: "Research Company", description: "Deep-diving into the company", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => { const q = toSearchQuery(ctx.latestText); return [`${q} interview questions glassdoor`, `${q} company culture values mission`, `${q} recent news funding`]; }, maxResults: 8 } },
      { id: "scrape", type: "scrape", label: "Get Interview Intel", description: "Extracting interview experiences and tips", icon: "🌐", color: "#10b981", inputs: ["search_company"], config: { type: "scrape", urlsFrom: "search_company", maxUrls: 3 } },
      { id: "prep", type: "ai", label: "Build Prep Guide", description: "Creating your personalized interview prep", icon: "🎯", color: "#f5a623", inputs: ["search_company", "scrape"], config: { type: "ai", specialistSlug: "recruitment-agent", userPromptTemplate: "Create a comprehensive interview preparation guide for: {{input}}\n\nCompany research:\n{{search_company}}\n\nInterview intel:\n{{scrape}}\n\nInclude:\n1. Company Overview (mission, culture, recent news)\n2. Top 15 Likely Questions (behavioral + technical) with STAR-format answer frameworks\n3. Questions to Ask the Interviewer (5 impressive ones)\n4. Red flags to watch for\n5. Salary negotiation data\n6. Day-of checklist\n7. Follow-up email template", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "Web Scrape", icon: "🌐", color: "#10b981" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "salary-negotiator": {
    nodes: [
      { id: "input", type: "input", label: "Your Situation", description: "Understanding your compensation context", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_salary", type: "search", label: "Research Market Rates", description: "Gathering salary data from multiple sources", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => { const q = toSearchQuery(ctx.latestText); return [`${q} salary range ${ctx.today.split(",").pop()?.trim()}`, `${q} compensation levels glassdoor`, `${q} total compensation equity bonus`]; }, maxResults: 8 } },
      { id: "scrape", type: "scrape", label: "Extract Comp Data", description: "Scraping salary databases", icon: "🌐", color: "#10b981", inputs: ["search_salary"], config: { type: "scrape", urlsFrom: "search_salary", maxUrls: 4 } },
      { id: "strategy", type: "ai", label: "Build Negotiation Strategy", description: "Crafting your personalized negotiation playbook", icon: "💰", color: "#f5a623", inputs: ["search_salary", "scrape"], config: { type: "ai", specialistSlug: "strategy-advisor", userPromptTemplate: "Create a salary negotiation strategy for: {{input}}\n\nMarket data:\n{{search_salary}}\n\nComp data:\n{{scrape}}\n\nInclude:\n1. Market Rate Summary (table: Percentile | Base | Bonus | Equity | Total Comp)\n2. Your leverage points\n3. Negotiation script with exact phrases\n4. Counter-offer strategy (what to say for each scenario)\n5. Non-salary items to negotiate (PTO, remote, signing bonus, equity)\n6. Walk-away number and BATNA\n7. Email templates for negotiation\n8. Common mistakes to avoid", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "Web Scrape", icon: "🌐", color: "#10b981" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

};
