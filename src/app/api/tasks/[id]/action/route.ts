import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getUserMCPServers } from "@/lib/ai/mcp/storage";
import { connectAndGetTools } from "@/lib/ai/mcp/client";
import type { MCPServerType } from "@/lib/ai/mcp/types";

const MAX_OUTPUT_LENGTH = 10_000;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await params; // consume params (task id available for future audit logging)

  const user = await getAuthUser();
  if (user.isDemo) {
    return NextResponse.json({ error: "Sign in to use actions" }, { status: 401 });
  }

  // Rate limit: 5 actions per minute per user
  const rl = rateLimit(`action:${user.id}`, { maxRequests: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many actions. Please wait a moment." }, { status: 429 });
  }

  let body: { serverType?: string; toolPattern?: string; output?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { serverType, toolPattern, output } = body;
  if (!serverType || !toolPattern || !output) {
    return NextResponse.json({ error: "Missing serverType, toolPattern, or output" }, { status: 400 });
  }

  // Find user's enabled server matching the requested type
  const servers = await getUserMCPServers(user.id);
  const server = servers.find(s => s.enabled && s.serverType === (serverType as MCPServerType));
  if (!server) {
    return NextResponse.json({ error: `No connected ${serverType} server found. Add one in Settings.` }, { status: 404 });
  }

  let close: (() => Promise<void>) | null = null;
  try {
    // Connect and discover tools
    const result = await connectAndGetTools(server);
    close = result.close;

    // Find a tool matching the pattern
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

    // Truncate output if too large
    const truncatedOutput = output.length > MAX_OUTPUT_LENGTH
      ? output.slice(0, MAX_OUTPUT_LENGTH) + "\n\n[Output truncated to 10,000 characters]"
      : output;

    // Inspect tool schema to guess the right parameter name
    const paramName = guessContentParam(tool);
    const toolInput = { [paramName]: truncatedOutput };

    // Execute the tool
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

/**
 * Guess the content parameter name from a tool's schema.
 * Looks for common names like content, text, body, message, description.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function guessContentParam(tool: any): string {
  const candidates = ["content", "text", "body", "message", "description", "data", "value", "input"];
  try {
    const schema = tool.parameters?.properties || tool.inputSchema?.properties || {};
    const keys = Object.keys(schema);
    for (const candidate of candidates) {
      if (keys.includes(candidate)) return candidate;
    }
    // If none match, try finding a string-type property
    for (const [key, val] of Object.entries(schema)) {
      if ((val as { type?: string })?.type === "string") return key;
    }
    // Fallback to first property or "content"
    return keys[0] || "content";
  } catch {
    return "content";
  }
}
