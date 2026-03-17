import { NextRequest, NextResponse } from "next/server";
import { getTask, getAgent, updateTask as updateMockTask, setMockSteps, getMockStepsLive, markTaskRunning, markTaskDone } from "@/lib/mock-data";
import { getAuthUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { createUserAnthropic, createUserGemini, createUserOpenAI, PROVIDER_MODELS } from "@/lib/ai/client";
import { getUserAIConfig } from "@/lib/ai/get-user-key";
import { getUserToolKeys } from "@/lib/ai/get-tool-keys";
import { calculateCost, calculateImageCost } from "@/lib/ai/cost";
import { getPipeline, getSpecialistPrompt, type PipelineStep } from "@/lib/ai/pipelines";
import { getRequiredToolKeys } from "@/lib/ai/tools/registry";
import { createWebSearchTool } from "@/lib/ai/tools/web-search";
import { createDuckDuckGoSearchTool } from "@/lib/ai/tools/duckduckgo";
import { createWebScrapeTool } from "@/lib/ai/tools/web-scrape";
import { createFinanceDataTool } from "@/lib/ai/tools/finance-data";
import { createDataQueryTool, parseFileDataFromDescription, type ParsedFileData } from "@/lib/ai/tools/data-query";
import { createDeepResearchTool } from "@/lib/ai/tools/deep-research";
import { createCalculatorTool } from "@/lib/ai/tools/calculator";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { getTaskById, updateTaskById } from "@/lib/data/tasks";
import { getAgentById } from "@/lib/data/agents";
import { getUserMCPServers } from "@/lib/ai/mcp/storage";
import { getMCPToolsForAgent, closeMCPConnections } from "@/lib/ai/mcp/client";
import { getAgentMCPRecommendation } from "@/lib/ai/mcp/suggestions";
import type { MCPServerConfig } from "@/lib/ai/mcp/types";
import type { TaskStep } from "@/lib/types/task";
import type { UserToolKeys } from "@/lib/ai/get-tool-keys";

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

  // Prevent concurrent runs on the same task
  if (!markTaskRunning(id)) {
    return NextResponse.json({ error: "This task is already running." }, { status: 409 });
  }

  // Parse optional team and custom pipeline from request body
  let teamAgentIds: string[] = [];
  let customPipeline: PipelineStep[] | null = null;
  try {
    const contentType = _request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const text = await _request.text();
      if (text && text.trim() !== "" && text.trim() !== "{}") {
        const body = JSON.parse(text);
        if (body.team && Array.isArray(body.team)) {
          teamAgentIds = body.team;
        }
        if (body.customPipeline && Array.isArray(body.customPipeline)) {
          const hasCore = body.customPipeline.some((s: PipelineStep) => s.isCore || s.isCore2);
          if (hasCore) {
            customPipeline = body.customPipeline;
          }
        }
      }
    }
  } catch {
    // No body or invalid JSON — single agent mode
  }

  // Get task and agent
  let taskTitle: string;
  let taskDescription: string | null;
  let agentName: string;
  let agentSlug: string;
  let agentSystemPrompt: string;

  if (isSupabaseEnabled()) {
    const task = await getTaskById(user.id, id);
    if (!task) { markTaskDone(id); return NextResponse.json({ error: "Not found" }, { status: 404 }); }
    if (!task.agent_id) { markTaskDone(id); return NextResponse.json({ error: "No agent assigned" }, { status: 400 }); }
    const agent = await getAgentById(user.id, task.agent_id);
    if (!agent) { markTaskDone(id); return NextResponse.json({ error: "Agent not found" }, { status: 404 }); }
    taskTitle = task.title;
    taskDescription = task.description;
    agentName = agent.name;
    agentSlug = agent.slug;
    agentSystemPrompt = agent.system_prompt;
  } else {
    const task = getTask(id);
    if (!task) { markTaskDone(id); return NextResponse.json({ error: "Not found" }, { status: 404 }); }
    if (!task.agent_id) { markTaskDone(id); return NextResponse.json({ error: "No agent assigned" }, { status: 400 }); }
    const agent = getAgent(task.agent_id);
    if (!agent) { markTaskDone(id); return NextResponse.json({ error: "Agent not found" }, { status: 404 }); }
    taskTitle = task.title;
    taskDescription = task.description;
    agentName = agent.name;
    agentSlug = agent.slug;
    agentSystemPrompt = agent.system_prompt;
  }

  // Resolve team agents (additional agents beyond the primary)
  interface TeamMember { name: string; slug: string; systemPrompt: string }
  const teamMembers: TeamMember[] = [];
  for (const tid of teamAgentIds) {
    let member: TeamMember | null = null;
    if (isSupabaseEnabled()) {
      const a = await getAgentById(user.id, tid);
      if (a) member = { name: a.name, slug: a.slug, systemPrompt: a.system_prompt };
    } else {
      const a = getAgent(tid);
      if (a) member = { name: a.name, slug: a.slug, systemPrompt: a.system_prompt };
    }
    if (member) teamMembers.push(member);
  }

  // Build combined pipeline for multi-agent execution
  const primaryPipeline = customPipeline || getPipeline(agentSlug);

  // For multi-agent: primary agent runs first, then each team member gets a handoff step
  const allSteps: { pipeline: PipelineStep[]; agentName: string; agentSlug: string; systemPrompt: string }[] = [
    { pipeline: primaryPipeline, agentName, agentSlug, systemPrompt: agentSystemPrompt },
  ];
  for (const member of teamMembers) {
    allSteps.push({
      pipeline: getPipeline(member.slug),
      agentName: member.name,
      agentSlug: member.slug,
      systemPrompt: member.systemPrompt,
    });
  }

  // Create steps from all pipelines
  let stepCounter = 0;
  const steps: TaskStep[] = [];
  for (const agentBlock of allSteps) {
    // Add handoff step between agents (except before the first)
    if (stepCounter > 0) {
      steps.push({
        id: `s-${id}-${stepCounter + 1}`,
        task_id: id,
        step_number: stepCounter + 1,
        description: `Handing off to ${agentBlock.agentName}...`,
        status: "pending",
        started_at: null,
        completed_at: null,
        tokens_used: 0,
      });
      stepCounter++;
    }
    for (const step of agentBlock.pipeline) {
      steps.push({
        id: `s-${id}-${stepCounter + 1}`,
        task_id: id,
        step_number: stepCounter + 1,
        description: `[${agentBlock.agentName}] ${step.description}`,
        status: stepCounter === 0 ? "working" : "pending",
        started_at: stepCounter === 0 ? new Date().toISOString() : null,
        completed_at: null,
        tokens_used: 0,
      });
      stepCounter++;
    }
  }
  setMockSteps(id, steps);

  await persistTaskUpdate(user.id, id, {
    status: "working",
    progress: 5,
    output: null,
    started_at: new Date().toISOString(),
    current_step: teamMembers.length > 0
      ? `${agentName} starting (team of ${allSteps.length})`
      : primaryPipeline[0].description,
  });

  // Get AI config
  const aiConfig = await getUserAIConfig(user.id);

  if (!aiConfig) {
    markTaskDone(id);
    await persistTaskUpdate(user.id, id, {
      status: "todo",
      progress: 0,
      current_step: null,
    });
    return NextResponse.json({ error: "Add an API key in Settings to run agents", needsKey: true }, { status: 402 });
  }

  // Check required tool keys across all agents
  const allSlugs = [agentSlug, ...teamMembers.map(m => m.slug)];
  const allPipelines = allSteps.map(a => a.pipeline);
  let toolKeys: UserToolKeys = {};

  const allRequiredKeys = new Set<string>();
  for (const slug of allSlugs) {
    for (const key of getRequiredToolKeys(slug)) allRequiredKeys.add(key);
  }
  const anyToolsNeeded = allPipelines.some(p => p.some(s => s.tools?.length));

  if (allRequiredKeys.size > 0 || anyToolsNeeded) {
    toolKeys = await getUserToolKeys(user.id);

    for (const key of allRequiredKeys) {
      if (!toolKeys[key as keyof UserToolKeys]) {
        markTaskDone(id);
        await persistTaskUpdate(user.id, id, {
          status: "todo",
          progress: 0,
          current_step: null,
        });
        const keyNames: Record<string, string> = { tavily: "Tavily", firecrawl: "Firecrawl", serp: "SerpAPI" };
        return NextResponse.json({
          error: `This agent needs a ${keyNames[key] || key} API key for web search. Add it in Settings → Tool API Keys.`,
          needsKey: true,
          keyType: key,
        }, { status: 402 });
      }
    }
  }

  // Fetch user's MCP server configs and check for recommendations
  const mcpServers = await getUserMCPServers(user.id);
  const configuredServerTypes = mcpServers.filter(s => s.enabled).map(s => s.serverType);
  const mcpRecommendation = getAgentMCPRecommendation(agentSlug, configuredServerTypes);

  // Run multi-agent pipeline with context passing
  runMultiAgentPipeline(
    user.id, id, taskTitle, taskDescription,
    allSteps, steps,
    aiConfig.provider, aiConfig.apiKey, toolKeys,
    mcpServers, mcpRecommendation?.settingsHint || null,
  );

  return NextResponse.json({
    status: "started",
    teamSize: allSteps.length,
    ...(mcpRecommendation ? {
      mcpRecommendation: {
        message: mcpRecommendation.message,
        serverNames: mcpRecommendation.serverNames,
        settingsHint: mcpRecommendation.settingsHint,
      },
    } : {}),
  });
}

// ── Multi-Agent Pipeline Execution ───────────────────────────

interface AgentBlock {
  pipeline: PipelineStep[];
  agentName: string;
  agentSlug: string;
  systemPrompt: string;
}

export async function runMultiAgentPipeline(
  userId: string,
  taskId: string,
  title: string,
  description: string | null,
  agentBlocks: AgentBlock[],
  steps: TaskStep[],
  provider: "openai" | "gemini" | "anthropic",
  apiKey: string,
  toolKeys: UserToolKeys,
  mcpServers: MCPServerConfig[],
  mcpHint: string | null,
  startFromStep: number = 0,
  priorContext: string = "",
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

  let totalTokensIn = 0;
  let totalTokensOut = 0;

  // Accumulated context passed between agents
  const agentOutputs: { agentName: string; output: string }[] = [];
  let finalOutput = "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mcpTools: Record<string, any> = {};
  let mcpClosers: Array<() => Promise<void>> = [];

  if (mcpServers.length > 0) {
    try {
      const mcpResult = await getMCPToolsForAgent(mcpServers, agentBlocks[0].agentSlug);
      mcpTools = mcpResult.tools;
      mcpClosers = mcpResult.closers;

      if (mcpResult.connectedServers.length > 0) {
        await persistTaskUpdate(userId, taskId, {
          current_step: `Connected to ${mcpResult.connectedServers.join(", ")}`,
        });
      }

      if (mcpResult.errors.length > 0) {
        console.warn("MCP connection errors:", mcpResult.errors);
      }
    } catch (err) {
      console.error("MCP setup failed (continuing without MCP):", err);
    }
  }

  // Detect if user wants image output
  const combined = (title + " " + (description || "")).toLowerCase();
  const wantsImage = /\b(generate|create|make|draw|design|sketch|render|produce)\b.*\b(image|picture|photo|illustration|graphic|logo|icon|banner|poster|thumbnail|art|artwork|visual|diagram)\b/i.test(combined)
    || /\b(image|picture|photo|illustration|graphic|logo|icon|banner|poster|thumbnail)\b.*\b(of|for|about|showing|with)\b/i.test(combined);

  // Track global step index across all agent blocks
  let globalStepIdx = 0;
  const totalSteps = steps.length;

  // If starting from a specific step, use prior context as draft
  let skipToStep = startFromStep;
  if (priorContext) {
    finalOutput = priorContext;
  }

  try {
    // Image generation path
    if (wantsImage && provider === "openai") {
      await persistTaskUpdate(userId, taskId, { progress: 30, current_step: "Generating image..." });

      try {
        const { generateImage } = await import("ai");
        const imageModel = createUserOpenAI(apiKey).image("dall-e-3");
        const imagePrompt = description ? `${title}. ${description}` : title;

        const imageResult = await generateImage({ model: imageModel, prompt: imagePrompt, size: "1024x1024" });
        const image = imageResult.images[0];
        if (image) {
          finalOutput = `![Generated Image](data:image/png;base64,${image.base64})\n\n**Prompt:** ${imagePrompt}`;
          const cost = calculateImageCost("dall-e-3", "1024x1024", 1);
          const duration = Math.round((Date.now() - startTime) / 1000);
          await persistTaskUpdate(userId, taskId, {
            status: "review", progress: 100, output: finalOutput, output_format: "image",
            cost_usd: cost, tokens_in: 0, tokens_out: 0, duration_seconds: duration,
            current_step: "Image generated — ready for review",
          });
          return;
        }
      } catch (imgErr) {
        console.error("Image generation failed, falling back to text:", imgErr);
      }
    }

    // ── Execute each agent block sequentially ──────────────────
    for (let blockIdx = 0; blockIdx < agentBlocks.length; blockIdx++) {
      const block = agentBlocks[blockIdx];
      let blockSystemPrompt = block.systemPrompt;

      // Inject MCP hint for first agent
      if (blockIdx === 0 && mcpHint) {
        blockSystemPrompt += `\n\nIMPORTANT: You do NOT currently have access to external tools (like GitHub, Jira, databases, etc.) that would make your output much more useful. At the START of your response, add this notice:\n\n> **Tip:** ${mcpHint}\n\nThen do your best with the information provided, but clearly state when you're giving generic advice that would be more specific with real data access.`;
      }

      if (wantsImage && provider !== "openai") {
        blockSystemPrompt += "\n\nNote: The user wants a visual/image output. Since image generation is not available with this provider, provide a detailed text description of what the image would look like, and create the best text-based output you can (ASCII art, detailed visual description, or structured layout).";
      }

      // Build context from previous agents' outputs
      let teamContext = "";
      if (agentOutputs.length > 0) {
        teamContext = "\n\n--- CONTEXT FROM TEAM MEMBERS ---\n" +
          agentOutputs.map(o => `\n## ${o.agentName}'s Analysis:\n${o.output}`).join("\n") +
          "\n--- END TEAM CONTEXT ---\n\nBuild on your teammates' work above. Add your unique expertise, don't repeat what they've already covered.";
      }

      // Handle handoff step (visual only, between agents)
      if (blockIdx > 0) {
        if (globalStepIdx < skipToStep) {
          globalStepIdx++;
        } else {
          steps[globalStepIdx].status = "working";
          steps[globalStepIdx].started_at = new Date().toISOString();
          await persistTaskUpdate(userId, taskId, {
            progress: Math.min(Math.round((globalStepIdx / totalSteps) * 100), 95),
            current_step: `Handing off to ${block.agentName}...`,
          });
          await delay(800);
          steps[globalStepIdx].status = "done";
          steps[globalStepIdx].completed_at = new Date().toISOString();
          globalStepIdx++;
        }
      }

      // Parse file data if this agent's pipeline needs it
      let parsedFileData: ParsedFileData | null = null;
      if (block.pipeline.some(s => s.requiresFileData) && description) {
        parsedFileData = parseFileDataFromDescription(description);
      }

      let draftOutput = priorContext || "";

      // Execute this agent's pipeline steps
      for (let i = 0; i < block.pipeline.length; i++) {
        const step = block.pipeline[i];
        const progress = Math.round(((globalStepIdx + 0.5) / totalSteps) * 100);

        // Skip steps before startFromStep (they were already completed)
        if (globalStepIdx < skipToStep) {
          // Preserve existing output as draft context
          if (steps[globalStepIdx].output) {
            draftOutput = steps[globalStepIdx].output || "";
          }
          globalStepIdx++;
          continue;
        }

        steps[globalStepIdx].status = "working";
        steps[globalStepIdx].started_at = new Date().toISOString();
        await persistTaskUpdate(userId, taskId, {
          progress: Math.min(progress, 95),
          current_step: `[${block.agentName}] ${step.description}`,
        });

        if (step.isCore) {
          const userMessage = description
            ? `Task: ${title}\n\nDetails: ${description}${teamContext}\n\nToday's date: ${today}`
            : `Task: ${title}${teamContext}\n\nToday's date: ${today}`;

          const builtInTools = buildToolsForStep(step, toolKeys, parsedFileData);
          const stepTools = { ...builtInTools, ...mcpTools };
          const hasTools = Object.keys(stepTools).length > 0;

          const basePrompt = step.specialistSlug
            ? (getSpecialistPrompt(step.specialistSlug) || blockSystemPrompt)
            : blockSystemPrompt;
          let coreSystem = step.toolContext
            ? basePrompt + "\n\n" + step.toolContext
            : basePrompt;

          if (Object.keys(mcpTools).length > 0) {
            const mcpToolNames = Object.keys(mcpTools).join(", ");
            coreSystem += `\n\nYou also have access to external MCP tools: ${mcpToolNames}. Use them when relevant to the task.`;
          }

          // Try with tools first; if the provider rejects the tool schema (e.g. Gemini),
          // fall back to a plain generateText call without tools.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let result: any;
          let usedTools = false;
          try {
            result = await generateText({
              model: aiModel,
              system: coreSystem,
              prompt: userMessage,
              ...(hasTools ? { tools: stepTools, maxSteps: step.maxToolSteps || 3 } : {}),
            });
            usedTools = hasTools;
          } catch (toolErr) {
            // Tool-related failure — retry without tools
            console.warn(`[Pipeline ${taskId}] generateText with tools failed (${provider}), retrying without tools:`, toolErr instanceof Error ? toolErr.message : toolErr);
            result = await generateText({
              model: aiModel,
              system: coreSystem,
              prompt: userMessage,
            });
          }

          const usage = result.usage as { inputTokens?: number; outputTokens?: number; promptTokens?: number; completionTokens?: number } | undefined;
          totalTokensIn += usage?.inputTokens || usage?.promptTokens || 0;
          totalTokensOut += usage?.outputTokens || usage?.completionTokens || 0;

          // In AI SDK v6, result.text is from the FINAL step only.
          // When tools are used and the model ends on a tool call, text is empty.
          // Collect text from all steps, then fall back to a synthesis call.
          let coreText = result.text || "";

          // Try extracting text from all intermediate steps
          if (!coreText && result.steps && result.steps.length > 0) {
            const allTexts: string[] = [];
            for (const s of result.steps) {
              if (s.text) allTexts.push(s.text);
            }
            coreText = allTexts.join("\n\n");
          }

          // If STILL no text and we used tools, collect tool results and make a follow-up synthesis call
          if (!coreText && usedTools) {
            const toolContext: string[] = [];
            try {
              if (result.steps) {
                for (const s of result.steps) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const calls = (s as any).toolCalls || [];
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const results = (s as any).toolResults || [];
                  for (const tc of calls) {
                    const name = tc?.toolName || "unknown";
                    const args = tc?.args ? JSON.stringify(tc.args) : "{}";
                    toolContext.push(`[Tool: ${name}] Args: ${args.slice(0, 500)}`);
                  }
                  for (const tr of results) {
                    const name = tr?.toolName || "unknown";
                    const raw = tr?.output ?? tr?.result ?? "";
                    const output = typeof raw === "string" ? raw : JSON.stringify(raw || "");
                    toolContext.push(`[Result from ${name}]: ${output.slice(0, 2000)}`);
                  }
                }
              }
            } catch (extractErr) {
              console.error("Error extracting tool results for synthesis:", extractErr);
            }

            // Make a follow-up call without tools to synthesize a response
            await persistTaskUpdate(userId, taskId, {
              current_step: `[${block.agentName}] Synthesizing response...`,
            });
            const synthesisPrompt = toolContext.length > 0
              ? `${userMessage}\n\nHere is what was found during research:\n\n${toolContext.join("\n\n")}\n\nBased on all the research above, provide a comprehensive, well-structured response to the original task. Use markdown formatting with headers and bullet points.`
              : userMessage;
            const synthesisResult = await generateText({
              model: aiModel,
              system: coreSystem,
              prompt: synthesisPrompt,
            });
            coreText = synthesisResult.text || "";
            const sUsage = synthesisResult.usage as { inputTokens?: number; outputTokens?: number; promptTokens?: number; completionTokens?: number } | undefined;
            totalTokensIn += sUsage?.inputTokens || sUsage?.promptTokens || 0;
            totalTokensOut += sUsage?.outputTokens || sUsage?.completionTokens || 0;
          }

          // Last resort: if no text at all, note this
          if (!coreText) {
            coreText = `*The AI model processed your request but did not produce text output. This may happen with certain tool configurations. Please try running again.*`;
          }

          draftOutput = coreText;
          finalOutput = coreText;

          const toolCallCount = result.steps?.reduce((acc: number, s: { toolCalls?: unknown[] }) => acc + (s.toolCalls?.length || 0), 0) || 0;
          if (toolCallCount > 0) {
            await persistTaskUpdate(userId, taskId, {
              current_step: `[${block.agentName}] ${step.description} (${toolCallCount} tool calls)`,
            });
          }

          steps[globalStepIdx].status = "done";
          steps[globalStepIdx].completed_at = new Date().toISOString();
          steps[globalStepIdx].tokens_used = (usage?.inputTokens || usage?.promptTokens || 0) + (usage?.outputTokens || usage?.completionTokens || 0);
          steps[globalStepIdx].output = coreText;

        } else if (step.isCore2) {
          // Use draftOutput from isCore, or fall back to the original task description
          const contextForRefine = draftOutput || description || title;
          const refinePrompt = (step.core2Prompt || "Improve and polish this output:\n\n") + contextForRefine;
          const core2System = step.specialistSlug
            ? (getSpecialistPrompt(step.specialistSlug) || blockSystemPrompt)
            : blockSystemPrompt;

          const result = await generateText({
            model: aiModel,
            system: core2System,
            prompt: refinePrompt,
          });

          const core2Text = result.text || draftOutput || "";
          finalOutput = core2Text;
          const usage = result.usage as { inputTokens?: number; outputTokens?: number; promptTokens?: number; completionTokens?: number } | undefined;
          totalTokensIn += usage?.inputTokens || usage?.promptTokens || 0;
          totalTokensOut += usage?.outputTokens || usage?.completionTokens || 0;

          steps[globalStepIdx].status = "done";
          steps[globalStepIdx].completed_at = new Date().toISOString();
          steps[globalStepIdx].tokens_used = (usage?.inputTokens || usage?.promptTokens || 0) + (usage?.outputTokens || usage?.completionTokens || 0);
          steps[globalStepIdx].output = core2Text;

        } else {
          await delay(step.duration);
          steps[globalStepIdx].status = "done";
          steps[globalStepIdx].completed_at = new Date().toISOString();
        }

        globalStepIdx++;
      }

      // Store this agent's output for the next agent
      if (finalOutput) {
        agentOutputs.push({ agentName: block.agentName, output: finalOutput });
      }
    }

    // Combine all agent outputs if multi-agent
    if (agentOutputs.length > 1) {
      finalOutput = agentOutputs
        .map(o => `## ${o.agentName}\n\n${o.output}`)
        .join("\n\n---\n\n");
    }

    // All done
    const cost = calculateCost(totalTokensIn, totalTokensOut, modelId);
    const duration = Math.round((Date.now() - startTime) / 1000);

    // Debug: log output length and step outputs
    console.log(`[Pipeline ${taskId}] Done. finalOutput length: ${finalOutput.length}, tokens: ${totalTokensIn}+${totalTokensOut}, steps with output: ${steps.filter(s => s.output).length}/${steps.length}`);

    await persistTaskUpdate(userId, taskId, {
      status: "review",
      progress: 100,
      output: finalOutput || "No output was generated. Please try running this template again.",
      cost_usd: cost,
      tokens_in: totalTokensIn,
      tokens_out: totalTokensOut,
      duration_seconds: duration,
      current_step: agentBlocks.length > 1
        ? `Team of ${agentBlocks.length} complete — ready for debrief`
        : "Complete — ready for your review",
    });
  } catch (error) {
    console.error("Agent execution failed:", error);
    steps.forEach((s) => {
      if (s.status === "working" || s.status === "pending") s.status = "failed";
    });

    const failedAgent = agentBlocks[Math.min(
      agentBlocks.findIndex((_, idx) => {
        const blockStart = agentBlocks.slice(0, idx).reduce((sum, b) => sum + b.pipeline.length + (idx > 0 ? 1 : 0), 0);
        return globalStepIdx <= blockStart + agentBlocks[idx].pipeline.length;
      }),
      agentBlocks.length - 1
    )];

    await persistTaskUpdate(userId, taskId, {
      status: "failed",
      progress: 0,
      current_step: `Failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      output: `## Error\n\n${failedAgent?.agentName || "Agent"} encountered an error.\n\n\`\`\`\n${error instanceof Error ? error.message : "Unknown error"}\n\`\`\`\n\nPlease check your API key in Settings and try again.`,
    });
  } finally {
    markTaskDone(taskId);
    if (mcpClosers.length > 0) {
      await closeMCPConnections(mcpClosers);
    }
  }
}

// ── Tool Builder ─────────────────────────────────────────────

function buildToolsForStep(
  step: PipelineStep,
  toolKeys: UserToolKeys,
  parsedFileData: ParsedFileData | null,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tools: Record<string, any> = {};

  for (const toolId of step.tools || []) {
    switch (toolId) {
      case "web-search":
        // Smart fallback: Tavily if user has key (better quality), DuckDuckGo otherwise (free)
        if (toolKeys.tavily) {
          tools.web_search = createWebSearchTool(toolKeys.tavily);
        } else {
          tools.web_search = createDuckDuckGoSearchTool();
        }
        break;
      case "web-scrape":
        tools.web_scrape = createWebScrapeTool(toolKeys.firecrawl);
        break;
      case "finance-data":
        tools.get_stock_data = createFinanceDataTool();
        break;
      case "data-query":
        if (parsedFileData) {
          tools.query_data = createDataQueryTool(parsedFileData);
        }
        break;
      case "deep-research":
        // Deep research uses Tavily internally; if no Tavily key, skip (web_search via DDG covers it)
        if (toolKeys.tavily) {
          tools.deep_research = createDeepResearchTool(toolKeys.tavily);
        }
        break;
      case "calculator":
        tools.calculate = createCalculatorTool();
        break;
    }
  }

  return tools;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
