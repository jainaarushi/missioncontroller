// Each agent has a fixed pipeline of steps
// Step 1-N are fake progress steps shown in the UI
// The actual API call happens during the "core" step
// Other steps are visual delays that make the experience feel thorough

export interface PipelineStep {
  description: string;
  duration: number; // ms to show this step before moving on
  isCore?: boolean; // true = this is where the real API call happens
}

export const AGENT_PIPELINES: Record<string, PipelineStep[]> = {
  // Researcher — thorough multi-step research feel
  scout: [
    { description: "Understanding the research question", duration: 1200 },
    { description: "Searching across multiple sources", duration: 1800 },
    { description: "Cross-referencing and fact-checking", duration: 1500 },
    { description: "Synthesizing findings", duration: 0, isCore: true },
    { description: "Formatting research report", duration: 1000 },
    { description: "Adding citations and recommendations", duration: 800 },
  ],

  // Writer — drafting and polishing flow
  quill: [
    { description: "Analyzing audience and tone", duration: 1000 },
    { description: "Creating outline", duration: 1200 },
    { description: "Writing first draft", duration: 0, isCore: true },
    { description: "Self-editing for clarity and flow", duration: 1500 },
    { description: "Final polish", duration: 800 },
  ],

  // Analyst — data crunching feel
  metric: [
    { description: "Identifying key metrics", duration: 1000 },
    { description: "Pulling relevant data points", duration: 1500 },
    { description: "Running calculations and comparisons", duration: 1800 },
    { description: "Generating analysis", duration: 0, isCore: true },
    { description: "Building summary tables", duration: 1200 },
  ],

  // Assistant — quick and efficient
  atlas: [
    { description: "Understanding the request", duration: 800 },
    { description: "Working on it", duration: 0, isCore: true },
    { description: "Reviewing output", duration: 600 },
  ],

  // Travel Planner — detailed planning feel
  voyager: [
    { description: "Researching destination highlights", duration: 1500 },
    { description: "Checking accommodation options", duration: 1200 },
    { description: "Planning day-by-day itinerary", duration: 0, isCore: true },
    { description: "Adding dining and transport details", duration: 1500 },
    { description: "Calculating budget estimates", duration: 1000 },
    { description: "Finalizing travel plan", duration: 800 },
  ],

  // Finance — serious analysis feel
  pulse: [
    { description: "Gathering market data", duration: 1500 },
    { description: "Analyzing financial metrics", duration: 1800 },
    { description: "Comparing against benchmarks", duration: 1200 },
    { description: "Generating financial analysis", duration: 0, isCore: true },
    { description: "Assessing risk factors", duration: 1000 },
    { description: "Compiling final report", duration: 800 },
  ],

  // Web Intel — investigation feel
  sleuth: [
    { description: "Scanning target sources", duration: 1200 },
    { description: "Extracting structured data", duration: 1500 },
    { description: "Cross-referencing findings", duration: 1300 },
    { description: "Analyzing patterns", duration: 0, isCore: true },
    { description: "Compiling intelligence report", duration: 1000 },
  ],

  // Converter — transformation feel
  caster: [
    { description: "Analyzing source content", duration: 1000 },
    { description: "Identifying key messages", duration: 1200 },
    { description: "Transforming to target format", duration: 0, isCore: true },
    { description: "Optimizing for the medium", duration: 1000 },
    { description: "Final formatting", duration: 600 },
  ],

  // Tech Lead — architecture feel
  architect: [
    { description: "Analyzing requirements and constraints", duration: 1500 },
    { description: "Evaluating architectural options", duration: 1800 },
    { description: "Designing system topology", duration: 0, isCore: true },
    { description: "Assessing trade-offs and risks", duration: 1200 },
    { description: "Creating implementation roadmap", duration: 1000 },
  ],

  // Sales Rep — outreach preparation feel
  catalyst: [
    { description: "Analyzing target profile", duration: 1200 },
    { description: "Researching prospect signals", duration: 1500 },
    { description: "Crafting personalized approach", duration: 0, isCore: true },
    { description: "Generating subject line variants", duration: 1000 },
    { description: "Creating follow-up sequence", duration: 800 },
  ],

  // Fitness Coach — planning feel
  vitalis: [
    { description: "Assessing goals and constraints", duration: 1000 },
    { description: "Calculating nutritional targets", duration: 1200 },
    { description: "Designing personalized plan", duration: 0, isCore: true },
    { description: "Adding progression milestones", duration: 1000 },
    { description: "Finalizing recommendations", duration: 600 },
  ],

  // Consultant — McKinsey feel
  strategist: [
    { description: "Framing the strategic question", duration: 1200 },
    { description: "Analyzing market landscape", duration: 1800 },
    { description: "Assessing competitive positioning", duration: 1500 },
    { description: "Developing strategic options", duration: 0, isCore: true },
    { description: "Building implementation roadmap", duration: 1200 },
    { description: "Preparing executive summary", duration: 1000 },
  ],
};

// Default pipeline for custom agents
export const DEFAULT_PIPELINE: PipelineStep[] = [
  { description: "Analyzing the task", duration: 1000 },
  { description: "Working on it", duration: 0, isCore: true },
  { description: "Reviewing and finalizing", duration: 800 },
];

export function getPipeline(agentSlug: string): PipelineStep[] {
  return AGENT_PIPELINES[agentSlug] || DEFAULT_PIPELINE;
}
