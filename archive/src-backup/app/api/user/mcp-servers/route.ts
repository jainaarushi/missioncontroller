import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { validateMCPServerUrl } from "@/lib/ai/mcp/client";
import { getUserMCPServers, addMCPServer, updateMCPServer, deleteMCPServer } from "@/lib/ai/mcp/storage";
import { MCP_SERVER_SUGGESTIONS } from "@/lib/ai/mcp/suggestions";
import type { MCPServerConfig, MCPServerType } from "@/lib/ai/mcp/types";

// GET — list all MCP servers for the user (with auth tokens masked)
export async function GET() {
  const user = await getAuthUser();
  if (user.isDemo) {
    return NextResponse.json({
      servers: [],
      suggestions: MCP_SERVER_SUGGESTIONS,
    });
  }

  const servers = await getUserMCPServers(user.id);

  // Mask auth tokens for display
  const masked = servers.map(s => ({
    ...s,
    authToken: s.authToken ? maskToken(s.authToken) : undefined,
  }));

  return NextResponse.json({
    servers: masked,
    suggestions: MCP_SERVER_SUGGESTIONS,
  });
}

// POST — add a new MCP server
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (user.isDemo) {
    return NextResponse.json({ error: "Sign in to configure MCP servers" }, { status: 401 });
  }

  // Rate limit: 10 server adds per minute
  const rl = rateLimit(`mcp:${user.id}`, { maxRequests: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const { name, url, authToken, agentSlugs, serverType } = body;

  // Validate required fields
  if (!name || typeof name !== "string" || name.length > 100) {
    return NextResponse.json({ error: "Server name is required (max 100 chars)" }, { status: 400 });
  }

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Server URL is required" }, { status: 400 });
  }

  // Validate URL security
  const urlCheck = validateMCPServerUrl(url);
  if (!urlCheck.valid) {
    return NextResponse.json({ error: urlCheck.error }, { status: 400 });
  }

  // Validate server type
  const validTypes: MCPServerType[] = [
    "github", "slack", "postgres", "mysql", "google-sheets", "google-calendar", "gmail",
    "jira", "linear", "notion", "salesforce", "hubspot", "sentry", "browserbase",
    "stripe", "discord", "trello", "asana", "figma", "twitter", "gitlab",
    "calendly", "posthog", "snowflake", "intercom", "telegram", "whatsapp",
    "zendesk", "shopify", "supabase", "firebase", "confluence", "airtable", "monday",
    "custom",
  ];
  if (!validTypes.includes(serverType)) {
    return NextResponse.json({ error: "Invalid server type" }, { status: 400 });
  }

  // Validate agent slugs
  if (agentSlugs && !Array.isArray(agentSlugs)) {
    return NextResponse.json({ error: "agentSlugs must be an array" }, { status: 400 });
  }

  const server: MCPServerConfig = {
    id: generateId(),
    name: name.trim().slice(0, 100),
    url: url.trim(),
    authToken: authToken?.trim() || undefined,
    agentSlugs: agentSlugs || [],
    enabled: true,
    serverType,
    createdAt: new Date().toISOString(),
  };

  const success = await addMCPServer(user.id, server);
  if (!success) {
    return NextResponse.json({ error: "Failed to add server. You may have reached the limit (20 servers)." }, { status: 400 });
  }

  return NextResponse.json({
    server: { ...server, authToken: server.authToken ? maskToken(server.authToken) : undefined },
  });
}

// PATCH — update an existing MCP server
export async function PATCH(request: NextRequest) {
  const user = await getAuthUser();
  if (user.isDemo) {
    return NextResponse.json({ error: "Sign in to configure MCP servers" }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Server ID is required" }, { status: 400 });
  }

  // Validate URL if being updated
  if (updates.url) {
    const urlCheck = validateMCPServerUrl(updates.url);
    if (!urlCheck.valid) {
      return NextResponse.json({ error: urlCheck.error }, { status: 400 });
    }
  }

  // Sanitize name
  if (updates.name) {
    updates.name = updates.name.trim().slice(0, 100);
  }

  const success = await updateMCPServer(user.id, id, updates);
  if (!success) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

// DELETE — remove an MCP server
export async function DELETE(request: NextRequest) {
  const user = await getAuthUser();
  if (user.isDemo) {
    return NextResponse.json({ error: "Sign in to configure MCP servers" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Server ID is required" }, { status: 400 });
  }

  const success = await deleteMCPServer(user.id, id);
  if (!success) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

// Helpers

function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "mcp_";
  for (let i = 0; i < 12; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function maskToken(token: string): string {
  if (token.length < 8) return "****";
  return token.slice(0, 6) + "****" + token.slice(-4);
}
