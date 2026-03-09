import { NextRequest, NextResponse } from "next/server";
import { getTask, getAgent, updateTask, mockSteps } from "@/lib/mock-data";
import { getAuthUser } from "@/lib/auth";
import { createUserAnthropic } from "@/lib/ai/client";
import { getUserAnthropicKey } from "@/lib/ai/get-user-key";
import { calculateCost } from "@/lib/ai/cost";
import type { TaskStep } from "@/lib/types/task";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const task = getTask(id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!task.agent_id) return NextResponse.json({ error: "No agent assigned" }, { status: 400 });

  const agent = getAgent(task.agent_id);
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  // Set to working
  updateTask(id, {
    status: "working",
    progress: 5,
    started_at: new Date().toISOString(),
    current_step: `${agent.name} is analyzing the task`,
  });

  // Create steps
  const steps: TaskStep[] = [
    { id: `s-${id}-1`, task_id: id, step_number: 1, description: `${agent.name} is analyzing the task`, status: "working", started_at: new Date().toISOString(), completed_at: null, tokens_used: 0 },
    { id: `s-${id}-2`, task_id: id, step_number: 2, description: "Gathering relevant information", status: "pending", started_at: null, completed_at: null, tokens_used: 0 },
    { id: `s-${id}-3`, task_id: id, step_number: 3, description: "Processing and generating output", status: "pending", started_at: null, completed_at: null, tokens_used: 0 },
    { id: `s-${id}-4`, task_id: id, step_number: 4, description: "Finalizing results", status: "pending", started_at: null, completed_at: null, tokens_used: 0 },
  ];
  mockSteps.set(id, steps);

  // Check if the user has their own Anthropic API key
  const user = await getAuthUser();
  let userApiKey: string | null = null;
  if (user) {
    userApiKey = await getUserAnthropicKey(user.id);
  }

  if (userApiKey) {
    const anthropic = createUserAnthropic(userApiKey);
    executeWithAI(id, task.title, task.description, agent.name, agent.system_prompt, agent.model, steps, anthropic);
  } else {
    simulateAgentWork(id, agent.name, steps);
  }

  return NextResponse.json({ status: "started" });
}

// ── Real AI Execution (using user's own key) ────────────────

async function executeWithAI(
  taskId: string,
  title: string,
  description: string | null,
  agentName: string,
  systemPrompt: string,
  model: string,
  steps: TaskStep[],
  anthropic: ReturnType<typeof createUserAnthropic>
) {
  const startTime = Date.now();

  try {
    // Step 1: Analyzing
    steps[0].status = "done";
    steps[0].completed_at = new Date().toISOString();
    steps[0].tokens_used = 0;
    steps[1].status = "working";
    steps[1].started_at = new Date().toISOString();
    updateTask(taskId, { progress: 20, current_step: "Gathering relevant information" });

    // Step 2: Mark as processing
    steps[1].status = "done";
    steps[1].completed_at = new Date().toISOString();
    steps[2].status = "working";
    steps[2].started_at = new Date().toISOString();
    updateTask(taskId, { progress: 40, current_step: `${agentName} is generating output` });

    // Build the prompt
    const userMessage = description
      ? `Task: ${title}\n\nDetails: ${description}`
      : `Task: ${title}`;

    // Call Claude API using the user's own key
    const { generateText } = await import("ai");
    const result = await generateText({
      model: anthropic(model),
      system: systemPrompt,
      prompt: userMessage,
    });

    // Step 3: Done processing
    const usage = result.usage as { totalTokens?: number; promptTokens?: number; completionTokens?: number } | undefined;
    steps[2].status = "done";
    steps[2].completed_at = new Date().toISOString();
    steps[2].tokens_used = (usage?.totalTokens || 0);
    steps[3].status = "working";
    steps[3].started_at = new Date().toISOString();
    updateTask(taskId, { progress: 85, current_step: "Finalizing results" });

    // Step 4: Finalize
    steps[3].status = "done";
    steps[3].completed_at = new Date().toISOString();

    const tokensIn = usage?.promptTokens || 0;
    const tokensOut = usage?.completionTokens || 0;
    const cost = calculateCost(tokensIn, tokensOut, model);
    const duration = Math.round((Date.now() - startTime) / 1000);

    updateTask(taskId, {
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
    console.error("AI execution failed:", error);

    steps.forEach((s) => {
      if (s.status === "working" || s.status === "pending") {
        s.status = "failed";
      }
    });

    updateTask(taskId, {
      status: "failed",
      progress: 0,
      current_step: `Failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      output: `## Error\n\n${agentName} encountered an error while processing this task.\n\n\`\`\`\n${error instanceof Error ? error.message : "Unknown error"}\n\`\`\`\n\nPlease check your API key in Settings and try again.`,
    });
  }
}

// ── Mock Simulation (when no API key) ───────────────────────

async function simulateAgentWork(taskId: string, agentName: string, steps: TaskStep[]) {
  const task = getTask(taskId);
  if (!task) return;

  await delay(1000);
  steps[0].status = "done";
  steps[0].completed_at = new Date().toISOString();
  steps[0].tokens_used = 245;
  steps[1].status = "working";
  steps[1].started_at = new Date().toISOString();
  updateTask(taskId, { progress: 25, current_step: "Gathering relevant information" });

  await delay(1500);
  steps[1].status = "done";
  steps[1].completed_at = new Date().toISOString();
  steps[1].tokens_used = 512;
  steps[2].status = "working";
  steps[2].started_at = new Date().toISOString();
  updateTask(taskId, { progress: 50, current_step: "Processing and generating output" });

  await delay(2000);
  steps[2].status = "done";
  steps[2].completed_at = new Date().toISOString();
  steps[2].tokens_used = 1834;
  steps[3].status = "working";
  steps[3].started_at = new Date().toISOString();
  updateTask(taskId, { progress: 80, current_step: "Finalizing results" });

  await delay(1000);
  steps[3].status = "done";
  steps[3].completed_at = new Date().toISOString();
  steps[3].tokens_used = 389;

  const output = `# ${task.title}

## Demo Mode

This is a simulated response. To get real AI-powered results:

1. Go to **Settings**
2. Add your **Anthropic API key**
3. Run this task again

${agentName} will use Claude to generate real, high-quality output for your task.

> Get your API key at [console.anthropic.com](https://console.anthropic.com)`;

  updateTask(taskId, {
    status: "review",
    progress: 100,
    output,
    cost_usd: 0,
    tokens_in: 0,
    tokens_out: 0,
    duration_seconds: 6,
    current_step: "Complete — add API key in Settings for real AI output",
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
