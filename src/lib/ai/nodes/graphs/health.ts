import type { PipelineGraph } from "../types";

export const HEALTH_GRAPHS: Record<string, PipelineGraph> = {
  "medical-bill-auditor": {
    nodes: [
      { id: "input", type: "input", label: "Your Medical Bill", description: "Reviewing your medical bill details", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_costs", type: "search", label: "Research Fair Prices", description: "Finding fair market prices for procedures", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`fair price ${ctx.latestText.slice(0, 50)} medical procedure`, `medical bill negotiation tips`, `hospital bill errors common overcharges`], maxResults: 6 } },
      { id: "audit", type: "ai", label: "Audit Your Bill", description: "Identifying errors and overcharges", icon: "🔍", color: "#f472b6", inputs: ["input", "search_costs"], config: { type: "ai", specialistSlug: "data-analyst", userPromptTemplate: "Audit this medical bill: {{input}}\n\nFair price research:\n{{search_costs}}\n\nProvide:\n1. Line-by-Line Audit Table (Item | Billed Amount | Fair Price | Flag | Action)\n2. Common billing errors found\n3. Items to dispute\n4. Negotiation script for the billing department\n5. Financial assistance programs\n6. Payment plan negotiation tips\n7. Appeal letter template\n8. Estimated savings after negotiation", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "insurance-comparer": {
    nodes: [
      { id: "input", type: "input", label: "Your Coverage Needs", description: "Understanding your insurance needs", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_plans", type: "search", label: "Research Plans", description: "Finding insurance plan options", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`best ${ctx.latestText.slice(0, 40)} insurance plans ${ctx.today.split(",").pop()?.trim()}`, `${ctx.latestText.slice(0, 30)} insurance comparison`, `health insurance marketplace plans`], maxResults: 6 } },
      { id: "compare", type: "ai", label: "Compare & Recommend", description: "Comparing plans and recommending the best fit", icon: "📊", color: "#4ade80", inputs: ["input", "search_plans"], config: { type: "ai", specialistSlug: "data-analyst", userPromptTemplate: "Compare insurance options for: {{input}}\n\nPlans research:\n{{search_plans}}\n\nProvide:\n1. Plan Comparison Table (Plan | Premium | Deductible | OOP Max | Network | Rating)\n2. Best for your situation (and why)\n3. Total annual cost analysis for each\n4. Network coverage check\n5. Prescription coverage comparison\n6. Hidden costs and gotchas\n7. Enrollment deadlines and steps\n8. When to choose HSA-eligible vs traditional", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "symptom-researcher": {
    nodes: [
      { id: "input", type: "input", label: "Your Symptoms", description: "Documenting your symptoms", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_info", type: "search", label: "Research Symptoms", description: "Finding medical information about your symptoms", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`${ctx.latestText.slice(0, 50)} symptoms causes treatment`, `when to see doctor ${ctx.latestText.slice(0, 30)}`, `${ctx.latestText.slice(0, 40)} home remedies`], maxResults: 6 } },
      { id: "analyze", type: "ai", label: "Symptom Analysis", description: "Analyzing possible causes and next steps", icon: "🏥", color: "#f472b6", inputs: ["input", "search_info"], config: { type: "ai", specialistSlug: "deep-research", userPromptTemplate: "Research these symptoms: {{input}}\n\nMedical info:\n{{search_info}}\n\nProvide:\n1. Possible Conditions Table (Condition | Likelihood | Severity | Key Indicator)\n2. When to seek emergency care (red flags)\n3. Questions to ask your doctor\n4. Home care options\n5. OTC treatment suggestions\n6. Lifestyle factors to consider\n7. Specialist referral suggestions\n8. IMPORTANT DISCLAIMER: This is for informational purposes only. Always consult a healthcare professional for medical advice.", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "prescription-saver": {
    nodes: [
      { id: "input", type: "input", label: "Your Prescriptions", description: "Listing your current medications", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_prices", type: "search", label: "Compare Prices", description: "Finding the best prescription prices", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`${ctx.latestText.slice(0, 50)} prescription price comparison`, `prescription discount programs GoodRx`, `generic alternative ${ctx.latestText.slice(0, 30)}`], maxResults: 6 } },
      { id: "save", type: "ai", label: "Find Savings", description: "Identifying ways to save on every prescription", icon: "💊", color: "#4ade80", inputs: ["input", "search_prices"], config: { type: "ai", specialistSlug: "deep-research", userPromptTemplate: "Find savings for these prescriptions: {{input}}\n\nPrice research:\n{{search_prices}}\n\nProvide:\n1. Medication Savings Table (Drug | Current Cost | Best Price Found | Savings | Where)\n2. Generic alternatives for each\n3. Discount programs and coupons\n4. Mail-order pharmacy options\n5. Patient assistance programs\n6. Insurance formulary tips\n7. Pill splitting opportunities\n8. Total estimated annual savings\n9. Disclaimer: always consult your doctor before switching medications", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "meal-prep-planner": {
    nodes: [
      { id: "input", type: "input", label: "Your Diet Goals", description: "Understanding your dietary needs and goals", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_recipes", type: "search", label: "Find Recipes", description: "Searching for healthy meal prep recipes", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`meal prep recipes ${ctx.latestText.slice(0, 50)}`, `healthy ${ctx.latestText.slice(0, 30)} weekly meal plan`, `budget meal prep ideas`], maxResults: 6 } },
      { id: "plan", type: "ai", label: "Build Meal Plan", description: "Creating your weekly meal prep plan", icon: "🥗", color: "#4ade80", inputs: ["input", "search_recipes"], config: { type: "ai", specialistSlug: "recipe-planner", userPromptTemplate: "Create a meal prep plan for: {{input}}\n\nRecipes found:\n{{search_recipes}}\n\nProvide:\n1. Weekly Meal Plan Table (Day | Breakfast | Lunch | Dinner | Snacks | Calories)\n2. Complete grocery list with estimated costs\n3. Prep day schedule (Sunday prep)\n4. Nutrition breakdown (macros per day)\n5. Storage and reheating instructions\n6. Meal prep tips for efficiency\n7. Substitution options\n8. Estimated weekly grocery cost", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "sleep-optimizer": {
    nodes: [
      { id: "input", type: "input", label: "Your Sleep Issues", description: "Understanding your sleep patterns", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_tips", type: "search", label: "Research Solutions", description: "Finding evidence-based sleep improvement strategies", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`improve sleep quality ${ctx.latestText.slice(0, 40)}`, `sleep hygiene tips evidence based`, `best sleep routine ${ctx.latestText.slice(0, 30)}`], maxResults: 5 } },
      { id: "plan", type: "ai", label: "Build Sleep Plan", description: "Creating your personalized sleep optimization plan", icon: "😴", color: "#818cf8", inputs: ["input", "search_tips"], config: { type: "ai", specialistSlug: "fitness-coach", userPromptTemplate: "Create a sleep optimization plan for: {{input}}\n\nResearch:\n{{search_tips}}\n\nProvide:\n1. Sleep Assessment\n2. Optimized bedtime routine (step by step)\n3. Environment optimization checklist\n4. Diet and exercise timing guide\n5. Screen time and blue light strategy\n6. Supplements to consider (with evidence levels)\n7. 2-week improvement plan\n8. When to see a sleep specialist\n9. Sleep tracking recommendations", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "therapy-finder": {
    nodes: [
      { id: "input", type: "input", label: "Your Needs", description: "Understanding what kind of support you need", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_options", type: "search", label: "Find Therapists", description: "Searching for therapy options near you", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`find therapist ${ctx.latestText.slice(0, 50)}`, `online therapy platforms comparison ${ctx.today.split(",").pop()?.trim()}`, `affordable therapy options ${ctx.latestText.slice(0, 30)}`], maxResults: 6 } },
      { id: "guide", type: "ai", label: "Therapy Guide", description: "Creating your therapy search guide", icon: "💚", color: "#4ade80", inputs: ["input", "search_options"], config: { type: "ai", specialistSlug: "mental-wellbeing", userPromptTemplate: "Create a therapy finding guide for: {{input}}\n\nOptions found:\n{{search_options}}\n\nProvide:\n1. Recommended therapy types for your needs\n2. Online platform comparison table\n3. Insurance coverage guidance\n4. Questions to ask potential therapists\n5. What to expect in first session\n6. Affordable alternatives (sliding scale, community centers)\n7. Crisis resources\n8. Self-care strategies while waiting", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "supplement-advisor": {
    nodes: [
      { id: "input", type: "input", label: "Your Health Goals", description: "Understanding your supplement needs", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_evidence", type: "search", label: "Research Evidence", description: "Finding scientific evidence for supplements", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`${ctx.latestText.slice(0, 50)} supplements evidence based`, `best supplements ${ctx.latestText.slice(0, 30)} research`, `supplement interactions safety`], maxResults: 6 } },
      { id: "recommend", type: "ai", label: "Build Supplement Plan", description: "Creating your evidence-based supplement guide", icon: "💊", color: "#4ade80", inputs: ["input", "search_evidence"], config: { type: "ai", specialistSlug: "deep-research", userPromptTemplate: "Create a supplement guide for: {{input}}\n\nEvidence:\n{{search_evidence}}\n\nProvide:\n1. Recommended Supplements Table (Supplement | Dose | Evidence Level | Benefits | Risks)\n2. Evidence quality rating for each (A/B/C/D)\n3. Interaction warnings\n4. Best time to take each\n5. Quality brands to look for\n6. Supplements to avoid (hype vs evidence)\n7. Diet-first alternatives\n8. Disclaimer: consult your doctor before starting supplements", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },

  "allergy-navigator": {
    nodes: [
      { id: "input", type: "input", label: "Your Allergies", description: "Understanding your allergy situation", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      { id: "search_info", type: "search", label: "Research Allergens", description: "Finding allergy management information", icon: "🔍", color: "#3b82f6", inputs: ["input"], config: { type: "search", queries: (ctx) => [`${ctx.latestText.slice(0, 50)} allergy management tips`, `allergy-free alternatives ${ctx.latestText.slice(0, 30)}`, `allergy treatment options ${ctx.today.split(",").pop()?.trim()}`], maxResults: 5 } },
      { id: "guide", type: "ai", label: "Allergy Management Plan", description: "Creating your allergy management guide", icon: "🤧", color: "#f472b6", inputs: ["input", "search_info"], config: { type: "ai", specialistSlug: "deep-research", userPromptTemplate: "Create an allergy management plan for: {{input}}\n\nResearch:\n{{search_info}}\n\nProvide:\n1. Allergen avoidance strategy\n2. Safe alternatives and substitutes\n3. Label reading guide\n4. Restaurant dining tips\n5. Emergency action plan\n6. Medication options (OTC and prescription)\n7. When to see an allergist\n8. Allergy-friendly product recommendations\n9. Seasonal management calendar\n10. Disclaimer: consult your allergist for medical advice", tools: ["web-search", "calculator"] } },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },
};
