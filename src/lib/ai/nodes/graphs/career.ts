import type { PipelineGraph } from "../types";

export const CAREER_GRAPHS: Record<string, PipelineGraph> = {
  "job-hunter": {
    nodes: [
      { id: "input", type: "input", label: "Your Job Search", description: "Capturing your job preferences", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_jobs", type: "search", label: "Search Job Boards", description: "Searching across job boards and company sites", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`${ctx.latestText} jobs hiring now ${ctx.today.split(",")[0]}`, `${ctx.latestText} remote jobs 2025`, `${ctx.latestText} open positions site:greenhouse.io OR site:lever.co`], maxResults: 8 } },
      { id: "scrape", type: "scrape", label: "Extract Listings", description: "Extracting job details from found pages", icon: "🌐", color: "#10b981", inputs: ["search_jobs"], config: { type: "scrape", urlsFrom: "search_jobs", maxUrls: 5 } },
      { id: "analyze", type: "ai", label: "Evaluate Opportunities", description: "AI analyzing and ranking job opportunities", icon: "🤖", color: "#f59e0b", inputs: ["scrape"], config: { type: "ai", specialistSlug: "recruitment-agent", userPromptTemplate: "Based on the user's job search for \"{{input}}\" and the following real job listings data:\n\n{{search_jobs}}\n\nScraped details:\n{{scrape}}\n\nCreate a comprehensive job search report with:\n1. A table of the top 10 real job opportunities found (Company | Role | Location | Key Requirements | Estimated Salary Range)\n2. For each job, rate the match quality (1-5 stars) based on the search criteria\n3. Key skills mentioned across listings\n4. Salary trends and ranges found\n5. Companies hiring the most\n6. Recommended application strategy\n\nUse ONLY the real data found. If data is limited, note that and supplement with your knowledge of the current job market.", tools: ["web-search", "calculator"] } },
      { id: "format", type: "ai", label: "Build Strategy Report", description: "Creating your personalized job search strategy", icon: "📊", color: "#8b5cf6", inputs: ["analyze"], config: { type: "ai", specialistSlug: "recruitment-agent", userPromptTemplate: "Take this job analysis and create a polished, actionable job search strategy report:\n\n{{analyze}}\n\nFormat as a professional report with:\n- Executive Summary (3 bullet points)\n- Job Opportunities Table (clean markdown table)\n- Market Insights\n- Application Priority List (which to apply to first and why)\n- Resume Keywords to Include\n- Interview Preparation Tips for top companies\n- 30-Day Action Plan", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "Web Scrape", icon: "🌐", color: "#10b981" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "auto-applier": {
    nodes: [
      { id: "input", type: "input", label: "Job Details", description: "Parsing your resume and target job", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search", type: "search", label: "Research Company", description: "Researching the target company", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`${ctx.latestText} company culture values`, `${ctx.latestText} interview process hiring`], maxResults: 5 } },
      { id: "tailor_resume", type: "ai", label: "Tailor Resume", description: "Customizing resume for the target role", icon: "📄", color: "#f472b6", inputs: ["input", "search"], config: { type: "ai", specialistSlug: "recruitment-agent", userPromptTemplate: "The user wants to apply for this role: \"{{input}}\"\n\nCompany research:\n{{search}}\n\nCreate a tailored resume optimization plan:\n1. Key skills to emphasize from the job description\n2. Resume bullet points rewritten for ATS optimization\n3. Keywords to include\n4. Sections to prioritize\n5. Quantified achievements suggestions", tools: ["web-search", "calculator"] } },
      { id: "cover_letter", type: "ai", label: "Write Cover Letter", description: "Crafting a personalized cover letter", icon: "✍️", color: "#c5f135", inputs: ["tailor_resume", "search"], config: { type: "ai", specialistSlug: "cover-letter", userPromptTemplate: "Write a compelling cover letter for this application.\n\nRole details: {{input}}\n\nCompany research:\n{{search}}\n\nResume highlights:\n{{tailor_resume}}\n\nWrite a cover letter that:\n- Opens with a hook specific to the company\n- Connects the candidate's experience to key requirements\n- Shows knowledge of the company culture and mission\n- Closes with confidence and a call to action\n- Keeps it under 400 words", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "resume-optimizer": {
    nodes: [
      { id: "input", type: "input", label: "Your Resume", description: "Analyzing your current resume", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_trends", type: "search", label: "Research ATS Trends", description: "Researching current ATS and hiring trends", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`resume ATS optimization tips ${ctx.today.split(",").pop()?.trim()}`, `most in-demand skills ${ctx.latestText.slice(0, 50)}`], maxResults: 5 } },
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
      { id: "search_company", type: "search", label: "Research Company", description: "Deep-diving into the company", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`${ctx.latestText} interview questions glassdoor`, `${ctx.latestText} company culture values mission`, `${ctx.latestText} recent news funding`], maxResults: 8 } },
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
      { id: "search_salary", type: "search", label: "Research Market Rates", description: "Gathering salary data from multiple sources", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`${ctx.latestText} salary range ${ctx.today.split(",").pop()?.trim()}`, `${ctx.latestText} compensation levels glassdoor`, `${ctx.latestText} total compensation equity bonus`], maxResults: 8 } },
      { id: "scrape", type: "scrape", label: "Extract Comp Data", description: "Scraping salary databases", icon: "🌐", color: "#10b981", inputs: ["search_salary"], config: { type: "scrape", urlsFrom: "search_salary", maxUrls: 4 } },
      { id: "strategy", type: "ai", label: "Build Negotiation Strategy", description: "Crafting your personalized negotiation playbook", icon: "💰", color: "#f5a623", inputs: ["search_salary", "scrape"], config: { type: "ai", specialistSlug: "strategy-advisor", userPromptTemplate: "Create a salary negotiation strategy for: {{input}}\n\nMarket data:\n{{search_salary}}\n\nComp data:\n{{scrape}}\n\nInclude:\n1. Market Rate Summary (table: Percentile | Base | Bonus | Equity | Total Comp)\n2. Your leverage points\n3. Negotiation script with exact phrases\n4. Counter-offer strategy (what to say for each scenario)\n5. Non-salary items to negotiate (PTO, remote, signing bonus, equity)\n6. Walk-away number and BATNA\n7. Email templates for negotiation\n8. Common mistakes to avoid", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "Web Scrape", icon: "🌐", color: "#10b981" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "linkedin-optimizer": {
    nodes: [
      { id: "input", type: "input", label: "Your Profile", description: "Reviewing your LinkedIn profile", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_tips", type: "search", label: "Research Best Practices", description: "Finding latest LinkedIn optimization strategies", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`LinkedIn profile optimization tips ${ctx.today.split(",").pop()?.trim()}`, `LinkedIn SEO keywords ${ctx.latestText.slice(0, 40)}`], maxResults: 5 } },
      { id: "optimize", type: "ai", label: "Optimize Profile", description: "Rewriting your profile for maximum visibility", icon: "✍️", color: "#22d3ee", inputs: ["input", "search_tips"], config: { type: "ai", specialistSlug: "seo-agent", userPromptTemplate: "Optimize this LinkedIn profile: {{input}}\n\nBest practices:\n{{search_tips}}\n\nProvide:\n1. Optimized Headline (3 options, keyword-rich)\n2. About Section (compelling story format, 2000 chars max)\n3. Experience bullet points (achievement-focused)\n4. Skills to add (top 15)\n5. Featured section suggestions\n6. Content strategy (5 post ideas)\n7. Connection/networking strategy\n8. SSI (Social Selling Index) optimization tips", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "career-pivoter": {
    nodes: [
      { id: "input", type: "input", label: "Your Background", description: "Understanding your current career and goals", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_paths", type: "search", label: "Research Career Paths", description: "Exploring transition opportunities", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`career transition from ${ctx.latestText.slice(0, 50)} skills transfer`, `career pivot success stories ${ctx.latestText.slice(0, 30)}`], maxResults: 6 } },
      { id: "analyze", type: "ai", label: "Map Skills & Gaps", description: "Analyzing transferable skills and gaps", icon: "🧠", color: "#7c6fef", inputs: ["input", "search_paths"], config: { type: "ai", specialistSlug: "strategy-advisor", userPromptTemplate: "Analyze this career pivot request: {{input}}\n\nResearch:\n{{search_paths}}\n\nProvide:\n1. Transferable Skills Map (current skills → target role application)\n2. Skills Gap Analysis (what's missing + how to acquire)\n3. Top 5 realistic career paths ranked by feasibility\n4. 90-day transition plan\n5. Courses/certifications to prioritize\n6. Networking strategy for the new industry\n7. Resume repositioning guide\n8. Risk assessment and mitigation plan", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "remote-job-finder": {
    nodes: [
      { id: "input", type: "input", label: "Your Preferences", description: "Understanding your remote work preferences", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_remote", type: "search", label: "Search Remote Boards", description: "Scanning remote job boards", icon: "🌐", color: "#22d3ee", inputs: ["input"], config: { type: "search", queries: (ctx) => [`${ctx.latestText} remote job`, `${ctx.latestText} work from home hiring site:remoteok.com OR site:weworkremotely.com`, `${ctx.latestText} fully remote position`], maxResults: 8 } },
      { id: "scrape", type: "scrape", label: "Extract Listings", description: "Getting detailed job information", icon: "🌐", color: "#10b981", inputs: ["search_remote"], config: { type: "scrape", urlsFrom: "search_remote", maxUrls: 5 } },
      { id: "analyze", type: "ai", label: "Rank & Report", description: "Ranking opportunities by your fit", icon: "📊", color: "#4ade80", inputs: ["search_remote", "scrape"], config: { type: "ai", specialistSlug: "recruitment-agent", userPromptTemplate: "Analyze remote job opportunities for: {{input}}\n\nSearch results:\n{{search_remote}}\n\nScraped details:\n{{scrape}}\n\nProvide:\n1. Top 10 Remote Opportunities Table (Company | Role | Salary | Timezone | Benefits)\n2. Remote-specific perks comparison\n3. Company remote culture ratings\n4. Time zone compatibility analysis\n5. Application priority order\n6. Remote work setup recommendations", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "Web Scrape", icon: "🌐", color: "#10b981" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "portfolio-builder": {
    nodes: [
      { id: "input", type: "input", label: "Your Work", description: "Understanding your experience and projects", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_trends", type: "search", label: "Research Portfolio Trends", description: "Finding what top portfolios look like", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`best ${ctx.latestText.slice(0, 30)} portfolio examples ${ctx.today.split(",").pop()?.trim()}`, `portfolio website tips ${ctx.latestText.slice(0, 30)}`], maxResults: 5 } },
      { id: "build", type: "ai", label: "Design Portfolio", description: "Creating your portfolio structure and content", icon: "🎨", color: "#f472b6", inputs: ["input", "search_trends"], config: { type: "ai", specialistSlug: "content-creator", userPromptTemplate: "Design a professional portfolio for: {{input}}\n\nTrends:\n{{search_trends}}\n\nProvide:\n1. Portfolio structure (pages and sections)\n2. Hero section copy\n3. About Me section (compelling narrative)\n4. Project showcase descriptions (3-5 projects with STAR format)\n5. Skills section organization\n6. Testimonial prompts\n7. CTA strategy\n8. SEO optimization\n9. Platform recommendation (personal site, Notion, GitHub Pages, etc.)\n10. Content calendar for updates", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "networking-coach": {
    nodes: [
      { id: "input", type: "input", label: "Your Goals", description: "Understanding your networking objectives", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_events", type: "search", label: "Find Opportunities", description: "Searching for networking events and communities", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`${ctx.latestText.slice(0, 40)} networking events conferences ${ctx.today.split(",").pop()?.trim()}`, `${ctx.latestText.slice(0, 40)} professional communities online`], maxResults: 6 } },
      { id: "strategy", type: "ai", label: "Build Strategy", description: "Creating your personalized networking plan", icon: "🤝", color: "#4ade80", inputs: ["input", "search_events"], config: { type: "ai", specialistSlug: "strategy-advisor", userPromptTemplate: "Create a networking strategy for: {{input}}\n\nOpportunities found:\n{{search_events}}\n\nProvide:\n1. Networking Goals (SMART format)\n2. Target connections profile (who to connect with)\n3. Outreach templates (LinkedIn, email, cold intro - 3 each)\n4. Events/communities to join (from research + recommendations)\n5. Weekly networking schedule\n6. Conversation starters and follow-up scripts\n7. Personal brand statement\n8. 30-60-90 day networking plan\n9. Metrics to track progress", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },
};
