import { NextRequest, NextResponse } from "next/server";
import { getTask, getAgent, updateTask as updateMockTask, mockSteps } from "@/lib/mock-data";
import { getAuthUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getUserAIConfig } from "@/lib/ai/get-user-key";
import { getUserToolKeys } from "@/lib/ai/get-tool-keys";
import { getPipeline } from "@/lib/ai/pipelines";
import { getRequiredToolKeys } from "@/lib/ai/tools/registry";
import { getUserMCPServers } from "@/lib/ai/mcp/storage";
import { getAgentMCPRecommendation } from "@/lib/ai/mcp/suggestions";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { getTaskById, updateTaskById } from "@/lib/data/tasks";
import { getAgentById } from "@/lib/data/agents";
import { runMultiAgentPipeline } from "@/app/api/tasks/[id]/run/route";
import type { UserToolKeys } from "@/lib/ai/get-tool-keys";

async function persistTaskUpdate(userId: string, taskId: string, data: Record<string, unknown>) {
  if (isSupabaseEnabled()) {
    await updateTaskById(userId, taskId, data);
  } else {
    updateMockTask(taskId, data);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getAuthUser();
  if (user.isDemo) return NextResponse.json({ error: "Sign in to run AI agents", login: true }, { status: 401 });

  const rl = rateLimit(`rerun:${user.id}`, { maxRequests: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  let fromStep = 0;
  let feedback = "";
  try {
    const body = await request.json();
    fromStep = typeof body.fromStep === "number" ? body.fromStep : 0;
    feedback = typeof body.feedback === "string" ? body.feedback : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Get existing steps
  const existingSteps = mockSteps.get(id);
  if (!existingSteps || existingSteps.length === 0) {
    return NextResponse.json({ error: "No steps found for this task" }, { status: 404 });
  }

  if (fromStep < 0 || fromStep >= existingSteps.length) {
    return NextResponse.json({ error: "Invalid step index" }, { status: 400 });
  }

  // Get task and agent info
  let taskTitle: string;
  let taskDescription: string | null;
  let agentName: string;
  let agentSlug: string;
  let agentSystemPrompt: string;

  if (isSupabaseEnabled()) {
    const task = await getTaskById(user.id, id);
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!task.agent_id) return NextResponse.json({ error: "No agent assigned" }, { status: 400 });
    const agent = await getAgentById(user.id, task.agent_id);
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    taskTitle = task.title;
    taskDescription = task.description;
    agentName = agent.name;
    agentSlug = agent.slug;
    agentSystemPrompt = agent.system_prompt;
  } else {
    const task = getTask(id);
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!task.agent_id) return NextResponse.json({ error: "No agent assigned" }, { status: 400 });
    const agent = getAgent(task.agent_id);
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    taskTitle = task.title;
    taskDescription = task.description;
    agentName = agent.name;
    agentSlug = agent.slug;
    agentSystemPrompt = agent.system_prompt;
  }

  // Append feedback to description if provided
  if (feedback) {
    taskDescription = (taskDescription || "") + `\n\n--- USER FEEDBACK ---\n${feedback}\n--- END FEEDBACK ---`;
  }

  // Get prior context from the step before fromStep
  let priorContext = "";
  for (let i = fromStep - 1; i >= 0; i--) {
    if (existingSteps[i].output) {
      priorContext = existingSteps[i].output!;
      break;
    }
  }

  // Reset steps from fromStep onward
  for (let i = fromStep; i < existingSteps.length; i++) {
    existingSteps[i].status = "pending";
    existingSteps[i].started_at = null;
    existingSteps[i].completed_at = null;
    existingSteps[i].tokens_used = 0;
    existingSteps[i].output = undefined;
  }

  // Update task status to working
  await persistTaskUpdate(user.id, id, {
    status: "working",
    progress: Math.round((fromStep / existingSteps.length) * 100),
    current_step: `Re-running from step ${fromStep + 1}...`,
  });

  // Get AI config
  const aiConfig = await getUserAIConfig(user.id);
  if (!aiConfig) {
    await persistTaskUpdate(user.id, id, { status: "review", current_step: null });
    return NextResponse.json({ error: "Add an API key in Settings to run agents", needsKey: true }, { status: 402 });
  }

  // Get tool keys
  let toolKeys: UserToolKeys = {};
  const pipeline = getPipeline(agentSlug);
  const requiredKeys = getRequiredToolKeys(agentSlug);
  const anyToolsNeeded = pipeline.some(s => s.tools?.length);
  if (requiredKeys.length > 0 || anyToolsNeeded) {
    toolKeys = await getUserToolKeys(user.id);
  }

  // Get MCP config
  const mcpServers = await getUserMCPServers(user.id);
  const configuredServerTypes = mcpServers.filter(s => s.enabled).map(s => s.serverType);
  const mcpRecommendation = getAgentMCPRecommendation(agentSlug, configuredServerTypes);

  // Re-execute pipeline from the specified step
  runMultiAgentPipeline(
    user.id, id, taskTitle, taskDescription,
    [{ pipeline, agentName, agentSlug, systemPrompt: agentSystemPrompt }],
    existingSteps,
    aiConfig.provider, aiConfig.apiKey, toolKeys,
    mcpServers, mcpRecommendation?.settingsHint || null,
    fromStep, priorContext,
  );

  return NextResponse.json({ status: "rerunning", fromStep });
}
