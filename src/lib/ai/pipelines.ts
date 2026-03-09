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
};

export const DEFAULT_PIPELINE: PipelineStep[] = [
  { description: "Analyzing the task", duration: 1000 },
  { description: "Generating output", duration: 0, isCore: true },
  { description: "Reviewing and finalizing", duration: 800 },
];

export function getPipeline(agentSlug: string): PipelineStep[] {
  return AGENT_PIPELINES[agentSlug] || DEFAULT_PIPELINE;
}
