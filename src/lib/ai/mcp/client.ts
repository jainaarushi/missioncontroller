import type { MCPServerConfig } from "./types";

// Timeout for MCP connection and tool calls (safety limit)
const MCP_CONNECT_TIMEOUT_MS = 15_000;
const MCP_TOOL_CALL_TIMEOUT_MS = 30_000;

// Max tools per MCP server (prevents abuse from malicious servers)
const MAX_TOOLS_PER_SERVER = 50;

// URL allowlist patterns for security
const BLOCKED_URL_PATTERNS = [
  /^file:\/\//i,
  /^javascript:/i,
  /^data:/i,
  /localhost.*\/api\//i, // Block access to our own API routes
];

/**
 * Validate an MCP server URL before connecting.
 * Blocks dangerous URLs and ensures HTTPS for non-localhost.
 */
export function validateMCPServerUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);

    // Must be http or https
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, error: "URL must use http:// or https:// protocol" };
    }

    // Check blocked patterns
    for (const pattern of BLOCKED_URL_PATTERNS) {
      if (pattern.test(url)) {
        return { valid: false, error: "This URL is not allowed for security reasons" };
      }
    }

    // Non-localhost must use HTTPS
    const isLocalhost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1" || parsed.hostname === "::1";
    if (!isLocalhost && parsed.protocol !== "https:") {
      return { valid: false, error: "Remote MCP servers must use HTTPS" };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

/**
 * Connect to an MCP server and retrieve its tools.
 * Returns tools compatible with Vercel AI SDK's generateText().
 *
 * Security measures:
 * - URL validation (HTTPS required for remote, blocked patterns)
 * - Connection timeout (10s)
 * - Tool count limit (50 per server)
 * - Tool call timeout (30s per call)
 * - Proper cleanup on failure
 */
export async function connectAndGetTools(
  server: MCPServerConfig
): Promise<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools: Record<string, any>;
  close: () => Promise<void>;
  serverName: string;
}> {
  // Validate URL before connecting
  const urlCheck = validateMCPServerUrl(server.url);
  if (!urlCheck.valid) {
    throw new Error(`MCP server "${server.name}": ${urlCheck.error}`);
  }

  const { createMCPClient } = await import("@ai-sdk/mcp");

  // Build headers with auth if provided
  const headers: Record<string, string> = {};
  if (server.authToken) {
    if (server.serverType === "composio") {
      // Composio uses x-api-key header, not Authorization: Bearer
      headers["x-api-key"] = server.authToken.replace(/^Bearer\s+/i, "");
    } else {
      // Standard MCP servers use Bearer auth
      headers["Authorization"] = server.authToken.startsWith("Bearer ")
        ? server.authToken
        : `Bearer ${server.authToken}`;
    }
  }

  // Detect transport type from URL or server type
  // Composio MCP uses SSE transport
  const transportType = (server.url.includes("/sse") || server.serverType === "composio")
    ? "sse" as const
    : "http" as const;

  // For SSE transport, ensure URL ends with /sse (standard MCP SSE endpoint path)
  let connectUrl = server.url;
  if (transportType === "sse" && !connectUrl.includes("/sse")) {
    // Append /sse before query params
    const urlObj = new URL(connectUrl);
    urlObj.pathname = urlObj.pathname.replace(/\/$/, "") + "/sse";
    connectUrl = urlObj.toString();
  }

  console.log(`[MCP] Connecting to "${server.name}" (${transportType}) at ${connectUrl}`);

  // Connect with timeout
  const client = await Promise.race([
    createMCPClient({
      transport: {
        type: transportType,
        url: connectUrl,
        headers,
      },
      name: `agent-studio-${server.id}`,
      version: "1.0.0",
      onUncaughtError: (error) => {
        console.error(`MCP server "${server.name}" error:`, error);
      },
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`MCP connection to "${server.name}" timed out after ${MCP_CONNECT_TIMEOUT_MS / 1000}s`)), MCP_CONNECT_TIMEOUT_MS)
    ),
  ]);

  try {
    // Get tools from the MCP server
    const mcpTools = await Promise.race([
      client.tools(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Tool discovery from "${server.name}" timed out`)), MCP_CONNECT_TIMEOUT_MS)
      ),
    ]);

    // Limit tools per server (safety)
    const toolEntries = Object.entries(mcpTools);
    if (toolEntries.length > MAX_TOOLS_PER_SERVER) {
      console.warn(`MCP server "${server.name}" has ${toolEntries.length} tools, limiting to ${MAX_TOOLS_PER_SERVER}`);
    }

    // Wrap tools with timeout protection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const safeTools: Record<string, any> = {};
    for (const [name, tool] of toolEntries.slice(0, MAX_TOOLS_PER_SERVER)) {
      // Prefix tool names with server type to avoid collisions
      const safeName = `mcp_${server.serverType}_${name}`;
      safeTools[safeName] = {
        ...tool,
        // Wrap execute with timeout
        execute: tool.execute
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? async (input: any, options: any) => {
              return Promise.race([
                tool.execute!(input, options),
                new Promise<never>((_, reject) =>
                  setTimeout(
                    () => reject(new Error(`MCP tool "${name}" on "${server.name}" timed out after ${MCP_TOOL_CALL_TIMEOUT_MS / 1000}s`)),
                    MCP_TOOL_CALL_TIMEOUT_MS
                  )
                ),
              ]);
            }
          : undefined,
      };
    }

    return {
      tools: safeTools,
      close: () => client.close(),
      serverName: server.name,
    };
  } catch (error) {
    // Clean up on failure
    try { await client.close(); } catch { /* ignore cleanup errors */ }
    throw error;
  }
}

/**
 * Connect to multiple MCP servers for a given agent.
 * Merges all tools, handles partial failures gracefully.
 */
export async function getMCPToolsForAgent(
  servers: MCPServerConfig[],
  agentSlug: string,
): Promise<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools: Record<string, any>;
  closers: Array<() => Promise<void>>;
  connectedServers: string[];
  errors: string[];
}> {
  // Filter to enabled servers that apply to this agent
  const applicableServers = servers.filter(s => {
    if (!s.enabled) return false;
    if (s.agentSlugs.length === 0) return true; // Empty = all agents
    return s.agentSlugs.includes(agentSlug);
  });

  if (applicableServers.length === 0) {
    return { tools: {}, closers: [], connectedServers: [], errors: [] };
  }

  // Connect to all applicable servers in parallel
  const results = await Promise.allSettled(
    applicableServers.map(server => connectAndGetTools(server))
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allTools: Record<string, any> = {};
  const closers: Array<() => Promise<void>> = [];
  const connectedServers: string[] = [];
  const errors: string[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const server = applicableServers[i];

    if (result.status === "fulfilled") {
      Object.assign(allTools, result.value.tools);
      closers.push(result.value.close);
      connectedServers.push(server.name);
    } else {
      const errorMsg = result.reason instanceof Error ? result.reason.message : "Connection failed";
      errors.push(`${server.name}: ${errorMsg}`);
      console.error(`MCP server "${server.name}" failed:`, result.reason);
    }
  }

  return { tools: allTools, closers, connectedServers, errors };
}

/**
 * Close all MCP connections safely.
 */
export async function closeMCPConnections(closers: Array<() => Promise<void>>): Promise<void> {
  await Promise.allSettled(closers.map(close => close()));
}
