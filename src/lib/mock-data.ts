import { PRESET_AGENTS } from "@/seed/agents";
import type { Agent } from "@/lib/types/agent";
import type { TaskWithAgent, TaskStep } from "@/lib/types/task";

// Generate stable UUIDs for agents
const AGENT_IDS = [
  "a1000000-0000-0000-0000-000000000001",
  "a1000000-0000-0000-0000-000000000002",
  "a1000000-0000-0000-0000-000000000003",
  "a1000000-0000-0000-0000-000000000004",
  "a1000000-0000-0000-0000-000000000005",
  "a1000000-0000-0000-0000-000000000006",
  "a1000000-0000-0000-0000-000000000007",
  "a1000000-0000-0000-0000-000000000008",
  "a1000000-0000-0000-0000-000000000009",
  "a1000000-0000-0000-0000-000000000010",
  "a1000000-0000-0000-0000-000000000011",
  "a1000000-0000-0000-0000-000000000012",
];

const DEMO_USER_ID = "u1000000-0000-0000-0000-000000000001";

// Create agent objects from presets
export const mockAgents: Agent[] = PRESET_AGENTS.map((preset, i) => ({
  id: AGENT_IDS[i],
  user_id: DEMO_USER_ID,
  name: preset.name,
  slug: preset.slug,
  description: preset.description,
  long_description: preset.long_description,
  icon: preset.icon,
  color: preset.color,
  gradient: preset.gradient,
  system_prompt: preset.system_prompt,
  model: preset.model,
  tools: [],
  is_preset: true,
  is_public: false,
  tasks_completed: 0,
  avg_duration_seconds: 0,
  created_at: new Date().toISOString(),
}));

// In-memory task store
let taskIdCounter = 1;
export const mockTasks: TaskWithAgent[] = [];
export const mockSteps: Map<string, TaskStep[]> = new Map();

export function createMockTask(title: string, section: string = "today", priority: string = "normal"): TaskWithAgent {
  const id = `t${String(taskIdCounter++).padStart(8, "0")}`;
  const task: TaskWithAgent = {
    id,
    user_id: DEMO_USER_ID,
    agent_id: null,
    title,
    description: null,
    status: "todo",
    progress: 0,
    current_step: null,
    output: null,
    output_format: "markdown",
    cost_usd: 0,
    tokens_in: 0,
    tokens_out: 0,
    duration_seconds: 0,
    created_at: new Date().toISOString(),
    started_at: null,
    completed_at: null,
    section: section as "today" | "week" | "later",
    sort_order: mockTasks.length,
    priority: priority as "urgent" | "high" | "normal" | "low",
    agent: null,
  };
  mockTasks.unshift(task);
  return task;
}

let agentIdCounter = 13;

export function createMockAgent(data: {
  name: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  icon: string;
  color: string;
  gradient: string;
  system_prompt: string;
  model: string;
}): Agent {
  const id = `a1000000-0000-0000-0000-${String(agentIdCounter++).padStart(12, "0")}`;
  const agent: Agent = {
    id,
    user_id: DEMO_USER_ID,
    name: data.name,
    slug: data.slug,
    description: data.description,
    long_description: data.long_description,
    icon: data.icon,
    color: data.color,
    gradient: data.gradient,
    system_prompt: data.system_prompt,
    model: data.model,
    tools: [],
    is_preset: false,
    is_public: false,
    tasks_completed: 0,
    avg_duration_seconds: 0,
    created_at: new Date().toISOString(),
  };
  mockAgents.push(agent);
  return agent;
}

export function deleteAgent(id: string): boolean {
  const idx = mockAgents.findIndex((a) => a.id === id);
  if (idx === -1 || mockAgents[idx].is_preset) return false;
  mockAgents.splice(idx, 1);
  return true;
}

export function getAgent(id: string): Agent | undefined {
  return mockAgents.find((a) => a.id === id);
}

export function getAgentSummary(id: string) {
  const agent = getAgent(id);
  if (!agent) return null;
  return {
    id: agent.id,
    name: agent.name,
    icon: agent.icon,
    color: agent.color,
    gradient: agent.gradient,
  };
}

export function getTask(id: string): TaskWithAgent | undefined {
  return mockTasks.find((t) => t.id === id);
}

export function updateTask(id: string, updates: Partial<TaskWithAgent>) {
  const idx = mockTasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  mockTasks[idx] = { ...mockTasks[idx], ...updates };
  // Keep agent reference in sync
  if (updates.agent_id !== undefined) {
    mockTasks[idx].agent = updates.agent_id ? getAgentSummary(updates.agent_id) : null;
  }
  return mockTasks[idx];
}

export function deleteTask(id: string) {
  const idx = mockTasks.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  mockTasks.splice(idx, 1);
  mockSteps.delete(id);
  return true;
}

// Seed demo tasks matching v2 design
createMockTask("Research the top 5 AI agent startups that raised Series A in 2025");
const t1 = mockTasks[0];
t1.agent_id = AGENT_IDS[0];
t1.agent = getAgentSummary(AGENT_IDS[0]);
t1.status = "review";
t1.priority = "high";
t1.progress = 100;
t1.cost_usd = 0.14;
t1.tokens_in = 1245;
t1.tokens_out = 3890;
t1.duration_seconds = 18;
t1.output = `**Top 5 AI Agent Startups — Series A in 2025:**

1. **CrewAI** — $18M (Insight Partners). Multi-agent orchestration. 60% of Fortune 500.

2. **Emergence AI** — $97.2M. Agent operating system for enterprise workflows.

3. **Relevance AI** — $15M. No-code AI workforce platform. 200+ customers.

4. **Letta** — $10M. Stateful agents with long-term memory. 30K+ GitHub stars.

5. **Vectara** — $25M. RAG-powered enterprise search agents.

**Key insight:** Multi-agent coordination dominates, open-source is the primary GTM strategy.`;
mockSteps.set(t1.id, [
  { id: "s1", task_id: t1.id, step_number: 1, description: "Searched for AI agent startups with Series A", status: "done", started_at: t1.created_at, completed_at: t1.created_at, tokens_used: 312 },
  { id: "s2", task_id: t1.id, step_number: 2, description: "Found 23 companies, filtering top 5", status: "done", started_at: t1.created_at, completed_at: t1.created_at, tokens_used: 890 },
  { id: "s3", task_id: t1.id, step_number: 3, description: "Researched product, team, and traction", status: "done", started_at: t1.created_at, completed_at: t1.created_at, tokens_used: 2100 },
  { id: "s4", task_id: t1.id, step_number: 4, description: "Compiled comparison matrix", status: "done", started_at: t1.created_at, completed_at: t1.created_at, tokens_used: 588 },
]);

createMockTask("Draft a cold outreach email to VPs of Engineering about Cadre");
const t2 = mockTasks[0];
t2.agent_id = AGENT_IDS[1];
t2.agent = getAgentSummary(AGENT_IDS[1]);
t2.status = "working";
t2.progress = 58;
t2.current_step = "Writing first draft with personalization";
t2.cost_usd = 0.08;
t2.started_at = new Date().toISOString();
mockSteps.set(t2.id, [
  { id: "s5", task_id: t2.id, step_number: 1, description: "Analyzed target persona", status: "done", started_at: t2.created_at, completed_at: t2.created_at, tokens_used: 200 },
  { id: "s6", task_id: t2.id, step_number: 2, description: "Studied 5 high-performing cold emails", status: "done", started_at: t2.created_at, completed_at: t2.created_at, tokens_used: 450 },
  { id: "s7", task_id: t2.id, step_number: 3, description: "Writing first draft with personalization", status: "working", started_at: t2.created_at, completed_at: null, tokens_used: 0 },
  { id: "s8", task_id: t2.id, step_number: 4, description: "Polish and create subject line variants", status: "pending", started_at: null, completed_at: null, tokens_used: 0 },
]);

createMockTask("Analyze website conversion funnel for last 30 days");
const t3 = mockTasks[0];
t3.agent_id = AGENT_IDS[2];
t3.agent = getAgentSummary(AGENT_IDS[2]);
t3.status = "working";
t3.progress = 34;
t3.current_step = "Pulling 30-day traffic and conversion data";
t3.started_at = new Date().toISOString();
t3.cost_usd = 0.03;
mockSteps.set(t3.id, [
  { id: "s9", task_id: t3.id, step_number: 1, description: "Connected to analytics data", status: "done", started_at: t3.created_at, completed_at: t3.created_at, tokens_used: 120 },
  { id: "s10", task_id: t3.id, step_number: 2, description: "Pulling 30-day traffic and conversion data", status: "working", started_at: t3.created_at, completed_at: null, tokens_used: 0 },
  { id: "s11", task_id: t3.id, step_number: 3, description: "Calculate trends and anomalies", status: "pending", started_at: null, completed_at: null, tokens_used: 0 },
  { id: "s12", task_id: t3.id, step_number: 4, description: "Generate insights report", status: "pending", started_at: null, completed_at: null, tokens_used: 0 },
]);

createMockTask("Prepare talking points for investor call tomorrow");
mockTasks[0].priority = "urgent";
createMockTask("Review and respond to partnership inquiry emails");
createMockTask("Plan content calendar for March");

// Done tasks
createMockTask("Summarize product feedback from Slack");
const td1 = mockTasks[0];
td1.agent_id = AGENT_IDS[0];
td1.agent = getAgentSummary(AGENT_IDS[0]);
td1.status = "done";
td1.progress = 100;
td1.cost_usd = 0.05;
td1.completed_at = new Date().toISOString();

createMockTask("Write changelog for v1.9 release");
const td2 = mockTasks[0];
td2.agent_id = AGENT_IDS[1];
td2.agent = getAgentSummary(AGENT_IDS[1]);
td2.status = "done";
td2.progress = 100;
td2.cost_usd = 0.11;
td2.completed_at = new Date().toISOString();

createMockTask("Daily KPI summary report");
const td3 = mockTasks[0];
td3.agent_id = AGENT_IDS[2];
td3.agent = getAgentSummary(AGENT_IDS[2]);
td3.status = "done";
td3.progress = 100;
td3.cost_usd = 0.02;
td3.completed_at = new Date().toISOString();
