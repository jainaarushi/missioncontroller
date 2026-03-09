import { NextRequest, NextResponse } from "next/server";
import { getTask, getAgent, updateTask as updateMockTask, mockSteps } from "@/lib/mock-data";
import { getAuthUser } from "@/lib/auth";
import { createUserAnthropic, createUserGemini, PROVIDER_MODELS } from "@/lib/ai/client";
import { getUserAIConfig } from "@/lib/ai/get-user-key";
import { calculateCost } from "@/lib/ai/cost";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { getTaskById, updateTaskById } from "@/lib/data/tasks";
import { getAgentById } from "@/lib/data/agents";
import type { TaskStep } from "@/lib/types/task";

// Update task — works in both demo and live mode
async function persistTaskUpdate(userId: string, taskId: string, data: Record<string, unknown>) {
  if (isSupabaseEnabled()) {
    await updateTaskById(userId, taskId, data);
  } else {
    updateMockTask(taskId, data);
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get task and agent from the right source
  let taskTitle: string;
  let taskDescription: string | null;
  let agentId: string | null;
  let agentName: string;
  let agentSlug: string;
  let agentSystemPrompt: string;
  let agentModel: string;

  if (isSupabaseEnabled()) {
    const task = await getTaskById(user.id, id);
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!task.agent_id) return NextResponse.json({ error: "No agent assigned" }, { status: 400 });

    const agent = await getAgentById(user.id, task.agent_id);
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    taskTitle = task.title;
    taskDescription = task.description;
    agentId = task.agent_id;
    agentName = agent.name;
    agentSlug = agent.slug;
    agentSystemPrompt = agent.system_prompt;
    agentModel = agent.model;
  } else {
    const task = getTask(id);
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!task.agent_id) return NextResponse.json({ error: "No agent assigned" }, { status: 400 });

    const agent = getAgent(task.agent_id);
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    taskTitle = task.title;
    taskDescription = task.description;
    agentId = task.agent_id;
    agentName = agent.name;
    agentSlug = agent.slug;
    agentSystemPrompt = agent.system_prompt;
    agentModel = agent.model;
  }

  const steps: TaskStep[] = [
    { id: `s-${id}-1`, task_id: id, step_number: 1, description: `${agentName} is analyzing the task`, status: "working", started_at: new Date().toISOString(), completed_at: null, tokens_used: 0 },
    { id: `s-${id}-2`, task_id: id, step_number: 2, description: "Generating output", status: "pending", started_at: null, completed_at: null, tokens_used: 0 },
    { id: `s-${id}-3`, task_id: id, step_number: 3, description: "Finalizing results", status: "pending", started_at: null, completed_at: null, tokens_used: 0 },
  ];
  mockSteps.set(id, steps);

  await persistTaskUpdate(user.id, id, {
    status: "working",
    progress: 5,
    started_at: new Date().toISOString(),
    current_step: `${agentName} is analyzing the task`,
  });

  // Check for user's AI config (Anthropic or Gemini)
  const aiConfig = await getUserAIConfig(user.id);

  if (aiConfig) {
    runAgent(user.id, id, taskTitle, taskDescription, agentName, agentSystemPrompt, steps, aiConfig.provider, aiConfig.apiKey);
  } else {
    simulateAgent(user.id, id, agentName, steps);
  }

  return NextResponse.json({ status: "started" });
}

// ── Real Execution ──────────────────────────────────────────

async function runAgent(
  userId: string,
  taskId: string,
  title: string,
  description: string | null,
  agentName: string,
  systemPrompt: string,
  steps: TaskStep[],
  provider: "anthropic" | "gemini",
  apiKey: string,
) {
  const startTime = Date.now();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // Create the right AI model based on provider
  const modelId = PROVIDER_MODELS[provider].default;
  const aiModel = provider === "anthropic"
    ? createUserAnthropic(apiKey)(modelId)
    : createUserGemini(apiKey)(modelId);

  try {
    steps[0].status = "done";
    steps[0].completed_at = new Date().toISOString();
    steps[1].status = "working";
    steps[1].started_at = new Date().toISOString();
    await persistTaskUpdate(userId, taskId, { progress: 30, current_step: `${agentName} is generating output` });

    const userMessage = description
      ? `Task: ${title}\n\nDetails: ${description}\n\nToday's date: ${today}`
      : `Task: ${title}\n\nToday's date: ${today}`;

    const { generateText } = await import("ai");
    const result = await generateText({
      model: aiModel,
      system: systemPrompt,
      prompt: userMessage,
    });

    steps[1].status = "done";
    steps[1].completed_at = new Date().toISOString();
    steps[2].status = "working";
    steps[2].started_at = new Date().toISOString();
    await persistTaskUpdate(userId, taskId, { progress: 85, current_step: "Finalizing results" });

    steps[2].status = "done";
    steps[2].completed_at = new Date().toISOString();

    const usage = result.usage as { promptTokens?: number; completionTokens?: number } | undefined;
    const tokensIn = usage?.promptTokens || 0;
    const tokensOut = usage?.completionTokens || 0;
    const cost = provider === "gemini" ? 0 : calculateCost(tokensIn, tokensOut, modelId);
    const duration = Math.round((Date.now() - startTime) / 1000);

    await persistTaskUpdate(userId, taskId, {
      status: "review",
      progress: 100,
      output: result.text,
      cost_usd: cost,
      tokens_in: tokensIn,
      tokens_out: tokensOut,
      duration_seconds: duration,
      current_step: "Complete — ready for your review",
    });
  } catch (error) {
    console.error("Agent execution failed:", error);
    steps.forEach((s) => {
      if (s.status === "working" || s.status === "pending") s.status = "failed";
    });

    await persistTaskUpdate(userId, taskId, {
      status: "failed",
      progress: 0,
      current_step: `Failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      output: `## Error\n\n${agentName} encountered an error.\n\n\`\`\`\n${error instanceof Error ? error.message : "Unknown error"}\n\`\`\`\n\nPlease check your API key in Settings and try again.`,
    });
  }
}

// ── Demo Mode ───────────────────────────────────────────────

async function simulateAgent(userId: string, taskId: string, agentName: string, steps: TaskStep[]) {
  await delay(1000);
  steps[0].status = "done";
  steps[0].completed_at = new Date().toISOString();
  steps[1].status = "working";
  steps[1].started_at = new Date().toISOString();
  await persistTaskUpdate(userId, taskId, { progress: 40, current_step: "Generating output" });

  await delay(2000);
  steps[1].status = "done";
  steps[1].completed_at = new Date().toISOString();
  steps[2].status = "working";
  steps[2].started_at = new Date().toISOString();
  await persistTaskUpdate(userId, taskId, { progress: 80, current_step: "Finalizing results" });

  await delay(1000);
  steps[2].status = "done";
  steps[2].completed_at = new Date().toISOString();

  await persistTaskUpdate(userId, taskId, {
    status: "review",
    progress: 100,
    output: `# Demo Mode\n\nThis is a simulated response. To get real AI-powered results:\n\n1. Go to **Settings**\n2. Add your **Anthropic API key**\n3. Run this task again\n\n${agentName} will use Claude to generate real output.\n\n> Get your API key at [console.anthropic.com](https://console.anthropic.com)`,
    cost_usd: 0,
    tokens_in: 0,
    tokens_out: 0,
    duration_seconds: 4,
    current_step: "Complete — add API key in Settings for real output",
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
