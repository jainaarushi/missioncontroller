import { NextRequest, NextResponse } from "next/server";
import { getTask, getAgent, updateTask, mockSteps } from "@/lib/mock-data";
import { getAuthUser } from "@/lib/auth";
import { createUserAnthropic } from "@/lib/ai/client";
import { getUserAnthropicKey } from "@/lib/ai/get-user-key";
import { calculateCost } from "@/lib/ai/cost";
import { getToolsForAgent } from "@/lib/ai/tools";
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

  // Initialize steps
  const steps: TaskStep[] = [
    { id: `s-${id}-1`, task_id: id, step_number: 1, description: `${agent.name} is analyzing the task`, status: "working", started_at: new Date().toISOString(), completed_at: null, tokens_used: 0 },
  ];
  mockSteps.set(id, steps);

  updateTask(id, {
    status: "working",
    progress: 5,
    started_at: new Date().toISOString(),
    current_step: `${agent.name} is analyzing the task`,
  });

  // Check if the user has their own Anthropic API key
  const user = await getAuthUser();
  let userApiKey: string | null = null;
  if (user) {
    userApiKey = await getUserAnthropicKey(user.id);
  }

  if (userApiKey) {
    runAgentWithTools(id, task.title, task.description, agent.name, agent.slug, agent.system_prompt, agent.model, steps, userApiKey);
  } else {
    simulateAgentWork(id, agent.name, steps);
  }

  return NextResponse.json({ status: "started" });
}

// ── Real Agentic Execution with Tools ───────────────────────

async function runAgentWithTools(
  taskId: string,
  title: string,
  description: string | null,
  agentName: string,
  agentSlug: string,
  systemPrompt: string,
  model: string,
  steps: TaskStep[],
  apiKey: string,
) {
  const startTime = Date.now();
  const anthropic = createUserAnthropic(apiKey);

  // Get the right tools for this agent
  const tools = getToolsForAgent(agentSlug);

  try {
    // Mark step 1 done
    steps[0].status = "done";
    steps[0].completed_at = new Date().toISOString();
    updateTask(taskId, { progress: 10, current_step: `${agentName} is working...` });

    // Build the prompt
    const userMessage = description
      ? `Task: ${title}\n\nDetails: ${description}`
      : `Task: ${title}`;

    // Add a working step
    addStep(steps, taskId, `${agentName} is executing with tools`, "working");
    updateTask(taskId, { progress: 20, current_step: `${agentName} is executing with tools` });

    // Run the agentic loop — the AI SDK handles tool calling automatically
    const { generateText, stepCountIs } = await import("ai");
    const result = await generateText({
      model: anthropic(model),
      system: systemPrompt,
      prompt: userMessage,
      tools: tools as Parameters<typeof generateText>[0]["tools"],
      stopWhen: stepCountIs(10), // Max 10 tool-use rounds
      onStepFinish: ({ toolResults }) => {
        // Log each tool call as a visible step
        if (toolResults && toolResults.length > 0) {
          for (const toolResult of toolResults) {
            const toolName = String(toolResult.toolName || "tool").replace(/_/g, " ");
            const detail = "";
            const stepDesc = `Used ${toolName}${detail ? `: ${detail}` : ""}`;

            // Mark previous working step as done
            const lastWorking = steps.findLast((s: TaskStep) => s.status === "working");
            if (lastWorking) {
              lastWorking.status = "done";
              lastWorking.completed_at = new Date().toISOString();
            }

            addStep(steps, taskId, stepDesc, "done");

            // Update progress proportionally
            const progress = Math.min(20 + (steps.length - 2) * 10, 85);
            updateTask(taskId, {
              progress,
              current_step: stepDesc,
            });
          }

          // Add next working step
          addStep(steps, taskId, "Processing results...", "working");
        }
      },
    });

    // Mark all remaining working steps as done
    steps.forEach((s) => {
      if (s.status === "working") {
        s.status = "done";
        s.completed_at = new Date().toISOString();
      }
    });

    // Add final step
    addStep(steps, taskId, "Complete — ready for your review", "done");

    const usage = result.usage as { totalTokens?: number; promptTokens?: number; completionTokens?: number } | undefined;
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
    console.error("Agent execution failed:", error);

    steps.forEach((s) => {
      if (s.status === "working" || s.status === "pending") {
        s.status = "failed";
      }
    });

    addStep(steps, taskId, `Error: ${error instanceof Error ? error.message : "Unknown error"}`, "failed");

    updateTask(taskId, {
      status: "failed",
      progress: 0,
      current_step: `Failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      output: `## Error\n\n${agentName} encountered an error.\n\n\`\`\`\n${error instanceof Error ? error.message : "Unknown error"}\n\`\`\`\n\nPlease check your API key in Settings and try again.`,
    });
  }
}

// ── Helper: Add a step to the in-memory list ────────────────

function addStep(steps: TaskStep[], taskId: string, description: string, status: "pending" | "working" | "done" | "failed") {
  const stepNum = steps.length + 1;
  steps.push({
    id: `s-${taskId}-${stepNum}`,
    task_id: taskId,
    step_number: stepNum,
    description,
    status,
    started_at: status !== "pending" ? new Date().toISOString() : null,
    completed_at: status === "done" || status === "failed" ? new Date().toISOString() : null,
    tokens_used: 0,
  });
}

// ── Demo Mode (no API key) ──────────────────────────────────

async function simulateAgentWork(taskId: string, agentName: string, steps: TaskStep[]) {
  const task = getTask(taskId);
  if (!task) return;

  await delay(1000);
  steps[0].status = "done";
  steps[0].completed_at = new Date().toISOString();
  addStep(steps, taskId, "Gathering relevant information", "working");
  updateTask(taskId, { progress: 25, current_step: "Gathering relevant information" });

  await delay(1500);
  steps[1].status = "done";
  steps[1].completed_at = new Date().toISOString();
  addStep(steps, taskId, "Processing and generating output", "working");
  updateTask(taskId, { progress: 50, current_step: "Processing and generating output" });

  await delay(2000);
  steps[2].status = "done";
  steps[2].completed_at = new Date().toISOString();
  addStep(steps, taskId, "Finalizing results", "working");
  updateTask(taskId, { progress: 80, current_step: "Finalizing results" });

  await delay(1000);
  steps[3].status = "done";
  steps[3].completed_at = new Date().toISOString();

  const output = `# ${task.title}

## Demo Mode

This is a simulated response. To get real AI-powered results:

1. Go to **Settings**
2. Add your **Anthropic API key**
3. Run this task again

${agentName} will use Claude with real tools (web search, page reading, calculations) to generate actual results.

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
