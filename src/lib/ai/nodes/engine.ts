// Deterministic node engine — executes PipelineGraph nodes sequentially
// Search and scrape nodes always run (not LLM-decided)

import type { NodeDef, NodeContext, PipelineGraph, SearchConfig, ScrapeConfig, AIConfig, TransformConfig, CalculatorConfig } from "./types";
import { resolveTemplate } from "./template-resolver";
import { applyTransform } from "./transforms";
import type { TaskStep } from "@/lib/types/task";
import type { UserToolKeys } from "@/lib/ai/get-tool-keys";
import type { MCPServerConfig } from "@/lib/ai/mcp/types";

export interface ExecuteGraphOptions {
  graph: PipelineGraph;
  taskId: string;
  taskTitle: string;
  taskDescription: string | null;
  provider: "openai" | "gemini" | "anthropic";
  apiKey: string;
  toolKeys: UserToolKeys;
  steps: TaskStep[];
  agentSlug: string;
  mcpServers?: MCPServerConfig[];
  onProgress: (stepIdx: number, progress: number, currentStep: string) => Promise<void>;
}

export async function executeGraph(opts: ExecuteGraphOptions): Promise<{
  output: string;
  tokensIn: number;
  tokensOut: number;
}> {
  const { graph, taskTitle, taskDescription, provider, apiKey, toolKeys, steps, agentSlug, mcpServers, onProgress } = opts;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const ctx: NodeContext = {
    taskTitle,
    taskDescription,
    today,
    outputs: {},
    latestText: taskDescription || taskTitle,
  };

  let totalTokensIn = 0;
  let totalTokensOut = 0;
  let lastTextOutput = "";

  // ── Connect MCP servers (once, shared across all AI nodes) ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mcpTools: Record<string, any> = {};
  let mcpClosers: Array<() => Promise<void>> = [];

  if (mcpServers && mcpServers.length > 0) {
    try {
      const { getMCPToolsForAgent } = await import("@/lib/ai/mcp/client");
      const mcpResult = await getMCPToolsForAgent(mcpServers, agentSlug);
      mcpTools = mcpResult.tools;
      mcpClosers = mcpResult.closers;
      if (mcpResult.connectedServers.length > 0) {
        console.log(`[NodeEngine] MCP connected: ${mcpResult.connectedServers.join(", ")}`);
      }
      if (mcpResult.errors.length > 0) {
        console.warn("[NodeEngine] MCP connection errors:", mcpResult.errors);
      }
    } catch (err) {
      console.error("[NodeEngine] MCP setup failed (continuing without MCP):", err);
    }
  }

  try {
    for (let i = 0; i < graph.nodes.length; i++) {
      const node = graph.nodes[i];
      const step = steps[i];
      if (!step) continue;

      // Mark running
      step.status = "working";
      step.started_at = new Date().toISOString();
      await onProgress(i, Math.min(Math.round(((i + 0.5) / graph.nodes.length) * 100), 95), node.description);

      try {
        const result = await executeNode(node, ctx, provider, apiKey, toolKeys, mcpTools);

        // Store output
        ctx.outputs[node.id] = result.text;
        if (result.text) {
          ctx.latestText = result.text;
          lastTextOutput = result.text;
        }
        totalTokensIn += result.tokensIn;
        totalTokensOut += result.tokensOut;

        step.status = "done";
        step.completed_at = new Date().toISOString();
        step.tokens_used = result.tokensIn + result.tokensOut;
        step.output = result.text || undefined;
      } catch (err) {
        step.status = "failed";
        step.completed_at = new Date().toISOString();
        step.output = `Error: ${err instanceof Error ? err.message : "Unknown error"}`;
        // Continue to next node instead of failing the whole pipeline
        console.error(`[NodeEngine] Node ${node.id} failed:`, err);
      }

      await onProgress(i, Math.min(Math.round(((i + 1) / graph.nodes.length) * 100), 95), node.label);
    }
  } finally {
    // ── Clean up MCP connections ──
    if (mcpClosers.length > 0) {
      const { closeMCPConnections } = await import("@/lib/ai/mcp/client");
      await closeMCPConnections(mcpClosers);
    }
  }

  return {
    output: lastTextOutput,
    tokensIn: totalTokensIn,
    tokensOut: totalTokensOut,
  };
}

// ─── Per-node executors ───

interface NodeResult {
  text: string;
  tokensIn: number;
  tokensOut: number;
}

async function executeNode(
  node: NodeDef,
  ctx: NodeContext,
  provider: "openai" | "gemini" | "anthropic",
  apiKey: string,
  toolKeys: UserToolKeys,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mcpTools: Record<string, any>,
): Promise<NodeResult> {
  switch (node.config.type) {
    case "input":
      return executeInputNode(ctx);
    case "search":
      return executeSearchNode(node.config, ctx, toolKeys);
    case "scrape":
      return executeScrapeNode(node.config, ctx, toolKeys);
    case "ai":
      return executeAINode(node.config, ctx, provider, apiKey, toolKeys, mcpTools);
    case "transform":
      return executeTransformNode(node.config, ctx);
    case "calculator":
      return executeCalculatorNode(node.config, ctx);
    case "output":
      return executeOutputNode(node.config, ctx);
    default:
      return { text: "", tokensIn: 0, tokensOut: 0 };
  }
}

// ─── Input ───
function executeInputNode(ctx: NodeContext): NodeResult {
  return {
    text: ctx.taskDescription || ctx.taskTitle,
    tokensIn: 0,
    tokensOut: 0,
  };
}

// ─── Search (deterministic — always runs) ───
async function executeSearchNode(
  config: SearchConfig,
  ctx: NodeContext,
  toolKeys: UserToolKeys,
): Promise<NodeResult> {
  const { createDuckDuckGoSearchTool } = await import("@/lib/ai/tools/duckduckgo");
  const { createWebSearchTool } = await import("@/lib/ai/tools/web-search");

  const queries = typeof config.queries === "function"
    ? config.queries(ctx)
    : config.queries.map(q => resolveTemplate(q, ctx));

  const maxResults = config.maxResults || 5;
  const allResults: Array<{ title: string; url: string; content: string }> = [];

  // Use Tavily if available, otherwise DuckDuckGo
  const useTavily = !!toolKeys.tavily;

  for (const query of queries) {
    try {
      if (useTavily) {
        const tool = createWebSearchTool(toolKeys.tavily!);
        const res = await tool.execute({ query, search_depth: "basic", max_results: maxResults });
        if (res.results) allResults.push(...res.results);
      } else {
        const tool = createDuckDuckGoSearchTool();
        const res = await tool.execute({ query, max_results: maxResults });
        if (res.results) allResults.push(...res.results);
      }
    } catch (err) {
      console.warn(`[NodeEngine] Search query "${query}" failed:`, err);
    }
  }

  // Format results as text for downstream nodes
  const text = allResults.length > 0
    ? allResults.map((r, i) => `[${i + 1}] ${r.title}\n${r.url}\n${r.content}`).join("\n\n")
    : `No search results found for: ${queries.join(", ")}. Proceeding with available context.`;

  return { text, tokensIn: 0, tokensOut: 0 };
}

// ─── Scrape (deterministic — always runs) ───
async function executeScrapeNode(
  config: ScrapeConfig,
  ctx: NodeContext,
  toolKeys: UserToolKeys,
): Promise<NodeResult> {
  const { createWebScrapeTool } = await import("@/lib/ai/tools/web-scrape");
  const tool = createWebScrapeTool(toolKeys.firecrawl);

  // Extract URLs from the referenced node's output
  const sourceOutput = String(ctx.outputs[config.urlsFrom] || "");
  const urlRegex = /https?:\/\/[^\s<>"')\]]+/g;
  const urls = (sourceOutput.match(urlRegex) || [])
    .map(u => u.replace(/[.,;:!?)]+$/, ""))
    .filter((u, i, arr) => arr.indexOf(u) === i)
    .slice(0, config.maxUrls || 3);

  if (urls.length === 0) {
    return { text: "No URLs found to scrape from search results.", tokensIn: 0, tokensOut: 0 };
  }

  const scraped: string[] = [];
  for (const url of urls) {
    try {
      const res = await tool.execute({ url });
      if (res.content && res.content.length > 50) {
        scraped.push(`## ${url}\n${res.content.slice(0, 5000)}`);
      }
    } catch (err) {
      console.warn(`[NodeEngine] Scrape ${url} failed:`, err);
    }
  }

  return {
    text: scraped.length > 0 ? scraped.join("\n\n---\n\n") : "Could not scrape content from the found URLs.",
    tokensIn: 0,
    tokensOut: 0,
  };
}

// ─── AI (uses generateText with optional tools) ───
async function executeAINode(
  config: AIConfig,
  ctx: NodeContext,
  provider: "openai" | "gemini" | "anthropic",
  apiKey: string,
  toolKeys: UserToolKeys,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mcpTools: Record<string, any>,
): Promise<NodeResult> {
  const { generateText } = await import("ai");
  const { createUserAnthropic, createUserGemini, createUserOpenAI, PROVIDER_MODELS } = await import("@/lib/ai/client");

  const modelId = PROVIDER_MODELS[provider].default;
  const aiModel = provider === "openai"
    ? createUserOpenAI(apiKey)(modelId)
    : provider === "gemini"
    ? createUserGemini(apiKey)(modelId)
    : createUserAnthropic(apiKey)(modelId);

  // Build system prompt
  let systemPrompt = config.systemPrompt || "";
  if (config.specialistSlug) {
    const { getSpecialistPrompt } = await import("@/lib/ai/pipelines");
    systemPrompt = getSpecialistPrompt(config.specialistSlug) || systemPrompt;
  }
  if (!systemPrompt) {
    systemPrompt = "You are a helpful expert assistant. Provide thorough, actionable, well-structured responses.";
  }

  systemPrompt += `\n\nToday's date: ${ctx.today}`;

  // Resolve user prompt template
  const userMessage = resolveTemplate(config.userPromptTemplate, ctx);

  // Build tools if configured
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tools: Record<string, any> = {};
  if (config.tools && config.tools.length > 0) {
    for (const toolId of config.tools) {
      switch (toolId) {
        case "web-search": {
          if (toolKeys.tavily) {
            const { createWebSearchTool } = await import("@/lib/ai/tools/web-search");
            tools.web_search = createWebSearchTool(toolKeys.tavily);
          } else {
            const { createDuckDuckGoSearchTool } = await import("@/lib/ai/tools/duckduckgo");
            tools.web_search = createDuckDuckGoSearchTool();
          }
          break;
        }
        case "web-scrape": {
          const { createWebScrapeTool } = await import("@/lib/ai/tools/web-scrape");
          tools.web_scrape = createWebScrapeTool(toolKeys.firecrawl);
          break;
        }
        case "calculator": {
          const { createCalculatorTool } = await import("@/lib/ai/tools/calculator");
          tools.calculate = createCalculatorTool();
          break;
        }
        case "finance-data": {
          const { createFinanceDataTool } = await import("@/lib/ai/tools/finance-data");
          tools.get_stock_data = createFinanceDataTool();
          break;
        }
        case "deep-research": {
          if (toolKeys.tavily) {
            const { createDeepResearchTool } = await import("@/lib/ai/tools/deep-research");
            tools.deep_research = createDeepResearchTool(toolKeys.tavily);
          }
          break;
        }
      }
    }
  }

  // Merge MCP tools with built-in tools
  const allTools = { ...tools, ...mcpTools };
  const hasTools = Object.keys(allTools).length > 0;

  // Tell the AI about MCP tools if present
  if (Object.keys(mcpTools).length > 0) {
    const mcpToolNames = Object.keys(mcpTools).join(", ");
    systemPrompt += `\n\nYou also have access to external MCP tools: ${mcpToolNames}. Use them when relevant to the task.`;
  }

  const result = await generateText({
    model: aiModel,
    system: systemPrompt,
    prompt: userMessage,
    ...(hasTools ? { tools: allTools, maxSteps: config.maxToolSteps || 3 } : {}),
  });

  const usage = result.usage as { inputTokens?: number; outputTokens?: number; promptTokens?: number; completionTokens?: number } | undefined;

  return {
    text: result.text || "",
    tokensIn: (usage?.inputTokens || usage?.promptTokens || 0),
    tokensOut: (usage?.outputTokens || usage?.completionTokens || 0),
  };
}

// ─── Transform ───
function executeTransformNode(
  config: TransformConfig,
  ctx: NodeContext,
): NodeResult {
  const inputs = config.inputFrom.map(id => String(ctx.outputs[id] || ""));
  const text = applyTransform(config.transform, inputs, ctx);
  return { text, tokensIn: 0, tokensOut: 0 };
}

// ─── Calculator ───
async function executeCalculatorNode(
  config: CalculatorConfig,
  ctx: NodeContext,
): Promise<NodeResult> {
  const { createCalculatorTool } = await import("@/lib/ai/tools/calculator");
  const tool = createCalculatorTool();
  const expression = resolveTemplate(config.expressionTemplate, ctx);

  const res = await tool.execute({ expression, label: "" });
  if ("error" in res) {
    return { text: `Calculator error: ${res.error}`, tokensIn: 0, tokensOut: 0 };
  }
  return { text: `${res.formatted} (${res.expression} = ${res.result})`, tokensIn: 0, tokensOut: 0 };
}

// ─── Output ───
function executeOutputNode(
  config: { type: "output"; inputFrom?: string },
  ctx: NodeContext,
): NodeResult {
  const text = config.inputFrom
    ? String(ctx.outputs[config.inputFrom] || ctx.latestText)
    : ctx.latestText;
  return { text, tokensIn: 0, tokensOut: 0 };
}

// ─── Helper ───
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
