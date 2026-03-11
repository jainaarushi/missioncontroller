import { NextRequest, NextResponse } from "next/server";
import { getTask, getAgent, updateTask as updateMockTask, mockSteps } from "@/lib/mock-data";
import { getAuthUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { createUserAnthropic, createUserGemini, createUserOpenAI, PROVIDER_MODELS } from "@/lib/ai/client";
import { getUserAIConfig } from "@/lib/ai/get-user-key";
import { calculateCost } from "@/lib/ai/cost";
import { getPipeline } from "@/lib/ai/pipelines";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { getTaskById, updateTaskById } from "@/lib/data/tasks";
import { getAgentById } from "@/lib/data/agents";
import type { TaskStep } from "@/lib/types/task";

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
  if (user.isDemo) return NextResponse.json({ error: "Sign in to run AI agents", login: true }, { status: 401 });

  // Rate limit: 10 runs per minute per user
  const rl = rateLimit(`run:${user.id}`, { maxRequests: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  // Get task and agent
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

  // Get the pipeline for this agent
  const pipeline = getPipeline(agentSlug);

  // Create steps from pipeline
  const steps: TaskStep[] = pipeline.map((step, i) => ({
    id: `s-${id}-${i + 1}`,
    task_id: id,
    step_number: i + 1,
    description: step.description,
    status: i === 0 ? "working" as const : "pending" as const,
    started_at: i === 0 ? new Date().toISOString() : null,
    completed_at: null,
    tokens_used: 0,
  }));
  mockSteps.set(id, steps);

  await persistTaskUpdate(user.id, id, {
    status: "working",
    progress: 5,
    started_at: new Date().toISOString(),
    current_step: pipeline[0].description,
  });

  // Get AI config
  const aiConfig = await getUserAIConfig(user.id);

  if (!aiConfig) {
    // Revert task status since we can't run without a key
    await persistTaskUpdate(user.id, id, {
      status: "todo",
      progress: 0,
      current_step: null,
    });
    return NextResponse.json({ error: "Add an API key in Settings to run agents", needsKey: true }, { status: 402 });
  }

  runPipeline(user.id, id, taskTitle, taskDescription, agentName, agentSystemPrompt, pipeline, steps, aiConfig.provider, aiConfig.apiKey);

  return NextResponse.json({ status: "started" });
}

// ── Pipeline Execution ───────────────────────────────────────
// isCore = first real API call (generates draft output)
// isCore2 = second real API call (refines/synthesizes the draft)
// Other steps = visual delays for UX

async function runPipeline(
  userId: string,
  taskId: string,
  title: string,
  description: string | null,
  agentName: string,
  systemPrompt: string,
  pipeline: { description: string; duration: number; isCore?: boolean; isCore2?: boolean; core2Prompt?: string }[],
  steps: TaskStep[],
  provider: "openai" | "gemini" | "anthropic",
  apiKey: string,
) {
  const startTime = Date.now();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const modelId = PROVIDER_MODELS[provider].default;
  const { generateText } = await import("ai");

  const aiModel = provider === "openai"
    ? createUserOpenAI(apiKey)(modelId)
    : provider === "gemini"
    ? createUserGemini(apiKey)(modelId)
    : createUserAnthropic(apiKey)(modelId);

  let draftOutput = "";
  let totalTokensIn = 0;
  let totalTokensOut = 0;
  let finalOutput = "";

  // Detect if user wants image output
  const lowerTitle = title.toLowerCase();
  const lowerDesc = (description || "").toLowerCase();
  const combined = lowerTitle + " " + lowerDesc;
  const wantsImage = /\b(generate|create|make|draw|design|sketch|render|produce)\b.*\b(image|picture|photo|illustration|graphic|logo|icon|banner|poster|thumbnail|art|artwork|visual|diagram)\b/i.test(combined)
    || /\b(image|picture|photo|illustration|graphic|logo|icon|banner|poster|thumbnail)\b.*\b(of|for|about|showing|with)\b/i.test(combined);

  try {
    // If user wants an image AND provider supports it (OpenAI)
    if (wantsImage && provider === "openai") {
      await persistTaskUpdate(userId, taskId, {
        progress: 30,
        current_step: "Generating image...",
      });

      try {
        const { generateImage } = await import("ai");
        const imageModel = createUserOpenAI(apiKey).image("dall-e-3");
        const imagePrompt = description
          ? `${title}. ${description}`
          : title;

        const imageResult = await generateImage({
          model: imageModel,
          prompt: imagePrompt,
          size: "1024x1024",
        });

        const image = imageResult.images[0];
        if (image) {
          const base64 = image.base64;
          finalOutput = `![Generated Image](data:image/png;base64,${base64})\n\n**Prompt:** ${imagePrompt}`;

          const cost = 0.04; // DALL-E 3 standard pricing
          const duration = Math.round((Date.now() - startTime) / 1000);

          await persistTaskUpdate(userId, taskId, {
            status: "review",
            progress: 100,
            output: finalOutput,
            output_format: "image",
            cost_usd: cost,
            tokens_in: 0,
            tokens_out: 0,
            duration_seconds: duration,
            current_step: "Image generated — ready for review",
          });
          return;
        }
      } catch (imgErr) {
        console.error("Image generation failed, falling back to text:", imgErr);
        // Fall through to text generation
      }
    }

    // If user wanted an image but we're not on OpenAI, add context to the text prompt
    if (wantsImage && provider !== "openai") {
      systemPrompt += "\n\nNote: The user wants a visual/image output. Since image generation is not available with this provider, provide a detailed text description of what the image would look like, and create the best text-based output you can (ASCII art, detailed visual description, or structured layout).";
    }

    for (let i = 0; i < pipeline.length; i++) {
      const step = pipeline[i];
      const progress = Math.round(((i + 0.5) / pipeline.length) * 100);

      // Mark current step as working
      steps[i].status = "working";
      steps[i].started_at = new Date().toISOString();
      await persistTaskUpdate(userId, taskId, {
        progress: Math.min(progress, 95),
        current_step: step.description,
      });

      if (step.isCore) {
        // FIRST real API call — generate draft
        const userMessage = description
          ? `Task: ${title}\n\nDetails: ${description}\n\nToday's date: ${today}`
          : `Task: ${title}\n\nToday's date: ${today}`;

        const result = await generateText({
          model: aiModel,
          system: systemPrompt,
          prompt: userMessage,
        });

        draftOutput = result.text;
        finalOutput = result.text;
        const usage = result.usage as { inputTokens?: number; outputTokens?: number; promptTokens?: number; completionTokens?: number } | undefined;
        totalTokensIn += usage?.inputTokens || usage?.promptTokens || 0;
        totalTokensOut += usage?.outputTokens || usage?.completionTokens || 0;

        steps[i].status = "done";
        steps[i].completed_at = new Date().toISOString();
        steps[i].tokens_used = (usage?.inputTokens || usage?.promptTokens || 0) + (usage?.outputTokens || usage?.completionTokens || 0);

      } else if (step.isCore2 && draftOutput) {
        // SECOND real API call — refine/synthesize the draft
        const refinePrompt = (step.core2Prompt || "Improve and polish this output:\n\n") + draftOutput;

        const result = await generateText({
          model: aiModel,
          system: systemPrompt,
          prompt: refinePrompt,
        });

        finalOutput = result.text;
        const usage = result.usage as { inputTokens?: number; outputTokens?: number; promptTokens?: number; completionTokens?: number } | undefined;
        totalTokensIn += usage?.inputTokens || usage?.promptTokens || 0;
        totalTokensOut += usage?.outputTokens || usage?.completionTokens || 0;

        steps[i].status = "done";
        steps[i].completed_at = new Date().toISOString();
        steps[i].tokens_used = (usage?.inputTokens || usage?.promptTokens || 0) + (usage?.outputTokens || usage?.completionTokens || 0);

      } else {
        // Visual step — wait for UX
        await delay(step.duration);
        steps[i].status = "done";
        steps[i].completed_at = new Date().toISOString();
      }
    }

    // All done
    const cost = provider === "gemini" ? 0 : calculateCost(totalTokensIn, totalTokensOut, modelId);
    const duration = Math.round((Date.now() - startTime) / 1000);

    await persistTaskUpdate(userId, taskId, {
      status: "review",
      progress: 100,
      output: finalOutput,
      cost_usd: cost,
      tokens_in: totalTokensIn,
      tokens_out: totalTokensOut,
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


function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
