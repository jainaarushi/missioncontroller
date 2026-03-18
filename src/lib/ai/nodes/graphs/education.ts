import type { PipelineGraph } from "../types";

export const EDUCATION_GRAPHS: Record<string, PipelineGraph> = {
  "scholarship-hunter": {
    nodes: [
      { id: "input", type: "input", label: "Your Profile", description: "Understanding your background and goals", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_scholarships", type: "search", label: "Search Scholarships", description: "Searching scholarship databases", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`scholarships ${ctx.latestText.slice(0, 50)} ${ctx.today.split(",").pop()?.trim()}`, `${ctx.latestText.slice(0, 40)} grants financial aid`, `scholarship deadlines upcoming ${ctx.latestText.slice(0, 30)}`], maxResults: 8 } },
      { id: "scrape", type: "scrape", label: "Get Scholarship Details", description: "Extracting scholarship requirements and deadlines", icon: "🌐", color: "#10b981", inputs: ["search_scholarships"], config: { type: "scrape", urlsFrom: "search_scholarships", maxUrls: 5 } },
      { id: "match", type: "ai", label: "Match & Strategize", description: "Matching you with the best scholarships", icon: "🎓", color: "#22d3ee", inputs: ["input", "search_scholarships", "scrape"], config: { type: "ai", specialistSlug: "deep-research", userPromptTemplate: "Find scholarships for: {{input}}\n\nSearch results:\n{{search_scholarships}}\n\nDetails:\n{{scrape}}\n\nProvide:\n1. Scholarship Match Table (Name | Amount | Deadline | Eligibility Match | Effort Level | Apply Link)\n2. Top 5 highest ROI scholarships to apply to first\n3. Essay tips for each (common prompts)\n4. Application timeline\n5. Documents checklist\n6. Lesser-known scholarships most people miss\n7. Scholarship essay template\n8. Total potential award amount", tools: ["web-search"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "Web Scrape", icon: "🌐", color: "#10b981" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "college-advisor": {
    nodes: [
      { id: "input", type: "input", label: "Your Profile", description: "Understanding your academic profile and goals", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_schools", type: "search", label: "Research Schools", description: "Finding schools that match your profile", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`best colleges ${ctx.latestText.slice(0, 50)}`, `college admissions requirements ${ctx.latestText.slice(0, 40)}`, `college acceptance rates ${ctx.today.split(",").pop()?.trim()}`], maxResults: 6 } },
      { id: "analyze", type: "ai", label: "Build College List", description: "Creating your balanced college list", icon: "🎓", color: "#22d3ee", inputs: ["input", "search_schools"], config: { type: "ai", specialistSlug: "academic-researcher", userPromptTemplate: "Create a college admission strategy for: {{input}}\n\nResearch:\n{{search_schools}}\n\nProvide:\n1. Recommended Schools Table (School | Category | Acceptance Rate | Fit Score | Est. Cost | Why)\n2. Reach schools (3), Match schools (4), Safety schools (3)\n3. Application timeline\n4. Essay strategy for each\n5. Extracurricular positioning\n6. Financial aid strategy\n7. Interview preparation\n8. Decision criteria framework", tools: ["web-search"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "study-plan-maker": {
    nodes: [
      { id: "input", type: "input", label: "Your Subjects", description: "Understanding what you need to study", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_methods", type: "search", label: "Research Methods", description: "Finding the best study strategies", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`best study methods ${ctx.latestText.slice(0, 40)}`, `study schedule template exam prep`, `active recall spaced repetition tips`], maxResults: 5 } },
      { id: "plan", type: "ai", label: "Build Study Plan", description: "Creating your optimized study schedule", icon: "📚", color: "#22d3ee", inputs: ["input", "search_methods"], config: { type: "ai", specialistSlug: "strategy-advisor", userPromptTemplate: "Create a study plan for: {{input}}\n\nStudy methods:\n{{search_methods}}\n\nProvide:\n1. Study Schedule Table (Day | Time Block | Subject | Method | Duration)\n2. Priority ranking of topics\n3. Active recall practice questions\n4. Spaced repetition schedule\n5. Break and reward strategy\n6. Resource recommendations\n7. Practice test schedule\n8. Day-before-exam checklist\n9. Productivity tips", tools: ["web-search"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "essay-coach": {
    nodes: [
      { id: "input", type: "input", label: "Your Essay Topic", description: "Understanding your essay requirements", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_examples", type: "search", label: "Research Examples", description: "Finding examples and approaches for your topic", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`${ctx.latestText.slice(0, 50)} essay examples`, `essay writing tips ${ctx.latestText.slice(0, 30)}`, `college essay structure guide`], maxResults: 5 } },
      { id: "outline", type: "ai", label: "Build Outline & Draft", description: "Creating your essay structure and first draft", icon: "✍️", color: "#c5f135", inputs: ["input", "search_examples"], config: { type: "ai", specialistSlug: "editor", userPromptTemplate: "Help with this essay: {{input}}\n\nResearch:\n{{search_examples}}\n\nProvide:\n1. Thesis statement (3 options)\n2. Detailed outline with topic sentences\n3. Strong opening hook options\n4. Evidence and examples to include\n5. Transition phrases\n6. Counter-argument handling\n7. Conclusion strategies\n8. Full draft (if requested)\n9. Self-editing checklist\n10. Common pitfalls for this essay type", tools: ["web-search"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "skill-roadmap": {
    nodes: [
      { id: "input", type: "input", label: "Skill to Learn", description: "Understanding what you want to learn", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_resources", type: "search", label: "Find Resources", description: "Finding the best learning resources", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`learn ${ctx.latestText.slice(0, 50)} roadmap ${ctx.today.split(",").pop()?.trim()}`, `best free courses ${ctx.latestText.slice(0, 40)}`, `${ctx.latestText.slice(0, 30)} skill path beginner to advanced`], maxResults: 6 } },
      { id: "roadmap", type: "ai", label: "Build Roadmap", description: "Creating your personalized learning path", icon: "🗺️", color: "#22d3ee", inputs: ["input", "search_resources"], config: { type: "ai", specialistSlug: "strategy-advisor", userPromptTemplate: "Create a learning roadmap for: {{input}}\n\nResources found:\n{{search_resources}}\n\nProvide:\n1. Skill Tree (prerequisite → intermediate → advanced)\n2. Learning Roadmap Table (Week | Topic | Resource | Project | Hours)\n3. Free resources for each stage\n4. Practice projects at each level\n5. Community and mentorship suggestions\n6. Portfolio-worthy projects to build\n7. Assessment milestones\n8. Total estimated time to proficiency\n9. Alternative fast-track path", tools: ["web-search"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "language-tutor": {
    nodes: [
      { id: "input", type: "input", label: "Language Goals", description: "Understanding your language learning goals", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_methods", type: "search", label: "Research Methods", description: "Finding effective language learning techniques", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`learn ${ctx.latestText.slice(0, 40)} fast effective method`, `best ${ctx.latestText.slice(0, 30)} learning apps resources`, `language learning immersion tips`], maxResults: 5 } },
      { id: "plan", type: "ai", label: "Build Language Plan", description: "Creating your language learning curriculum", icon: "🗣️", color: "#22d3ee", inputs: ["input", "search_methods"], config: { type: "ai", specialistSlug: "strategy-advisor", userPromptTemplate: "Create a language learning plan for: {{input}}\n\nMethods research:\n{{search_methods}}\n\nProvide:\n1. Current level assessment\n2. Learning Plan Table (Week | Focus Area | Activities | Time | Milestone)\n3. Daily practice routine (30 min/day)\n4. App and resource recommendations\n5. Essential vocabulary (first 100 words)\n6. Grammar priority order\n7. Immersion strategies\n8. Speaking practice opportunities\n9. Progress checkpoints\n10. Cultural context tips", tools: ["web-search"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },
};
