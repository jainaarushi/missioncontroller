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

// No demo tasks — start clean for demo users
