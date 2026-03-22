import { PRESET_AGENTS } from "@/seed/agents";
import type { Agent } from "@/lib/types/agent";
import type { TaskWithAgent, TaskStep } from "@/lib/types/task";

// Generate stable UUIDs for all agents
function generateAgentId(index: number): string {
  return `a1000000-0000-0000-0000-${String(index + 1).padStart(12, "0")}`;
}

const DEMO_USER_ID = "u1000000-0000-0000-0000-000000000001";

// Create agent objects from presets
export const mockAgents: Agent[] = PRESET_AGENTS.map((preset, i) => ({
  id: generateAgentId(i),
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

// ─── Step Store: bounded, TTL-evicting, snapshot-safe ───
const STEP_TTL_MS = 30 * 60 * 1000; // 30 minutes
const STEP_MAX_ENTRIES = 200;

interface StepEntry {
  steps: TaskStep[];
  createdAt: number;
}

const _stepStore = new Map<string, StepEntry>();

function evictStaleSteps() {
  if (_stepStore.size <= STEP_MAX_ENTRIES) return;
  const now = Date.now();
  for (const [id, entry] of _stepStore) {
    if (now - entry.createdAt > STEP_TTL_MS) {
      _stepStore.delete(id);
    }
  }
  // If still over limit, remove oldest entries
  if (_stepStore.size > STEP_MAX_ENTRIES) {
    const sorted = [..._stepStore.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt);
    const toRemove = sorted.slice(0, _stepStore.size - STEP_MAX_ENTRIES);
    for (const [id] of toRemove) _stepStore.delete(id);
  }
}

/** Set live steps for a task (used by run route during execution). */
export function setMockSteps(taskId: string, steps: TaskStep[]) {
  evictStaleSteps();
  _stepStore.set(taskId, { steps, createdAt: Date.now() });
}

/** Get a deep-copy snapshot of steps (safe for serialization, no reference leaks). */
export function getMockStepsSnapshot(taskId: string): TaskStep[] | null {
  const entry = _stepStore.get(taskId);
  if (!entry) return null;
  return entry.steps.map(s => ({ ...s }));
}

/** Get the live mutable steps array (only for the run route to mutate in-place). */
export function getMockStepsLive(taskId: string): TaskStep[] | null {
  const entry = _stepStore.get(taskId);
  return entry ? entry.steps : null;
}

/** Remove steps for a task. */
export function deleteMockSteps(taskId: string) {
  _stepStore.delete(taskId);
}

// ─── In-memory API key store (for local/demo mode without Supabase) ───
interface MockUserKeys {
  ai_provider: string;
  openai_api_key: string | null;
  gemini_api_key: string | null;
  anthropic_api_key: string | null;
  wispr_api_key: string | null;
  tavily_api_key: string | null;
  firecrawl_api_key: string | null;
  serp_api_key: string | null;
}

const _userKeys = new Map<string, MockUserKeys>();

function getOrCreateUserKeys(userId: string): MockUserKeys {
  if (!_userKeys.has(userId)) {
    _userKeys.set(userId, {
      ai_provider: "openai",
      openai_api_key: null,
      gemini_api_key: null,
      anthropic_api_key: null,
      wispr_api_key: null,
      tavily_api_key: null,
      firecrawl_api_key: null,
      serp_api_key: null,
    });
  }
  return _userKeys.get(userId)!;
}

export function getMockUserKeys(userId: string): MockUserKeys {
  return getOrCreateUserKeys(userId);
}

export function setMockUserKey(userId: string, column: string, value: string | null) {
  const keys = getOrCreateUserKeys(userId);
  if (column in keys) {
    (keys as unknown as Record<string, string | null>)[column] = value;
  }
}

export function setMockAIProvider(userId: string, provider: string) {
  const keys = getOrCreateUserKeys(userId);
  keys.ai_provider = provider;
}

// ─── Running tasks lock: prevents concurrent pipeline runs on the same task ───
const _runningTasks = new Set<string>();

export function markTaskRunning(taskId: string): boolean {
  if (_runningTasks.has(taskId)) return false; // already running
  _runningTasks.add(taskId);
  return true;
}

export function markTaskDone(taskId: string) {
  _runningTasks.delete(taskId);
}


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

let agentIdCounter = PRESET_AGENTS.length + 1;

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
    slug: agent.slug,
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
  deleteMockSteps(id);
  return true;
}

// Seed demo tasks so new users see a realistic workspace
function seedDemoTasks() {
  const contentCreator = mockAgents.find((a) => a.slug === "content-creator");
  const deepResearch = mockAgents.find((a) => a.slug === "deep-research");
  const dataAnalyst = mockAgents.find((a) => a.slug === "data-analyst");

  const demoTasks: Array<{
    title: string;
    status: "review" | "working" | "todo";
    agent: typeof mockAgents[0] | undefined;
    cost: number;
    tokensIn: number;
    tokensOut: number;
    progress: number;
    currentStep: string | null;
    priority: "urgent" | "high" | "normal" | "low";
  }> = [
    {
      title: "Write a blog post about AI productivity tools",
      status: "review",
      agent: contentCreator,
      cost: 0.0847,
      tokensIn: 6240,
      tokensOut: 1890,
      progress: 100,
      currentStep: null,
      priority: "high",
    },
    {
      title: "Research competitor pricing strategies for Q2",
      status: "review",
      agent: deepResearch,
      cost: 0.0623,
      tokensIn: 4120,
      tokensOut: 1340,
      progress: 100,
      currentStep: null,
      priority: "normal",
    },
    {
      title: "Analyze last month's user engagement metrics",
      status: "working",
      agent: dataAnalyst,
      cost: 0.0377,
      tokensIn: 2120,
      tokensOut: 690,
      progress: 64,
      currentStep: "Crunching the numbers…",
      priority: "normal",
    },
  ];

  for (const dt of demoTasks) {
    const id = `t${String(taskIdCounter++).padStart(8, "0")}`;
    const task: TaskWithAgent = {
      id,
      user_id: DEMO_USER_ID,
      agent_id: dt.agent?.id || null,
      title: dt.title,
      description: null,
      status: dt.status,
      progress: dt.progress,
      current_step: dt.currentStep,
      output: dt.status === "review" ? "Sample output — click to review the full result." : null,
      output_format: "markdown",
      cost_usd: dt.cost,
      tokens_in: dt.tokensIn,
      tokens_out: dt.tokensOut,
      duration_seconds: 0,
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      completed_at: dt.status === "review" ? new Date().toISOString() : null,
      section: "today",
      sort_order: mockTasks.length,
      priority: dt.priority,
      agent: dt.agent
        ? { id: dt.agent.id, name: dt.agent.name, slug: dt.agent.slug, icon: dt.agent.icon, color: dt.agent.color, gradient: dt.agent.gradient }
        : null,
    };
    mockTasks.push(task);
  }
}

seedDemoTasks();
