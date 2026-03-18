import type { PipelineGraph } from "../types";

export const GROWTH_GRAPHS: Record<string, PipelineGraph> = {
  "habit-tracker": {
    nodes: [
      { id: "input", type: "input", label: "Your Habits", description: "Understanding your habit goals", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_science", type: "search", label: "Research Science", description: "Finding habit formation research", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`habit formation science tips ${ctx.latestText.slice(0, 40)}`, `atomic habits strategies ${ctx.today.split(",").pop()?.trim()}`, `habit tracking methods best`], maxResults: 5 } },
      { id: "plan", type: "ai", label: "Build Habit System", description: "Creating your habit formation system", icon: "✅", color: "#f5a623", inputs: ["input", "search_science"], config: { type: "ai", specialistSlug: "fitness-coach", userPromptTemplate: "Create a habit system for: {{input}}\n\nResearch:\n{{search_science}}\n\nProvide:\n1. Habit Stack Design (cue → routine → reward for each habit)\n2. Daily Schedule Integration\n3. Tracking Template (30-day calendar)\n4. Implementation intentions (when/where/how)\n5. Accountability strategies\n6. Progressive difficulty scaling\n7. Recovery plan for missed days\n8. App recommendations\n9. 30/60/90 day milestones\n10. Environment design tips", tools: ["web-search"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "journaling-coach": {
    nodes: [
      { id: "input", type: "input", label: "Your Goals", description: "Understanding what you want from journaling", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_methods", type: "search", label: "Research Methods", description: "Finding journaling techniques", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`journaling methods benefits ${ctx.latestText.slice(0, 40)}`, `journaling prompts ${ctx.latestText.slice(0, 30)}`, `best journaling practice tips`], maxResults: 4 } },
      { id: "guide", type: "ai", label: "Build Journaling Practice", description: "Creating your personalized journaling routine", icon: "📓", color: "#f5a623", inputs: ["input", "search_methods"], config: { type: "ai", specialistSlug: "mental-wellbeing", userPromptTemplate: "Create a journaling practice for: {{input}}\n\nMethods:\n{{search_methods}}\n\nProvide:\n1. Recommended journaling method (and why it fits you)\n2. Daily template (morning and/or evening)\n3. 30 unique journaling prompts\n4. Weekly reflection template\n5. Monthly review questions\n6. Journaling triggers and cues\n7. Tools and supplies\n8. How to maintain consistency\n9. Privacy and emotional safety tips", tools: ["web-search"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "morning-routine": {
    nodes: [
      { id: "input", type: "input", label: "Your Mornings", description: "Understanding your current mornings and goals", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_routines", type: "search", label: "Research Routines", description: "Finding evidence-based morning routines", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`best morning routine ${ctx.latestText.slice(0, 40)}`, `morning routine productivity science`, `morning habits successful people`], maxResults: 5 } },
      { id: "design", type: "ai", label: "Design Your Routine", description: "Creating your ideal morning routine", icon: "🌅", color: "#f5a623", inputs: ["input", "search_routines"], config: { type: "ai", specialistSlug: "fitness-coach", userPromptTemplate: "Design a morning routine for: {{input}}\n\nResearch:\n{{search_routines}}\n\nProvide:\n1. Customized Morning Schedule (Time | Activity | Duration | Purpose)\n2. Wake-up strategy (alarm, light, etc.)\n3. Movement/exercise component\n4. Mindfulness/meditation guide\n5. Nutrition recommendations\n6. Transition plan from current routine\n7. Weekend vs weekday versions\n8. Travel/disruption adaptations\n9. 2-week implementation plan", tools: ["web-search"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "social-skills": {
    nodes: [
      { id: "input", type: "input", label: "Your Goals", description: "Understanding your social skill goals", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_tips", type: "search", label: "Research Techniques", description: "Finding social skill improvement strategies", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`improve social skills ${ctx.latestText.slice(0, 50)}`, `conversation skills tips science`, `social anxiety overcome strategies`], maxResults: 5 } },
      { id: "plan", type: "ai", label: "Build Social Skills Plan", description: "Creating your social skills improvement plan", icon: "🤝", color: "#f5a623", inputs: ["input", "search_tips"], config: { type: "ai", specialistSlug: "mental-wellbeing", userPromptTemplate: "Create a social skills plan for: {{input}}\n\nResearch:\n{{search_tips}}\n\nProvide:\n1. Social Skills Assessment\n2. Conversation starters (15 for different contexts)\n3. Active listening techniques\n4. Body language guide\n5. Small talk → deep conversation transitions\n6. Weekly practice challenges (graduated difficulty)\n7. Handling awkward situations\n8. Online vs in-person strategies\n9. Book and resource recommendations\n10. 30-day confidence building plan", tools: ["web-search"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "dating-profile": {
    nodes: [
      { id: "input", type: "input", label: "About You", description: "Understanding who you are and what you're looking for", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_tips", type: "search", label: "Research What Works", description: "Finding dating profile optimization tips", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`dating profile tips that work ${ctx.today.split(",").pop()?.trim()}`, `best dating app bio examples`, `dating profile photos tips`], maxResults: 5 } },
      { id: "create", type: "ai", label: "Build Your Profile", description: "Creating your optimized dating profile", icon: "💝", color: "#f5a623", inputs: ["input", "search_tips"], config: { type: "ai", specialistSlug: "content-creator", userPromptTemplate: "Optimize a dating profile for: {{input}}\n\nTips:\n{{search_tips}}\n\nProvide:\n1. Bio options (3 different styles: witty, sincere, adventurous)\n2. Profile prompt answers (6 prompts)\n3. Photo strategy and order\n4. App-specific optimization (Hinge vs Bumble vs Tinder)\n5. Conversation starters to use\n6. Red flags to avoid in your profile\n7. First date suggestions\n8. Messaging strategy", tools: ["web-search"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "pet-care-advisor": {
    nodes: [
      { id: "input", type: "input", label: "Your Pet", description: "Understanding your pet's needs", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_care", type: "search", label: "Research Care", description: "Finding pet care best practices", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`${ctx.latestText.slice(0, 50)} care guide`, `${ctx.latestText.slice(0, 40)} health tips`, `${ctx.latestText.slice(0, 30)} nutrition diet best`], maxResults: 5 } },
      { id: "guide", type: "ai", label: "Build Care Guide", description: "Creating your personalized pet care plan", icon: "🐾", color: "#f5a623", inputs: ["input", "search_care"], config: { type: "ai", specialistSlug: "deep-research", userPromptTemplate: "Create a pet care guide for: {{input}}\n\nResearch:\n{{search_care}}\n\nProvide:\n1. Daily Care Schedule\n2. Nutrition guide (diet, portions, treats)\n3. Exercise and enrichment plan\n4. Health checklist (vaccines, checkups)\n5. Grooming schedule\n6. Training tips\n7. Emergency preparedness\n8. Cost estimation (monthly/annual)\n9. Pet-proofing your home\n10. Signs of illness to watch for", tools: ["web-search"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },
};
