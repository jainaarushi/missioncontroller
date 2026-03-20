import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getUserMCPServers } from "@/lib/ai/mcp/storage";
import { connectAndGetTools } from "@/lib/ai/mcp/client";
import type { MCPServerType } from "@/lib/ai/mcp/types";
import { isComposioEnabled, getComposioApiKey, checkComposioUsage, incrementComposioUsage } from "@/lib/ai/composio/service";

const MAX_OUTPUT_LENGTH = 10_000;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;

  const user = await getAuthUser();
  if (user.isDemo) {
    return NextResponse.json({ error: "Sign in to use actions" }, { status: 401 });
  }

  const rl = rateLimit(`action:${user.id}`, { maxRequests: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many actions. Please wait a moment." }, { status: 429 });
  }

  let body: { serverType?: string; toolPattern?: string; output?: string; composioAction?: string; composioParams?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // ── Composio action path ──
  if (body.composioAction) {
    if (!isComposioEnabled()) {
      return NextResponse.json({ error: "Composio is not configured. Add COMPOSIO_API_KEY in environment." }, { status: 503 });
    }

    const usage = checkComposioUsage(user.id);
    if (!usage.allowed) {
      return NextResponse.json({ error: `Monthly Composio limit reached (${usage.used}/${usage.limit}). Resets next month.` }, { status: 429 });
    }

    try {
      const apiKey = getComposioApiKey();
      const res = await fetch(`https://backend.composio.dev/api/v2/actions/${body.composioAction}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify({ entityId: user.id, input: body.composioParams || {} }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "Unknown error");
        console.error(`[Composio Action] ${body.composioAction} failed (${res.status}):`, errText);
        return NextResponse.json({ error: `Composio action failed: ${errText.slice(0, 200)}` }, { status: 502 });
      }

      const data = await res.json();
      incrementComposioUsage(user.id);

      if (data.error) {
        return NextResponse.json({ error: `Composio: ${data.error}` }, { status: 502 });
      }

      return NextResponse.json({ success: true, result: data.data || data });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Composio action failed";
      console.error(`[Composio Action] Failed:`, err);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // ── MCP action path (existing) ──
  const { serverType, toolPattern, output } = body;
  if (!serverType || !toolPattern || !output) {
    return NextResponse.json({ error: "Missing serverType, toolPattern, or output" }, { status: 400 });
  }

  const servers = await getUserMCPServers(user.id);
  const server = servers.find(s => s.enabled && s.serverType === (serverType as MCPServerType));
  if (!server) {
    return NextResponse.json({ error: `No connected ${serverType} server found. Add one in Settings.` }, { status: 404 });
  }

  let close: (() => Promise<void>) | null = null;
  try {
    const result = await connectAndGetTools(server);
    close = result.close;

    const pattern = new RegExp(toolPattern, "i");
    const toolEntries = Object.entries(result.tools);
    const matchedEntry = toolEntries.find(([name]) => pattern.test(name));

    if (!matchedEntry) {
      return NextResponse.json(
        { error: `No compatible tool found on your ${server.name}. Try reconnecting the server.` },
        { status: 404 }
      );
    }

    const [toolName, tool] = matchedEntry;

    if (!tool.execute) {
      return NextResponse.json({ error: `Tool "${toolName}" does not support execution` }, { status: 400 });
    }

    const truncatedOutput = output.length > MAX_OUTPUT_LENGTH
      ? output.slice(0, MAX_OUTPUT_LENGTH) + "\n\n[Output truncated to 10,000 characters]"
      : output;

    const paramName = guessContentParam(tool);
    const toolInput = { [paramName]: truncatedOutput };
    const toolResult = await tool.execute(toolInput, {});

    return NextResponse.json({ success: true, result: toolResult });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Action failed";
    console.error(`MCP action failed (${serverType}):`, err);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (close) {
      try { await close(); } catch { /* ignore cleanup errors */ }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function guessContentParam(tool: any): string {
  const candidates = ["content", "text", "body", "message", "description", "data", "value", "input"];
  try {
    const schema = tool.parameters?.properties || tool.inputSchema?.properties || {};
    const keys = Object.keys(schema);
    for (const candidate of candidates) {
      if (keys.includes(candidate)) return candidate;
    }
    for (const [key, val] of Object.entries(schema)) {
      if ((val as { type?: string })?.type === "string") return key;
    }
    return keys[0] || "content";
  } catch {
    return "content";
  }
}
