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
  specialistSlug?: string; // Use this specialist agent's system_prompt for this step
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

  // ── Template Pipelines (specialist-orchestrated) ──────────────

  tmpl_career: [
    { description: "Researching your industry and market", duration: 1200 },
    { description: "Analyzing career landscape", duration: 0, isCore: true, specialistSlug: "deep-research", tools: ["web-search"], maxToolSteps: 8, toolContext: "Research career trends, salary data, job market conditions, and industry outlook for the user's field. Search for LinkedIn trends, industry reports, and hiring data. Gather at least 5 unique data points." },
    { description: "Building your career strategy", duration: 1500 },
    { description: "Creating personalized action plan", duration: 0, isCore2: true, specialistSlug: "strategy-advisor", core2Prompt: "Create a personalized career plan with:\n1. Skills Gap Analysis table (current vs needed)\n2. 90-Day Action Plan with weekly milestones\n3. Target Companies list with why each is a fit\n4. Networking Strategy with specific outreach templates\n5. Key Milestones and success metrics\n\nBe specific and actionable — no generic advice.\n\nCareer research:\n\n" },
    { description: "Final polish", duration: 800 },
  ],

  tmpl_career_profile: [
    { description: "Analyzing your current profile", duration: 1200 },
    { description: "Researching best practices", duration: 0, isCore: true, specialistSlug: "seo-agent", tools: ["web-search", "web-scrape"], maxToolSteps: 8, toolContext: "Research current best practices for professional profiles and resumes. Search for recruiter advice, ATS optimization tips, keyword strategies, and top-performing profile examples in the user's industry." },
    { description: "Crafting optimized content", duration: 1500 },
    { description: "Writing polished profile sections", duration: 0, isCore2: true, specialistSlug: "content-creator", core2Prompt: "Create optimized professional profile content with:\n1. Headline options (3 variations, keyword-rich)\n2. Summary/About section (compelling, keyword-optimized)\n3. Experience bullet rewrites (achievement-focused, quantified)\n4. Skills section recommendations\n5. SEO keywords to incorporate\n6. Before/After comparison\n\nMake every word count for both human readers and search algorithms.\n\nProfile research:\n\n" },
    { description: "Finalizing recommendations", duration: 800 },
  ],

  tmpl_job_search: [
    { description: "Understanding your requirements", duration: 1200 },
    { description: "Searching job markets and companies", duration: 0, isCore: true, specialistSlug: "deep-research", tools: ["web-search", "web-scrape"], maxToolSteps: 10, toolContext: "Search for job openings, company reviews, salary data, and hiring trends matching the user's criteria. Look at job boards, company career pages, and industry-specific platforms. Gather specific job titles, companies, and salary ranges." },
    { description: "Evaluating opportunities", duration: 1500 },
    { description: "Building your job search strategy", duration: 0, isCore2: true, specialistSlug: "recruitment-agent", core2Prompt: "Create a comprehensive job search strategy with:\n1. Top 10 Target Roles with companies and estimated salary ranges\n2. Application Priority Matrix (best fit → stretch roles)\n3. Resume tailoring tips for each role type\n4. Cover letter templates for top 3 opportunities\n5. Application tracking spreadsheet structure\n6. Weekly job search schedule\n\nBe specific with company names and role titles.\n\nJob market research:\n\n" },
    { description: "Final details", duration: 800 },
  ],

  tmpl_interview: [
    { description: "Researching the company and role", duration: 1200 },
    { description: "Analyzing interview landscape", duration: 0, isCore: true, specialistSlug: "deep-research", tools: ["web-search"], maxToolSteps: 8, toolContext: "Research the company culture, interview process, common questions, salary data, and recent news. Search Glassdoor, LinkedIn, and company blog for interview insights. Find specific examples of interview questions asked at this company." },
    { description: "Preparing your strategy", duration: 1500 },
    { description: "Creating interview playbook", duration: 0, isCore2: true, specialistSlug: "sales-coach", core2Prompt: "Create a comprehensive interview preparation playbook with:\n1. Company Research Brief (culture, values, recent wins)\n2. Top 15 Likely Questions with STAR-format answers\n3. Your Unique Value Proposition (2-minute pitch)\n4. Questions to Ask the Interviewer (thoughtful, specific)\n5. Salary Negotiation Script with anchoring strategy\n6. Follow-up Email Template\n\nMake answers specific to this company and role.\n\nInterview research:\n\n" },
    { description: "Final polish", duration: 800 },
  ],

  tmpl_tax_finance: [
    { description: "Understanding your financial situation", duration: 1200 },
    { description: "Researching tax rules and strategies", duration: 0, isCore: true, specialistSlug: "data-analyst", tools: ["web-search", "calculator"], maxToolSteps: 10, toolContext: "Research current tax brackets, deduction rules, and filing deadlines. Use calculator for estimated savings. Search for jurisdiction-specific rules if location is mentioned. Find IRS publications and tax law changes for the current year." },
    { description: "Calculating your options", duration: 1500 },
    { description: "Building your financial strategy", duration: 0, isCore2: true, specialistSlug: "personal-finance", core2Prompt: "Create a detailed financial/tax strategy with:\n1. Tax Situation Summary with estimated liability\n2. Deductions & Credits Checklist (eligible items with estimated savings)\n3. Optimization Strategies ranked by impact\n4. Monthly Action Items and deadlines\n5. Documentation Checklist (what to gather)\n6. Estimated Total Savings\n\nInclude specific dollar amounts and calculations.\n\nFinancial research:\n\n" },
    { description: "Finalizing report", duration: 800 },
  ],

  tmpl_budget_debt: [
    { description: "Analyzing your financial picture", duration: 1200 },
    { description: "Running financial calculations", duration: 0, isCore: true, specialistSlug: "personal-finance", tools: ["calculator", "web-search"], maxToolSteps: 8, toolContext: "Calculate debt payoff timelines, interest costs, budget allocations, and savings projections. Search for current interest rates, average costs, and financial benchmarks. Use the calculator for all projections and comparisons." },
    { description: "Comparing strategies", duration: 1500 },
    { description: "Creating your financial plan", duration: 0, isCore2: true, specialistSlug: "data-analyst", core2Prompt: "Create a comprehensive financial plan with:\n1. Budget Breakdown table (income vs expenses by category)\n2. Debt Payoff Schedule (monthly payments, interest saved, payoff date)\n3. Monthly Savings Target with automation tips\n4. Quick Wins list (immediate savings opportunities)\n5. 6-Month Financial Projection\n6. Key Metrics to Track\n\nUse tables and specific numbers throughout.\n\nFinancial analysis:\n\n" },
    { description: "Final details", duration: 800 },
  ],

  tmpl_legal: [
    { description: "Understanding your legal situation", duration: 1200 },
    { description: "Researching applicable laws", duration: 0, isCore: true, specialistSlug: "legal-advisor", tools: ["web-search", "web-scrape"], maxToolSteps: 10, toolContext: "Search for applicable laws, tenant rights by state, legal precedents, consumer protections, and government resources. If an authoritative source is found, scrape it. Focus on government websites, legal aid organizations, and official statutes." },
    { description: "Analyzing your rights and options", duration: 1500 },
    { description: "Building your action plan", duration: 0, isCore2: true, specialistSlug: "strategy-advisor", core2Prompt: "Create a legal action plan with:\n1. Rights Summary (your protections under applicable law)\n2. Step-by-Step Action Plan (numbered, with deadlines)\n3. Communication Templates (letters, emails ready to send)\n4. Evidence Checklist (what to document and gather)\n5. Escalation Path (if initial approach fails)\n6. Resources and Organizations that can help\n7. Important Disclaimers\n\nCite specific laws and statutes where possible.\n\nLegal research:\n\n" },
    { description: "Final review", duration: 800 },
  ],

  tmpl_legal_doc: [
    { description: "Reading the document", duration: 1200 },
    { description: "Analyzing terms and conditions", duration: 0, isCore: true, specialistSlug: "legal-advisor", tools: ["web-search", "calculator"], maxToolSteps: 8, toolContext: "Analyze the document for unusual terms, missing protections, and potential red flags. Search for standard terms in this type of agreement, relevant regulations, and market benchmarks. Use calculator for any financial calculations." },
    { description: "Cross-referencing standards", duration: 1500 },
    { description: "Building detailed review", duration: 0, isCore2: true, specialistSlug: "editor", core2Prompt: "Create a comprehensive document review with:\n1. Document Summary (key terms at a glance)\n2. Clause-by-Clause Review Table (clause | summary | risk level: green/yellow/red)\n3. Red Flags and Concerns (detailed explanation)\n4. Comparison to Standard Terms\n5. Negotiation Points (what to push back on, with suggested language)\n6. Missing Protections (what should be there)\n\nUse tables extensively. Be specific, not vague.\n\nDocument analysis:\n\n" },
    { description: "Finalizing review", duration: 800 },
  ],

  tmpl_home: [
    { description: "Understanding your housing needs", duration: 1200 },
    { description: "Researching options and market data", duration: 0, isCore: true, specialistSlug: "deep-research", tools: ["web-search", "calculator"], maxToolSteps: 10, toolContext: "Research housing market data, neighborhood information, cost comparisons, and available options. Use calculator for cost projections, mortgage estimates, and budget analysis. Search for local market trends and average prices." },
    { description: "Analyzing your options", duration: 1500 },
    { description: "Creating your housing plan", duration: 0, isCore2: true, specialistSlug: "strategy-advisor", core2Prompt: "Create a comprehensive housing plan with:\n1. Market Overview (current conditions, trends)\n2. Options Comparison Table (features, costs, pros/cons)\n3. Budget Analysis (monthly costs, hidden expenses)\n4. Checklist for Next Steps\n5. Timeline with key milestones\n6. Money-Saving Tips specific to this situation\n\nInclude specific numbers and local data.\n\nHousing research:\n\n" },
    { description: "Final details", duration: 800 },
  ],

  tmpl_health: [
    { description: "Understanding your health question", duration: 1200 },
    { description: "Researching medical information", duration: 0, isCore: true, specialistSlug: "deep-research", tools: ["web-search", "web-scrape"], maxToolSteps: 10, toolContext: "Research health information from reputable medical sources (NIH, Mayo Clinic, WHO, peer-reviewed journals). Search for evidence-based treatments, guidelines, and expert recommendations. Always prioritize authoritative medical sources." },
    { description: "Evaluating evidence", duration: 1500 },
    { description: "Creating your health guide", duration: 0, isCore2: true, specialistSlug: "fitness-coach", core2Prompt: "Create a comprehensive health guide with:\n1. Key Findings Summary (evidence quality noted)\n2. Actionable Recommendations (ranked by evidence strength)\n3. Lifestyle Modifications (specific, practical changes)\n4. Questions to Ask Your Doctor\n5. Tracking Metrics (what to monitor)\n6. Important Disclaimers (not medical advice, consult a professional)\n\nCite sources and note evidence quality for each recommendation.\n\nHealth research:\n\n" },
    { description: "Final review", duration: 800 },
  ],

  tmpl_health_bills: [
    { description: "Analyzing your healthcare costs", duration: 1200 },
    { description: "Researching options and savings", duration: 0, isCore: true, specialistSlug: "data-analyst", tools: ["web-search", "calculator"], maxToolSteps: 10, toolContext: "Research healthcare costs, insurance plans, prescription prices, and billing codes. Use calculator for cost comparisons and savings estimates. Search for patient assistance programs, generic alternatives, and negotiation strategies." },
    { description: "Comparing alternatives", duration: 1500 },
    { description: "Building your savings plan", duration: 0, isCore2: true, specialistSlug: "legal-advisor", core2Prompt: "Create a healthcare cost reduction plan with:\n1. Cost Analysis (current vs potential savings)\n2. Options Comparison Table\n3. Step-by-Step Action Plan for each savings opportunity\n4. Negotiation Scripts (for bills, insurance)\n5. Assistance Programs you may qualify for\n6. Total Estimated Savings\n\nInclude specific dollar amounts and timelines.\n\nHealthcare cost research:\n\n" },
    { description: "Finalizing report", duration: 800 },
  ],

  tmpl_meal: [
    { description: "Understanding your dietary needs", duration: 1200 },
    { description: "Planning meals and recipes", duration: 0, isCore: true, specialistSlug: "recipe-planner", tools: ["web-search", "calculator"], maxToolSteps: 8, toolContext: "Research recipes matching dietary preferences, calculate nutrition information, and estimate grocery costs. Search for seasonal ingredients, budget-friendly recipes, and meal prep techniques. Use calculator for nutrition totals and cost estimates." },
    { description: "Building your meal plan", duration: 1500 },
    { description: "Creating grocery list and prep guide", duration: 0, isCore2: true, specialistSlug: "fitness-coach", core2Prompt: "Create a complete meal prep plan with:\n1. Weekly Menu (breakfast, lunch, dinner, snacks)\n2. Recipes with prep times and instructions\n3. Consolidated Grocery List with estimated costs\n4. Nutrition Breakdown per meal (calories, protein, carbs, fat)\n5. Meal Prep Schedule (what to cook when)\n6. Storage and Reheating Tips\n7. Weekly Nutrition Totals vs goals\n\nMake it practical and time-efficient.\n\nMeal planning data:\n\n" },
    { description: "Final details", duration: 800 },
  ],

  tmpl_edu: [
    { description: "Understanding your learning goals", duration: 1200 },
    { description: "Researching options and resources", duration: 0, isCore: true, specialistSlug: "academic-researcher", tools: ["web-search", "web-scrape"], maxToolSteps: 10, toolContext: "Research educational resources, program requirements, scholarship opportunities, and learning strategies. Search for rankings, reviews, success rates, and expert recommendations. Scrape program pages for specific details." },
    { description: "Analyzing your options", duration: 1500 },
    { description: "Building your education plan", duration: 0, isCore2: true, specialistSlug: "strategy-advisor", core2Prompt: "Create a comprehensive education plan with:\n1. Goal Assessment and timeline\n2. Options Comparison Table (programs, costs, outcomes)\n3. Resource List (books, courses, tools) ranked by quality\n4. Study Schedule with milestones\n5. Financial Plan (scholarships, aid, costs)\n6. Success Metrics and checkpoints\n\nBe specific with program names, costs, and deadlines.\n\nEducation research:\n\n" },
    { description: "Final polish", duration: 800 },
  ],

  tmpl_shopping: [
    { description: "Understanding what you need", duration: 1200 },
    { description: "Researching options and prices", duration: 0, isCore: true, specialistSlug: "deep-research", tools: ["web-search", "web-scrape", "calculator"], maxToolSteps: 12, toolContext: "Search for product reviews, price comparisons, and current deals. Scrape retailer pages for actual prices when available. Use calculator for total cost comparisons and savings estimates. Look for expert reviews, user ratings, and price history." },
    { description: "Comparing your options", duration: 1500 },
    { description: "Creating recommendation report", duration: 0, isCore2: true, specialistSlug: "data-analyst", core2Prompt: "Create a shopping recommendation report with:\n1. Quick Pick (best overall choice + why)\n2. Detailed Comparison Table (features, prices, pros/cons)\n3. Best for Each Budget (budget, mid-range, premium)\n4. Total Cost of Ownership analysis\n5. Where to Buy (best current deals)\n6. Potential Savings vs alternatives\n\nUse tables extensively. Include specific prices.\n\nProduct research:\n\n" },
    { description: "Finalizing recommendations", duration: 800 },
  ],

  tmpl_freelance: [
    { description: "Understanding your freelance goals", duration: 1200 },
    { description: "Researching market and opportunities", duration: 0, isCore: true, specialistSlug: "strategy-advisor", tools: ["web-search", "calculator"], maxToolSteps: 8, toolContext: "Research freelance market rates, platform opportunities, client acquisition strategies, and industry benchmarks. Use calculator for rate calculations, project estimates, and income projections. Search for successful freelancer strategies in this field." },
    { description: "Building your strategy", duration: 1500 },
    { description: "Creating deliverables", duration: 0, isCore2: true, specialistSlug: "proposal-writer", core2Prompt: "Create professional freelance deliverables with:\n1. Market Rate Analysis (hourly, project, retainer)\n2. Service Package Options (3 tiers)\n3. Proposal/Invoice Template (ready to customize)\n4. Client Outreach Templates\n5. Pricing Calculator breakdown\n6. 90-Day Revenue Growth Plan\n\nMake everything ready to use immediately.\n\nFreelance research:\n\n" },
    { description: "Final polish", duration: 800 },
  ],

  tmpl_parenting: [
    { description: "Understanding your family situation", duration: 1200 },
    { description: "Researching options and best practices", duration: 0, isCore: true, specialistSlug: "deep-research", tools: ["web-search", "web-scrape"], maxToolSteps: 10, toolContext: "Research parenting resources, child development guidelines, program options, and expert recommendations. Search for reviews, ratings, costs, and availability. Focus on reputable sources (AAP, education departments, expert-reviewed sites)." },
    { description: "Evaluating your options", duration: 1500 },
    { description: "Creating your family plan", duration: 0, isCore2: true, specialistSlug: "strategy-advisor", core2Prompt: "Create a comprehensive family plan with:\n1. Options Overview (top choices with details)\n2. Comparison Table (cost, quality, convenience)\n3. Age-Appropriate Recommendations\n4. Budget Analysis and savings tips\n5. Action Steps with timeline\n6. Resources and next steps\n\nBe specific and practical for busy parents.\n\nParenting research:\n\n" },
    { description: "Final details", duration: 800 },
  ],

  tmpl_travel: [
    { description: "Researching your destination", duration: 1200 },
    { description: "Finding the best options", duration: 0, isCore: true, specialistSlug: "travel-planner", tools: ["web-search", "web-scrape"], maxToolSteps: 10, toolContext: "Research travel options, prices, reviews, and logistics. Search for deals, alternative routes, accommodation options, and local tips. Scrape booking sites for current prices when possible. Look for seasonal considerations and travel advisories." },
    { description: "Planning your itinerary", duration: 1500 },
    { description: "Creating your travel plan", duration: 0, isCore2: true, specialistSlug: "strategy-advisor", core2Prompt: "Create a complete travel plan with:\n1. Best Options Summary (top recommendation + why)\n2. Cost Breakdown (transport, accommodation, activities, food)\n3. Day-by-Day Itinerary (if applicable)\n4. Money-Saving Tips specific to this trip\n5. Packing Checklist\n6. Important Logistics (documents, bookings, deadlines)\n\nInclude specific prices and booking links when available.\n\nTravel research:\n\n" },
    { description: "Final polish", duration: 800 },
  ],

  tmpl_event: [
    { description: "Understanding your event vision", duration: 1200 },
    { description: "Researching vendors and options", duration: 0, isCore: true, specialistSlug: "project-planner", tools: ["web-search", "web-scrape", "calculator"], maxToolSteps: 10, toolContext: "Research event venues, vendors, pricing, and logistics. Search for reviews, availability, and package deals. Use calculator for budget projections and cost comparisons. Look for seasonal pricing and discount opportunities." },
    { description: "Building your event plan", duration: 1500 },
    { description: "Creating detailed event guide", duration: 0, isCore2: true, specialistSlug: "personal-finance", core2Prompt: "Create a comprehensive event plan with:\n1. Budget Breakdown (itemized with estimates)\n2. Vendor Comparison Table (options, prices, ratings)\n3. Week-by-Week Planning Timeline\n4. Day-of Checklist and minute-by-minute schedule\n5. Guest Communication Templates\n6. Contingency Plans (weather, no-shows, vendor issues)\n7. Total Budget Summary with savings tips\n\nMake it actionable with specific recommendations.\n\nEvent research:\n\n" },
    { description: "Final details", duration: 800 },
  ],

  tmpl_wellness: [
    { description: "Understanding your goals", duration: 1200 },
    { description: "Researching evidence-based approaches", duration: 0, isCore: true, specialistSlug: "mental-wellbeing", tools: ["web-search"], maxToolSteps: 8, toolContext: "Research evidence-based wellness strategies, habit formation science, and expert recommendations. Search for peer-reviewed studies, expert advice, and proven frameworks. Focus on practical, science-backed approaches." },
    { description: "Designing your plan", duration: 1500 },
    { description: "Creating your wellness program", duration: 0, isCore2: true, specialistSlug: "fitness-coach", core2Prompt: "Create a personalized wellness plan with:\n1. Current State Assessment framework\n2. Goal-Specific Action Plan (daily, weekly routines)\n3. Habit Stacking Sequence (new habits anchored to existing ones)\n4. Tracking System (what to measure and how)\n5. 30-Day Challenge with daily activities\n6. Obstacle Strategies (when motivation dips)\n\nMake it practical and sustainable, not overwhelming.\n\nWellness research:\n\n" },
    { description: "Final polish", duration: 800 },
  ],

  tmpl_pet: [
    { description: "Understanding your pet's needs", duration: 1200 },
    { description: "Researching breed-specific care", duration: 0, isCore: true, specialistSlug: "deep-research", tools: ["web-search"], maxToolSteps: 8, toolContext: "Research breed-specific care guidelines, nutrition requirements, common health issues, and expert veterinary recommendations. Search for reputable sources (AKC, veterinary journals, breed associations). Find age-appropriate care adjustments." },
    { description: "Building care recommendations", duration: 1500 },
    { description: "Creating your pet care guide", duration: 0, isCore2: true, specialistSlug: "recipe-planner", core2Prompt: "Create a comprehensive pet care guide with:\n1. Breed Profile (characteristics, typical needs)\n2. Nutrition Plan (food type, portions, schedule)\n3. Exercise & Activity Schedule\n4. Grooming Routine (frequency, tools needed)\n5. Health Watch List (breed-specific concerns, vet visit schedule)\n6. Training Tips for this breed\n7. Supply Checklist\n\nTailor everything to the specific breed and age.\n\nPet care research:\n\n" },
    { description: "Final details", duration: 800 },
  ],

  market_sizing: [
    { description: "Defining market boundaries", duration: 1000 },
    { description: "Researching market data and reports", duration: 0, isCore: true, tools: ["web-search", "calculator"], maxToolSteps: 12, toolContext: "You are a market analyst. Research thoroughly:\n1. Search for industry reports and market size estimates\n2. Search for census data, government statistics, and public filings\n3. Search for competitor revenue data and market share\n4. Search for growth rates and CAGR projections\n5. Use the calculator for bottom-up calculations\n6. Search for analogous markets for validation\nGet hard numbers — not just ranges." },
    { description: "Calculating top-down and bottom-up estimates", duration: 1500 },
    { description: "Building market analysis", duration: 0, isCore2: true, core2Prompt: "You are a market research analyst. Using the data below, create a rigorous market sizing report with:\n1. Market Definition and Scope\n2. Top-Down Analysis (industry → segment → addressable)\n3. Bottom-Up Analysis (customers × deal size × frequency)\n4. TAM / SAM / SOM Table with numbers\n5. Growth Projections (3-year and 5-year)\n6. Key Assumptions and Sensitivity Analysis\n7. Comparable Markets for Validation\n8. Sources\n\nShow your math. Use tables.\n\nMarket data:\n\n" },
    { description: "Finalizing report", duration: 800 },
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
  "devops-agent": "architect",
  // ── New Specialist Agents ─────────────────────────────────
  "ui-designer": "architect",
  "ux-researcher": "startup_trends",
  "brand-guardian": "quill",
  "qa-tester": "architect",
  "api-tester": "architect",
  "a11y-auditor": "architect",
  "scrum-master": "strategist",
  "data-engineer": "architect",
  "security-engineer": "architect",
  "growth-hacker": "strategist",
  "ppc-strategist": "social_media",
  "paid-social": "social_media",
  "podcast-strategist": "quill",
  "analytics-reporter": "metric",
  "product-manager": "strategist",
  // ── Template Agents (specialist-orchestrated) ──────────────
  // Career & Job Search
  "job-hunter": "tmpl_job_search",
  "interview-coach": "tmpl_interview",
  "salary-negotiator": "tmpl_interview",
  "resume-optimizer": "tmpl_career_profile",
  // Money & Bills
  "tax-deduction-finder": "tmpl_tax_finance",
  "budget-builder": "tmpl_budget_debt",
  "subscription-killer": "tmpl_budget_debt",
  "bill-negotiator": "tmpl_budget_debt",
  // Legal & Rights
  "lease-reviewer": "tmpl_legal_doc",
  // Health & Medical
  "medical-bill-auditor": "tmpl_health_bills",
  // ── Agency Agents ──────────────────────────────────
  // Design
  "image-prompt-engineer": "architect",
  "inclusive-visuals-specialist": "architect",
  "ux-architect": "architect",
  "visual-storyteller": "architect",
  "whimsy-injector": "architect",
  // Paid Media
  "pm-auditor": "strategist",
  "creative-strategist": "strategist",
  "programmatic-buyer": "strategist",
  "search-query-analyst": "strategist",
  "tracking-specialist": "strategist",
  // Sales
  "account-strategist": "catalyst",
  "sales-coach": "catalyst",
  "deal-strategist": "catalyst",
  "discovery-coach": "catalyst",
  "sales-engineer": "catalyst",
  "outbound-strategist": "catalyst",
  "pipeline-analyst": "catalyst",
  "proposal-strategist": "catalyst",
  // Spatial Computing
  "macos-spatial-metal-engineer": "architect",
  "terminal-integration-specialist": "architect",
  "visionos-spatial-engineer": "architect",
  "xr-cockpit-interaction-specialist": "architect",
  "xr-immersive-developer": "architect",
  "xr-interface-architect": "architect",
  // Project Management
  "experiment-tracker": "strategist",
  "jira-workflow-steward": "strategist",
  "project-shepherd": "strategist",
  "studio-operations": "strategist",
  "studio-producer": "strategist",
  "proj-senior": "strategist",
  // Specialized
  "accounts-payable-agent": "strategist",
  "agentic-identity-trust": "strategist",
  "agents-orchestrator": "strategist",
  "automation-governance-architect": "strategist",
  "blockchain-security-auditor": "strategist",
  "compliance-auditor": "strategist",
  "corporate-training-designer": "strategist",
  "data-consolidation-agent": "strategist",
  "government-digital-presales-consultant": "strategist",
  "healthcare-marketing-compliance": "strategist",
  "identity-graph-operator": "strategist",
  "lsp-index-engineer": "strategist",
  "recruitment-specialist": "strategist",
  "report-distribution-agent": "strategist",
  "data-extraction-agent": "strategist",
  "cultural-intelligence-strategist": "strategist",
  "developer-advocate": "strategist",
  "document-generator": "strategist",
  "french-consulting-market": "strategist",
  "korean-business-navigator": "strategist",
  "mcp-builder": "strategist",
  "model-qa": "strategist",
  "salesforce-architect": "strategist",
  "workflow-architect": "strategist",
  "study-abroad-advisor": "strategist",
  "supply-chain-strategist": "strategist",
  "zk-steward": "strategist",
  // Product
  "behavioral-nudge-engine": "strategist",
  "feedback-synthesizer": "strategist",
  "sprint-prioritizer": "strategist",
  "trend-researcher": "strategist",
  // Academic
  "academic-anthropologist": "deep_research",
  "academic-geographer": "deep_research",
  "academic-historian": "deep_research",
  "academic-narratologist": "deep_research",
  "academic-psychologist": "deep_research",
  // Testing
  "evidence-collector": "architect",
  "performance-benchmarker": "architect",
  "reality-checker": "architect",
  "test-results-analyzer": "architect",
  "tool-evaluator": "architect",
  "workflow-optimizer": "architect",
  // Support
  "executive-summary-generator": "atlas",
  "finance-tracker": "atlas",
  "infrastructure-maintainer": "atlas",
  "legal-compliance-checker": "atlas",
  "support-responder": "atlas",
  // Marketing (additional)
  "ai-citation-strategist": "social_media",
  "app-store-optimizer": "social_media",
  "baidu-seo-specialist": "social_media",
  "bilibili-content-strategist": "social_media",
  "book-co-author": "social_media",
  "carousel-growth-engine": "social_media",
  "china-ecommerce-operator": "social_media",
  "cross-border-ecommerce": "social_media",
  "douyin-strategist": "social_media",
  "instagram-curator": "social_media",
  "kuaishou-strategist": "social_media",
  "linkedin-content-creator": "social_media",
  "livestream-commerce-coach": "social_media",
  "private-domain-operator": "social_media",
  "reddit-community-builder": "social_media",
  "short-video-editing-coach": "social_media",
  "tiktok-strategist": "social_media",
  "twitter-engager": "social_media",
  "wechat-official-account": "social_media",
  "weibo-strategist": "social_media",
  "xiaohongshu-specialist": "social_media",
  "zhihu-strategist": "social_media",
  // Game Development
  "game-audio-engineer": "architect",
  "game-designer": "architect",
  "level-designer": "architect",
  "narrative-designer": "architect",
  "technical-artist": "architect",
  "unreal-multiplayer-architect": "architect",
  "unreal-systems-engineer": "architect",
  "unreal-technical-artist": "architect",
  "unreal-world-builder": "architect",
  "unity-architect": "architect",
  "unity-editor-tool-developer": "architect",
  "unity-multiplayer-engineer": "architect",
  "unity-shader-graph-artist": "architect",
  "roblox-avatar-creator": "architect",
  "roblox-experience-designer": "architect",
  "roblox-systems-scripter": "architect",
  "blender-addon-engineer": "architect",
  "godot-gameplay-scripter": "architect",
  "godot-multiplayer-engineer": "architect",
  "godot-shader-developer": "architect",
  // Engineering (additional)
  "ai-data-remediation-engineer": "architect",
  "ai-engineer": "architect",
  "autonomous-optimization-architect": "architect",
  "backend-architect": "architect",
  "database-optimizer": "architect",
  "devops-automator": "architect",
  "embedded-firmware-engineer": "architect",
  "feishu-integration-developer": "architect",
  "frontend-developer": "architect",
  "git-workflow-master": "architect",
  "incident-response-commander": "architect",
  "mobile-app-builder": "architect",
  "rapid-prototyper": "architect",
  "senior-developer": "architect",
  "software-architect": "architect",
  "solidity-smart-contract-engineer": "architect",
  "eng-sre": "architect",
  "threat-detection-engineer": "architect",
  "wechat-mini-program-developer": "architect",
};

// ── Specialist Prompt Resolution ─────────────────────────────
import { PRESET_AGENTS } from "@/seed/agents";

const SPECIALIST_PROMPT_CACHE = new Map<string, string>();

export function getSpecialistPrompt(slug: string): string | null {
  if (SPECIALIST_PROMPT_CACHE.has(slug)) return SPECIALIST_PROMPT_CACHE.get(slug)!;
  const agent = PRESET_AGENTS.find(a => a.slug === slug);
  if (agent?.system_prompt) {
    SPECIALIST_PROMPT_CACHE.set(slug, agent.system_prompt);
    return agent.system_prompt;
  }
  return null;
}

export function getPipeline(agentSlug: string): PipelineStep[] {
  // Direct match first, then mapped slug, then default
  return AGENT_PIPELINES[agentSlug]
    || AGENT_PIPELINES[SLUG_TO_PIPELINE[agentSlug]]
    || DEFAULT_PIPELINE;
}
