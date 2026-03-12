// Each agent has a fixed pipeline of steps
// Steps marked isCore are REAL API calls
// Steps marked isCore2 are a SECOND real API call (refine/synthesize)
// Other steps are visual delays for UX

export interface PipelineStep {
  description: string;
  duration: number; // ms delay for visual steps
  isCore?: boolean; // first real API call — generates initial output
  isCore2?: boolean; // second real API call — refines/synthesizes
  core2Prompt?: string; // instruction for the second call
  tools?: string[]; // Tool IDs: "web-search", "finance-data", "data-query", "web-scrape", "deep-research", "calculator"
  maxToolSteps?: number; // Max tool call rounds (default 3)
  toolContext?: string; // Extra context for tool-using steps
  requiresFileData?: boolean; // Step needs parsed file data (for data-query tool)
}

export const AGENT_PIPELINES: Record<string, PipelineStep[]> = {
  // Researcher — 2 real calls: research then synthesize
  scout: [
    { description: "Understanding the research question", duration: 1200 },
    { description: "Searching across multiple sources", duration: 1800 },
    { description: "Gathering and cross-referencing data", duration: 0, isCore: true },
    { description: "Fact-checking key claims", duration: 1500 },
    { description: "Synthesizing into final report", duration: 0, isCore2: true, core2Prompt: "You are an expert editor. Take the research below and improve it: make it more structured with clear headers, add a Key Takeaways section at the top, ensure all claims are clearly stated, add a Recommendations section, and format with clean markdown. Keep all the substance, just make it sharper and more actionable.\n\nDraft research:\n\n" },
    { description: "Adding citations and formatting", duration: 800 },
  ],

  // Writer — 2 real calls: draft then polish
  quill: [
    { description: "Analyzing audience and tone", duration: 1000 },
    { description: "Creating outline structure", duration: 1200 },
    { description: "Writing first draft", duration: 0, isCore: true },
    { description: "Self-editing for clarity and flow", duration: 0, isCore2: true, core2Prompt: "You are a professional editor. Polish and improve this draft: fix any awkward phrasing, improve transitions, make it more engaging, tighten the language, and ensure it reads professionally. Keep the same structure and key points.\n\nDraft:\n\n" },
    { description: "Final formatting", duration: 600 },
  ],

  // Analyst — 2 real calls: analyze then summarize
  metric: [
    { description: "Identifying key metrics and data points", duration: 1200 },
    { description: "Running analysis and calculations", duration: 1800 },
    { description: "Generating detailed analysis", duration: 0, isCore: true },
    { description: "Building summary tables", duration: 0, isCore2: true, core2Prompt: "You are a data presentation expert. Take this analysis and make it more visual and scannable: add comparison tables where appropriate, highlight the most important numbers in bold, add a clear Executive Summary at the top with the 3 most important findings, and ensure every insight has a specific actionable recommendation.\n\nAnalysis:\n\n" },
    { description: "Finalizing report", duration: 800 },
  ],

  // Assistant — single call, quick
  atlas: [
    { description: "Understanding your request", duration: 800 },
    { description: "Working on it", duration: 0, isCore: true },
    { description: "Reviewing output", duration: 600 },
  ],

  // Travel Planner — 2 real calls: research then itinerary
  voyager: [
    { description: "Researching destination highlights", duration: 1500 },
    { description: "Checking accommodations and dining options", duration: 1200 },
    { description: "Planning day-by-day itinerary", duration: 0, isCore: true },
    { description: "Optimizing schedule and adding tips", duration: 0, isCore2: true, core2Prompt: "You are a travel optimization expert. Take this itinerary and enhance it: add estimated costs for each activity, suggest the best times of day for each activity, add practical transport tips between locations, include backup options for rainy days, and add a packing checklist. Make it feel like a premium travel guide.\n\nDraft itinerary:\n\n" },
    { description: "Finalizing travel plan", duration: 800 },
  ],

  // Finance — 2 real calls: analyze then risk assessment
  pulse: [
    { description: "Gathering financial data", duration: 1500 },
    { description: "Analyzing market metrics", duration: 1800 },
    { description: "Generating financial analysis", duration: 0, isCore: true },
    { description: "Running risk assessment", duration: 0, isCore2: true, core2Prompt: "You are a risk analyst. Review this financial analysis and add: a Risk Assessment section highlighting key risks and their likelihood, a Bull vs Bear case comparison, specific price targets or range if applicable, and a clear Bottom Line recommendation. Be balanced and flag uncertainties.\n\nFinancial analysis:\n\n" },
    { description: "Compiling final report", duration: 800 },
  ],

  // Web Intel — single call (extraction focused)
  sleuth: [
    { description: "Scanning target sources", duration: 1200 },
    { description: "Extracting structured data", duration: 1500 },
    { description: "Analyzing patterns and intelligence", duration: 0, isCore: true },
    { description: "Compiling intelligence report", duration: 1000 },
  ],

  // Converter — 2 real calls: understand then transform
  caster: [
    { description: "Analyzing source content structure", duration: 1000 },
    { description: "Identifying key messages and themes", duration: 1200 },
    { description: "Transforming to target format", duration: 0, isCore: true },
    { description: "Optimizing for the medium", duration: 0, isCore2: true, core2Prompt: "You are a content optimization expert. Take this converted content and polish it for the target medium: improve hooks and transitions, ensure the tone matches the target format perfectly, add engagement elements (questions, calls-to-action), and make it publication-ready.\n\nDraft conversion:\n\n" },
    { description: "Final quality check", duration: 600 },
  ],

  // Tech Lead — 2 real calls: design then roadmap
  architect: [
    { description: "Analyzing requirements and constraints", duration: 1500 },
    { description: "Evaluating architectural patterns", duration: 1800 },
    { description: "Designing system architecture", duration: 0, isCore: true },
    { description: "Creating implementation roadmap", duration: 0, isCore2: true, core2Prompt: "You are a technical project manager. Take this architecture design and add: a phased implementation roadmap with clear milestones, estimated timelines for each phase, key technical risks with mitigation strategies, and a technology decision matrix comparing the alternatives mentioned. Make it actionable for an engineering team.\n\nArchitecture design:\n\n" },
    { description: "Finalizing technical spec", duration: 1000 },
  ],

  // Sales Rep — 2 real calls: research then outreach
  catalyst: [
    { description: "Analyzing target profile", duration: 1200 },
    { description: "Researching prospect signals", duration: 1500 },
    { description: "Generating prospect research and approach", duration: 0, isCore: true },
    { description: "Crafting personalized outreach", duration: 0, isCore2: true, core2Prompt: "You are an elite cold email copywriter. Using the research below, write: 1) A personalized cold email (max 5 sentences) with a compelling subject line, 2) Two alternative subject lines, 3) A 3-email follow-up sequence with different angles. Each email should reference specific details from the research. Use the Problem → Agitation → Solution framework.\n\nProspect research:\n\n" },
    { description: "Creating follow-up sequence", duration: 800 },
  ],

  // Fitness Coach — 2 real calls: plan then detail
  vitalis: [
    { description: "Assessing goals and constraints", duration: 1000 },
    { description: "Calculating nutritional targets", duration: 1200 },
    { description: "Designing personalized plan", duration: 0, isCore: true },
    { description: "Adding detailed schedules and meals", duration: 0, isCore2: true, core2Prompt: "You are a nutrition and fitness detailing expert. Take this plan and make it extremely specific and actionable: add exact meal recipes with portions for at least 3 days, add specific warm-up and cool-down routines, include rest day activities, add a simple tracking template, and include tips for staying consistent.\n\nFitness plan:\n\n" },
    { description: "Finalizing recommendations", duration: 600 },
  ],

  // Consultant — 2 real calls: analyze then strategy
  strategist: [
    { description: "Framing the strategic question", duration: 1200 },
    { description: "Analyzing market landscape", duration: 1800 },
    { description: "Developing strategic analysis", duration: 0, isCore: true },
    { description: "Assessing competitive positioning", duration: 1500 },
    { description: "Building implementation strategy", duration: 0, isCore2: true, core2Prompt: "You are a McKinsey-level strategy consultant. Take this analysis and add: an Executive Summary (3 bullet points), a strategic options comparison matrix (effort/impact/risk/timeline), a 90-day action plan with specific KPIs and owners, and a clear final recommendation with supporting rationale. Format it like a professional consulting deliverable.\n\nStrategic analysis:\n\n" },
    { description: "Preparing executive summary", duration: 1000 },
  ],
  // ── Tool-Enhanced Pipelines ──────────────────────────────────

  // Deep Research with real web search — iterative multi-query
  deep_research: [
    { description: "Understanding the research question", duration: 1200 },
    { description: "Searching the web for sources", duration: 0, isCore: true, tools: ["web-search", "deep-research", "web-scrape"], maxToolSteps: 15, toolContext: "You are a thorough researcher. Follow this process:\n1. Search for the topic from 3-5 different angles (overview, recent news, expert analysis, data/statistics, criticism)\n2. Read the search results carefully and identify gaps in your knowledge\n3. Search again with refined queries to fill those gaps\n4. If a search result looks especially relevant, use web_scrape to read the full article\n5. Keep searching until you have comprehensive coverage from at least 8-10 unique sources\n6. Track all source URLs for citations\nDo NOT stop after one search — iterate until you have thorough coverage." },
    { description: "Cross-referencing and fact-checking", duration: 1500 },
    { description: "Synthesizing into comprehensive report", duration: 0, isCore2: true, core2Prompt: "You are an expert research synthesizer. Take the research data below (including all web sources found) and create a comprehensive, well-structured report with:\n1. Executive Summary (3-5 key findings)\n2. Detailed Analysis with sections\n3. Key Data Points and Statistics\n4. Sources and Citations (with URLs)\n5. Conclusion and Recommendations\n\nUse the source URLs as citation links. Format with clean markdown.\n\nResearch data:\n\n" },
    { description: "Adding citations and formatting", duration: 800 },
  ],

  // Investment Analyst with real stock data + web search for news
  investment: [
    { description: "Identifying stocks and financial instruments", duration: 1000 },
    { description: "Fetching real-time market data", duration: 0, isCore: true, tools: ["finance-data", "web-search"], maxToolSteps: 15, toolContext: "You are a thorough investment analyst. For EACH stock ticker mentioned:\n1. Call get_stock_data with data_type=\"quote\" for current price\n2. Call get_stock_data with data_type=\"fundamentals\" for P/E, revenue, margins\n3. Call get_stock_data with data_type=\"history\" for 6-month trend\n4. Search the web for recent news about the company (e.g., \"AAPL news 2025\")\n5. Search for analyst opinions and price targets\nAfter gathering ALL data, write your analysis using the REAL numbers from tool results.\nNever make up financial data — always use the actual tool results." },
    { description: "Analyzing fundamentals and trends", duration: 1500 },
    { description: "Generating investment analysis with risk assessment", duration: 0, isCore2: true, core2Prompt: "You are an elite investment analyst. Using the real market data below, create a professional investment analysis with:\n1. Executive Summary\n2. Current Price & Performance (with real numbers)\n3. Fundamental Analysis (P/E, market cap, margins)\n4. Technical Overview (52-week range, trend)\n5. Analyst Consensus (if available)\n6. Risk Assessment (bull vs bear case)\n7. Recommendation with price target range\n\nFormat numbers in tables. Bold key metrics.\n\nMarket data:\n\n" },
    { description: "Compiling final report", duration: 800 },
  ],

  // Data Analyst with SQL queries on uploaded data — iterative exploration
  data_analyst: [
    { description: "Analyzing uploaded data structure", duration: 800 },
    { description: "Running data analysis queries", duration: 0, isCore: true, tools: ["data-query", "calculator"], maxToolSteps: 12, requiresFileData: true, toolContext: "You are a data analyst. Explore the data iteratively:\n1. First: SELECT * FROM uploaded_data LIMIT 5 — understand the structure\n2. Then: Count rows, check for nulls, understand data types\n3. Run analytical queries based on the user's question:\n   - Summary statistics (AVG, MIN, MAX, COUNT)\n   - Group-by analyses for categorical columns\n   - Trends over time if date columns exist\n   - Correlations between numeric columns\n4. Each query result should inform your next query\n5. Use the calculator for derived metrics\nRun at least 5-8 queries to thoroughly understand the data." },
    { description: "Generating insights and visualizations", duration: 1200 },
    { description: "Creating detailed analysis report", duration: 0, isCore2: true, core2Prompt: "You are a senior data analyst. Using the query results below, create a comprehensive analysis report with:\n1. Data Overview (rows, columns, data types)\n2. Key Metrics Summary (in a table)\n3. Distribution Analysis\n4. Trends and Patterns\n5. Outliers and Anomalies\n6. Actionable Insights (top 5)\n7. Recommendations\n\nFormat all numbers clearly. Use markdown tables extensively.\n\nQuery results:\n\n" },
    { description: "Finalizing report", duration: 600 },
  ],

  // Journalist with web search for sources — multi-source research
  journalist: [
    { description: "Researching the story angle", duration: 1000 },
    { description: "Gathering sources and quotes", duration: 0, isCore: true, tools: ["web-search", "web-scrape"], maxToolSteps: 10, toolContext: "You are an investigative journalist. Research thoroughly:\n1. Search for the story from multiple angles (news, analysis, data, opinion)\n2. Find at least 5-8 credible sources with different perspectives\n3. For the most important 2-3 sources, use web_scrape to read the full article\n4. Cross-reference facts across sources — note any contradictions\n5. Search for expert quotes and official statements\n6. Track all source URLs for inline citations\nDo NOT write the article yet — just gather comprehensive source material." },
    { description: "Structuring the narrative", duration: 1200 },
    { description: "Writing the article", duration: 0, isCore2: true, core2Prompt: "You are an award-winning journalist. Using the research sources below, write a compelling, well-sourced article with:\n1. Attention-grabbing headline\n2. Strong lede\n3. Context and background\n4. Multiple perspectives with attributed quotes/data\n5. Analysis of implications\n6. Conclusion\n\nCite sources inline with links.\n\nResearch:\n\n" },
    { description: "Final editorial review", duration: 600 },
  ],

  // Web Intel with scraping
  web_intel: [
    { description: "Analyzing target URLs", duration: 800 },
    { description: "Scraping and extracting data", duration: 0, isCore: true, tools: ["web-scrape", "web-search"], maxToolSteps: 5, toolContext: "Scrape the provided URLs and extract the requested information. If URLs aren't provided, search the web first to find relevant pages, then scrape them." },
    { description: "Structuring extracted intelligence", duration: 1000 },
    { description: "Compiling intelligence report", duration: 0, isCore2: true, core2Prompt: "You are an intelligence analyst. Using the scraped data below, create a structured intelligence report with:\n1. Summary of Findings\n2. Extracted Data (in tables)\n3. Key Patterns and Insights\n4. Source Reliability Assessment\n5. Recommendations for Follow-up\n\nFormat data in clean markdown tables.\n\nScraped data:\n\n" },
    { description: "Final formatting", duration: 600 },
  ],

  // Competitor Intelligence — deep per-competitor research
  competitor_intel: [
    { description: "Identifying competitors to analyze", duration: 1000 },
    { description: "Researching competitor data", duration: 0, isCore: true, tools: ["web-search", "web-scrape"], maxToolSteps: 15, toolContext: "You are a competitive intelligence analyst. For EACH competitor mentioned:\n1. Search for the company overview and recent news\n2. Search for their pricing page and plans\n3. Search for user reviews and ratings (G2, Capterra, Trustpilot)\n4. Search for their funding, team size, and growth\n5. If a pricing or features page looks important, use web_scrape to get details\nAfter researching all competitors, compile your findings with real data.\nDo NOT make up pricing or feature data — use only what you found." },
    { description: "Cross-referencing competitive data", duration: 1500 },
    { description: "Building competitive analysis", duration: 0, isCore2: true, core2Prompt: "You are a competitive intelligence strategist. Using the research below, create a comprehensive competitive analysis with:\n1. Market Landscape Overview\n2. Competitor Profiles (strengths, weaknesses, pricing, features)\n3. Feature Comparison Matrix (markdown table)\n4. Pricing Comparison Table\n5. SWOT Analysis for each competitor\n6. Strategic Recommendations\n7. Opportunities and Threats\n\nUse tables extensively.\n\nResearch data:\n\n" },
    { description: "Finalizing competitive report", duration: 1000 },
  ],

  // Travel Planner with search — detailed destination research
  travel: [
    { description: "Researching destination", duration: 1200 },
    { description: "Finding attractions, restaurants, and hotels", duration: 0, isCore: true, tools: ["web-search", "web-scrape"], maxToolSteps: 10, toolContext: "You are a travel researcher. Search for the destination thoroughly:\n1. Search for top attractions and things to do\n2. Search for best restaurants and local food specialties\n3. Search for hotel/accommodation recommendations by budget\n4. Search for transportation options (airport to city, getting around)\n5. Search for weather during the travel dates\n6. Search for local events happening during the travel period\n7. Search for safety tips and local customs\nGet specific names, addresses, and price ranges. Use real data." },
    { description: "Optimizing itinerary", duration: 1500 },
    { description: "Building detailed travel plan", duration: 0, isCore2: true, core2Prompt: "You are an expert travel planner. Using the destination research below, create a premium travel itinerary with:\n1. Trip Overview\n2. Day-by-Day Itinerary (morning/afternoon/evening)\n3. Restaurant Recommendations per day\n4. Accommodation Options (budget, mid-range, luxury)\n5. Transportation Guide\n6. Packing Checklist\n7. Budget Breakdown (table)\n\nMake it feel like a premium travel guide.\n\nDestination research:\n\n" },
    { description: "Adding final tips and formatting", duration: 800 },
  ],

  // Financial Coach with calculator
  financial_coach: [
    { description: "Understanding your financial situation", duration: 1000 },
    { description: "Analyzing financial data", duration: 0, isCore: true, tools: ["calculator"], maxToolSteps: 5, toolContext: "Calculate key financial metrics: savings rate, debt-to-income ratio, emergency fund coverage, projected growth." },
    { description: "Building personalized plan", duration: 1500 },
    { description: "Creating financial roadmap", duration: 0, isCore2: true, core2Prompt: "You are a certified financial planner. Using the analysis below, create a personalized financial plan with:\n1. Financial Health Score (out of 100)\n2. Current Situation Summary\n3. 30-60-90 Day Action Plan\n4. Budget Recommendation with exact amounts\n5. Debt Payoff Strategy\n6. Investment Strategy\n7. Emergency Fund Plan\n8. Long-term Milestones (1yr, 5yr, 10yr)\n\nBe specific with numbers. Use tables.\n\nFinancial analysis:\n\n" },
    { description: "Finalizing recommendations", duration: 800 },
  ],

  // Sales Intelligence with prospect research — deep company research
  sales_intel: [
    { description: "Researching target company", duration: 1200 },
    { description: "Gathering prospect intelligence", duration: 0, isCore: true, tools: ["web-search", "web-scrape"], maxToolSteps: 10, toolContext: "You are a B2B sales intelligence researcher. Research the target company deeply:\n1. Search for the company overview and what they do\n2. Search for recent news (funding, launches, partnerships)\n3. Search for key decision-makers and their LinkedIn activity\n4. Search for their tech stack and tools they use\n5. Search for job postings (reveals priorities and pain points)\n6. Search for competitive landscape\n7. If their website or a key article looks important, use web_scrape to get details\nGather specific, actionable intelligence for a sales approach." },
    { description: "Identifying pain points and opportunities", duration: 1500 },
    { description: "Creating sales playbook", duration: 0, isCore2: true, core2Prompt: "You are an elite B2B sales strategist. Using the prospect research below, create a sales intelligence brief with:\n1. Company Snapshot (key facts table)\n2. Key Decision Makers\n3. Pain Points Analysis\n4. Buying Triggers (why now?)\n5. Competitive Landscape\n6. Personalized Outreach Strategy\n7. Cold Email Sequence (3 emails)\n8. Objection Handling (top 5)\n9. Recommended Approach\n\nMake emails specific and personalized.\n\nProspect research:\n\n" },
    { description: "Polishing outreach materials", duration: 800 },
  ],

  // Health & Fitness Coach
  health_fitness: [
    { description: "Assessing goals and constraints", duration: 1000 },
    { description: "Designing personalized program", duration: 0, isCore: true },
    { description: "Calculating nutrition targets", duration: 1200 },
    { description: "Creating detailed plan with meals and workouts", duration: 0, isCore2: true, core2Prompt: "You are a certified personal trainer and nutritionist. Take the program below and make it extremely detailed:\n1. Weekly Workout Schedule (day by day)\n2. Each Workout: exercises, sets, reps, rest time, form tips\n3. Warm-up and Cool-down Routines\n4. 7-Day Meal Plan with exact portions\n5. 3 Recipes per Meal Category\n6. Shopping List\n7. Progress Tracking Template\n8. Rest Day Activities\n9. Tips for Consistency\n\nBe specific — no vague advice.\n\nProgram outline:\n\n" },
    { description: "Finalizing your program", duration: 600 },
  ],

  // Legal Advisor with research
  legal: [
    { description: "Analyzing the legal question", duration: 1200 },
    { description: "Researching applicable laws and precedents", duration: 0, isCore: true, tools: ["web-search", "web-scrape"], maxToolSteps: 10, toolContext: "You are a legal researcher. Search thoroughly:\n1. Search for the specific law or regulation that applies\n2. Search for relevant court cases and legal precedents\n3. Search for expert legal analysis and commentary\n4. Search for jurisdiction-specific rules if a location is mentioned\n5. If an authoritative legal source is found, use web_scrape to read it in detail\n6. Search for any recent changes or proposed amendments to relevant laws\nFocus on credible legal sources (law firms, courts, government sites)." },
    { description: "Evaluating legal implications", duration: 1500 },
    { description: "Drafting legal analysis", duration: 0, isCore2: true, core2Prompt: "You are a senior legal advisor. Using the research below, create a thorough legal analysis with:\n1. Issue Summary\n2. Applicable Laws and Regulations\n3. Key Legal Precedents\n4. Analysis of Arguments (for and against)\n5. Risk Assessment (low/medium/high)\n6. Recommended Course of Action\n7. Next Steps\n8. DISCLAIMER: This is AI-generated legal information, not legal advice. Consult a licensed attorney.\n\nLegal research:\n\n" },
    { description: "Final review", duration: 800 },
  ],

  // Recruitment Agent
  recruitment: [
    { description: "Analyzing the role requirements", duration: 1000 },
    { description: "Researching market data", duration: 0, isCore: true, tools: ["web-search"], maxToolSteps: 8, toolContext: "You are a recruitment market researcher. Search for:\n1. Salary benchmarks for this role by location and experience level\n2. Common requirements at top companies hiring for this role\n3. Trending skills and certifications in demand\n4. Diversity and inclusion best practices for this role type\n5. Effective interview questions used by top companies\nGet specific salary numbers, skill lists, and company examples." },
    { description: "Building recruitment strategy", duration: 1500 },
    { description: "Creating recruitment package", duration: 0, isCore2: true, core2Prompt: "You are a senior technical recruiter. Using the research below, create a complete recruitment package with:\n1. Optimized Job Description\n2. Salary Benchmark Table\n3. Must-Have vs Nice-to-Have Skills Matrix\n4. Sourcing Strategy\n5. 10 Screening Questions\n6. 10 Technical Interview Questions with answers\n7. Interview Scorecard Template\n8. 30-60-90 Day Onboarding Plan\n\nMake everything ready to use.\n\nMarket research:\n\n" },
    { description: "Finalizing package", duration: 800 },
  ],

  // Real Estate Analyst
  real_estate: [
    { description: "Analyzing property details", duration: 1000 },
    { description: "Researching market data", duration: 0, isCore: true, tools: ["web-search", "calculator"], maxToolSteps: 10, toolContext: "You are a real estate market researcher. Search thoroughly:\n1. Search for local market trends and average home prices in the area\n2. Search for comparable properties and recent sales\n3. Search for neighborhood info (schools, safety, amenities, walkability)\n4. Search for future development plans or zoning changes\n5. Use the calculator for financial metrics (ROI, cap rate, mortgage payments, cash-on-cash return)\nGet specific addresses, prices, and data points." },
    { description: "Comparing alternatives", duration: 1500 },
    { description: "Building real estate analysis", duration: 0, isCore2: true, core2Prompt: "You are a real estate investment analyst. Using the research below, create a property analysis with:\n1. Property Overview\n2. Market Analysis (trends, avg prices)\n3. Comparable Properties Table\n4. Neighborhood Scorecard (schools, safety, amenities — rated 1-10)\n5. Financial Analysis (ROI, cap rate, cash flow)\n6. Risk Factors\n7. Negotiation Strategy\n8. Recommendation: Buy / Pass / Negotiate\n\nUse tables for comparisons.\n\nMarket research:\n\n" },
    { description: "Finalizing analysis", duration: 800 },
  ],

  // ── Tier 2: Agents upgraded with free web search ────────────

  // Fact Checker — search to verify claims
  fact_checker: [
    { description: "Analyzing claims to verify", duration: 1000 },
    { description: "Searching for evidence and primary sources", duration: 0, isCore: true, tools: ["web-search", "web-scrape"], maxToolSteps: 12, toolContext: "You are a rigorous fact-checker. For each claim in the user's request:\n1. Search for the specific claim to find primary sources\n2. Search for counter-evidence and opposing viewpoints\n3. Search for official data, statistics, or authoritative statements\n4. If a source looks authoritative (government, academic, major news), use web_scrape to read the full article\n5. Note the credibility of each source (official, expert, opinion, anonymous)\n6. Cross-reference facts across multiple sources\nBe thorough — check EVERY claim, not just the first one." },
    { description: "Cross-referencing sources", duration: 1500 },
    { description: "Compiling fact-check verdict", duration: 0, isCore2: true, core2Prompt: "You are a professional fact-checker. Using the evidence gathered below, create a fact-check report with:\n1. Each claim listed and rated: ✅ TRUE | ⚠️ PARTIALLY TRUE | ❌ FALSE | ❓ UNVERIFIABLE\n2. Evidence for and against each claim with source links\n3. Context that the original claim may have missed\n4. Overall Credibility Score (1-10)\n5. Sources used (with URLs)\n\nBe fair and balanced — cite your sources.\n\nEvidence gathered:\n\n" },
    { description: "Final review", duration: 600 },
  ],

  // Startup Trend Analyst — real-time market research
  startup_trends: [
    { description: "Analyzing the sector and trends", duration: 1000 },
    { description: "Researching recent funding, launches, and market data", duration: 0, isCore: true, tools: ["web-search"], maxToolSteps: 10, toolContext: "You are a startup and venture capital analyst. Research thoroughly:\n1. Search for recent funding rounds in this sector (last 6 months)\n2. Search for new product launches and pivots\n3. Search for market size estimates and growth projections\n4. Search for emerging technologies and disruptors\n5. Search for expert predictions and industry reports\n6. Search for major acquisitions or exits\nUse real data — names, amounts, dates. Do NOT guess or make up funding amounts." },
    { description: "Identifying emerging patterns", duration: 1500 },
    { description: "Synthesizing trend analysis", duration: 0, isCore2: true, core2Prompt: "You are a startup ecosystem analyst. Using the research below, create a trend analysis report with:\n1. Executive Summary — top 3 trends\n2. Funding Landscape (recent rounds with amounts)\n3. Emerging Startups to Watch (with what they do)\n4. Technology Trends\n5. Market Opportunities\n6. Risks and Headwinds\n7. Predictions for Next 12 Months\n\nUse real company names and data from the research.\n\nResearch data:\n\n" },
    { description: "Finalizing report", duration: 800 },
  ],

  // Academic Researcher — search for papers and findings
  academic_research: [
    { description: "Framing the research question", duration: 1000 },
    { description: "Searching for academic sources and papers", duration: 0, isCore: true, tools: ["web-search", "web-scrape"], maxToolSteps: 12, toolContext: "You are an academic researcher. Search methodically:\n1. Search for recent peer-reviewed papers on the topic\n2. Search for meta-analyses and systematic reviews\n3. Search for key researchers and their latest work\n4. Search for conflicting findings or ongoing debates\n5. Search for research methodology discussions\n6. If an academic paper or article looks highly relevant, use web_scrape to read the abstract and findings\n7. Search ArXiv, PubMed, or Google Scholar-style queries (e.g., 'site:arxiv.org topic')\nFocus on scholarly sources, not opinion pieces." },
    { description: "Analyzing findings and methodology", duration: 1500 },
    { description: "Writing literature review", duration: 0, isCore2: true, core2Prompt: "You are an academic writer. Using the research below, create a structured literature review with:\n1. Introduction and Research Question\n2. Methodology Overview (how sources were selected)\n3. Key Findings (organized by theme)\n4. Points of Agreement and Disagreement in the Literature\n5. Research Gaps Identified\n6. Conclusion\n7. References (APA format with URLs)\n\nMaintain academic tone. Cite all sources.\n\nResearch data:\n\n" },
    { description: "Formatting citations", duration: 800 },
  ],

  // Strategy Advisor — data-driven strategic advice
  strategy_advisory: [
    { description: "Analyzing the strategic question", duration: 1200 },
    { description: "Researching market data and industry context", duration: 0, isCore: true, tools: ["web-search"], maxToolSteps: 10, toolContext: "You are a strategy consultant. Research the market context:\n1. Search for industry trends and market dynamics\n2. Search for competitor strategies and positioning\n3. Search for recent market data and growth metrics\n4. Search for expert analysis and strategy frameworks relevant to this situation\n5. Search for case studies of similar strategic decisions\nGround your strategic advice in real market data, not just theory." },
    { description: "Developing strategic framework", duration: 1800 },
    { description: "Building implementation strategy", duration: 0, isCore2: true, core2Prompt: "You are a McKinsey-level strategy consultant. Take this analysis and add: an Executive Summary (3 bullet points), a strategic options comparison matrix (effort/impact/risk/timeline), a 90-day action plan with specific KPIs and owners, and a clear final recommendation with supporting rationale. Format it like a professional consulting deliverable.\n\nStrategic analysis:\n\n" },
    { description: "Preparing executive summary", duration: 1000 },
  ],

  // Product Launch Intelligence
  product_launch: [
    { description: "Analyzing the product concept", duration: 1000 },
    { description: "Researching market and competition", duration: 0, isCore: true, tools: ["web-search", "web-scrape"], maxToolSteps: 10, toolContext: "You are a product launch researcher. Search thoroughly:\n1. Search for similar products already on the market\n2. Search for market size estimates and growth data\n3. Search for target audience demographics and behavior\n4. Search for pricing strategies of comparable products\n5. Search for distribution channels and go-to-market approaches\n6. Search for recent successful launches in this category for inspiration\nIf a competitor's product page or pricing page looks important, use web_scrape to get details." },
    { description: "Building go-to-market strategy", duration: 1500 },
    { description: "Creating launch playbook", duration: 0, isCore2: true, core2Prompt: "You are a product launch strategist. Using the research below, create a launch playbook with:\n1. Market Opportunity Assessment\n2. Target Audience Personas (2-3)\n3. Competitive Positioning\n4. Pricing Strategy with comparison table\n5. 12-Week Go-to-Market Timeline\n6. Marketing Channel Strategy\n7. Content Calendar (first 30 days)\n8. Launch Day Checklist\n9. KPIs and Success Metrics\n\nBe specific and actionable.\n\nMarket research:\n\n" },
    { description: "Finalizing playbook", duration: 1000 },
  ],

  // ── New Agent Pipelines ────────────────────────────────────

  // SEO Agent — keyword research + competitor analysis
  seo: [
    { description: "Analyzing target keywords and intent", duration: 1000 },
    { description: "Researching search data and competitors", duration: 0, isCore: true, tools: ["web-search", "web-scrape"], maxToolSteps: 12, toolContext: "You are an SEO specialist. Research thoroughly:\n1. Search for the target keywords and related terms\n2. Search for top-ranking pages for these keywords\n3. Scrape 2-3 competitor pages to analyze their content structure\n4. Search for keyword difficulty and search volume data\n5. Search for related long-tail keywords and questions\n6. Research current SEO best practices and algorithm updates\nGather real ranking data and competitor insights." },
    { description: "Analyzing rankings and content gaps", duration: 1500 },
    { description: "Building SEO strategy", duration: 0, isCore2: true, core2Prompt: "You are an SEO expert. Using the research below, create a comprehensive SEO audit and strategy with:\n1. Keyword Strategy (primary, secondary, long-tail) with estimated volume\n2. On-Page Optimization Checklist\n3. Content Gap Analysis vs competitors\n4. Technical SEO Recommendations\n5. Content Calendar for SEO (10 article ideas with target keywords)\n6. Link Building Strategy\n7. Priority Action Items (ranked by impact)\n\nUse real data from the research. Format with tables.\n\nSEO research:\n\n" },
    { description: "Finalizing recommendations", duration: 800 },
  ],

  // Social Media — trend research + content calendar
  social_media: [
    { description: "Analyzing brand and audience", duration: 1000 },
    { description: "Researching trends and competitor strategies", duration: 0, isCore: true, tools: ["web-search"], maxToolSteps: 10, toolContext: "You are a social media strategist. Research:\n1. Search for current trends on the relevant platforms\n2. Search for competitor social media strategies and engagement\n3. Search for viral content patterns in this industry\n4. Search for optimal posting times and frequency data\n5. Search for hashtag strategies and trending topics\nFocus on actionable, current data." },
    { description: "Designing content pillars", duration: 1200 },
    { description: "Creating content calendar", duration: 0, isCore2: true, core2Prompt: "You are a social media strategist. Using the research below, create a comprehensive social media plan with:\n1. Platform Strategy (which platforms and why)\n2. Content Pillars (3-5 themes with examples)\n3. 30-Day Content Calendar (day, platform, content type, topic, hashtags)\n4. 10 Viral Post Ideas with hooks\n5. Engagement Strategy (community building tactics)\n6. Growth Metrics to Track\n\nMake it specific and ready to execute.\n\nTrend research:\n\n" },
    { description: "Polishing strategy", duration: 800 },
  ],

  // VC Due Diligence — deep company research
  vc_due_diligence: [
    { description: "Researching the company", duration: 1200 },
    { description: "Gathering market and competitive data", duration: 0, isCore: true, tools: ["web-search", "web-scrape"], maxToolSteps: 15, toolContext: "You are a VC analyst conducting due diligence. Research deeply:\n1. Search for the company: product, team, funding history\n2. Search for founder backgrounds and previous ventures\n3. Search for market size estimates and industry reports\n4. Search for competitors and their funding/traction\n5. Search for customer reviews, press coverage, and partnerships\n6. Search for recent news or controversies\n7. If the company website is available, scrape key pages\nBe thorough — this is an investment decision." },
    { description: "Analyzing financials and traction", duration: 1500 },
    { description: "Writing investment memo", duration: 0, isCore2: true, core2Prompt: "You are a VC partner writing an investment memo. Using the research below, create a professional memo with:\n1. Executive Summary (1 paragraph)\n2. Company Overview (product, team, stage)\n3. Market Analysis (TAM/SAM/SOM)\n4. Competitive Landscape (table)\n5. Traction and Unit Economics\n6. Team Assessment\n7. Key Risks and Mitigants\n8. Bull Case / Bear Case\n9. Investment Recommendation (Invest / Pass / Monitor)\n10. Suggested Terms\n\nUse real data. Be balanced.\n\nDue diligence data:\n\n" },
    { description: "Finalizing memo", duration: 1000 },
  ],

  // Market Sizing — data-driven analysis
  market_sizing: [
    { description: "Defining market boundaries", duration: 1000 },
    { description: "Researching market data and reports", duration: 0, isCore: true, tools: ["web-search", "calculator"], maxToolSteps: 12, toolContext: "You are a market analyst. Research thoroughly:\n1. Search for industry reports and market size estimates\n2. Search for census data, government statistics, and public filings\n3. Search for competitor revenue data and market share\n4. Search for growth rates and CAGR projections\n5. Use the calculator for bottom-up calculations\n6. Search for analogous markets for validation\nGet hard numbers — not just ranges." },
    { description: "Calculating top-down and bottom-up estimates", duration: 1500 },
    { description: "Building market analysis", duration: 0, isCore2: true, core2Prompt: "You are a market research analyst. Using the data below, create a rigorous market sizing report with:\n1. Market Definition and Scope\n2. Top-Down Analysis (industry → segment → addressable)\n3. Bottom-Up Analysis (customers × deal size × frequency)\n4. TAM / SAM / SOM Table with numbers\n5. Growth Projections (3-year and 5-year)\n6. Key Assumptions and Sensitivity Analysis\n7. Comparable Markets for Validation\n8. Sources\n\nShow your math. Use tables.\n\nMarket data:\n\n" },
    { description: "Finalizing report", duration: 800 },
  ],

  // eCommerce — store optimization
  ecommerce: [
    { description: "Analyzing your store and products", duration: 1000 },
    { description: "Researching competitors and market trends", duration: 0, isCore: true, tools: ["web-search", "web-scrape"], maxToolSteps: 10, toolContext: "You are an eCommerce expert. Research:\n1. Search for competitor stores and their pricing strategies\n2. Search for industry benchmarks (conversion rates, AOV, cart abandonment)\n3. Search for trending products and market opportunities\n4. Scrape 1-2 competitor product pages for comparison\n5. Search for CRO best practices for eCommerce\nGather real pricing and benchmark data." },
    { description: "Optimizing conversion funnel", duration: 1500 },
    { description: "Creating growth strategy", duration: 0, isCore2: true, core2Prompt: "You are an eCommerce strategist. Using the research below, create a comprehensive store optimization plan with:\n1. Store Audit Summary (strengths, weaknesses)\n2. Product Description Rewrites (for top 3 products)\n3. CRO Recommendations (10 specific changes with expected impact)\n4. Pricing Analysis vs competitors (table)\n5. Email Automation Sequences (cart abandonment, welcome, post-purchase)\n6. Growth Roadmap (30/60/90 day plan)\n7. KPIs to Track\n\nBe specific with real competitor data.\n\nResearch:\n\n" },
    { description: "Finalizing plan", duration: 800 },
  ],
};

export const DEFAULT_PIPELINE: PipelineStep[] = [
  { description: "Analyzing the task", duration: 1000 },
  { description: "Generating output", duration: 0, isCore: true },
  { description: "Reviewing and finalizing", duration: 800 },
];

// Map seed slugs to pipeline keys
const SLUG_TO_PIPELINE: Record<string, string> = {
  // Tool-enhanced agents → new pipelines
  "deep-research": "deep_research",
  "investment-analyst": "investment",
  "data-analyst": "data_analyst",
  "journalist": "journalist",
  "web-intel": "web_intel",
  "travel-planner": "travel",
  "fitness-coach": "health_fitness",
  "sales-rep": "sales_intel",
  "product-launch": "product_launch",
  "personal-finance": "financial_coach",
  // New agents
  "competitor-intel": "competitor_intel",
  "legal-advisor": "legal",
  "recruitment-agent": "recruitment",
  "real-estate-analyst": "real_estate",
  // Tier 2 agents → new search-enhanced pipelines
  "fact-checker": "fact_checker",
  "startup-trends": "startup_trends",
  "academic-researcher": "academic_research",
  "strategy-advisor": "strategy_advisory",
  "content-creator": "quill",
  "technical-writer": "quill",
  "editor": "quill",
  "email-drafter": "quill",
  "linkedin-post": "quill",
  "cover-letter": "quill",
  "blog-to-podcast": "caster",
  "visualization-expert": "metric",
  "general-assistant": "atlas",
  "decision-helper": "atlas",
  "meeting-notes": "atlas",
  "system-architect": "architect",
  "fullstack-developer": "architect",
  "python-expert": "architect",
  "code-reviewer": "architect",
  "debugger": "architect",
  "customer-support": "catalyst",
  "recipe-planner": "vitalis",
  "mental-wellbeing": "vitalis",
  "project-planner": "strategist",
  "sprint-planner": "strategist",
  // New agents → search-enhanced pipelines
  "seo-agent": "seo",
  "social-media": "social_media",
  "ad-copy": "quill",
  "newsletter-agent": "quill",
  "video-script": "quill",
  "vc-due-diligence": "vc_due_diligence",
  "market-sizing": "market_sizing",
  "pricing-strategist": "strategist",
  "proposal-writer": "catalyst",
  "ecommerce-agent": "ecommerce",
  "teaching-agent": "atlas",
  "game-design": "architect",
  "ui-ux-feedback": "architect",
  "devops-agent": "architect",
  "life-coach": "vitalis",
  "music-generator": "atlas",
};

export function getPipeline(agentSlug: string): PipelineStep[] {
  // Direct match first, then mapped slug, then default
  return AGENT_PIPELINES[agentSlug]
    || AGENT_PIPELINES[SLUG_TO_PIPELINE[agentSlug]]
    || DEFAULT_PIPELINE;
}
