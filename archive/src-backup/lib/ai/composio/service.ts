// Composio MCP platform-level service
// Uses YOUR Composio API key but scopes data per user via user_id

import type { ComposioApp, ComposioConnectionStatus } from "./types";

// In-memory store for demo/local mode (Supabase users would store in DB)
const connectionStore = new Map<string, Set<ComposioApp>>();

// ── Per-user Composio usage tracking ──
// Tracks tool-call runs per user per calendar month.
// Default: 50 runs/user/month (each task run = 1 unit).
// Override via COMPOSIO_MAX_RUNS_PER_USER env var.
const usageStore = new Map<string, { month: string; count: number }>();

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMaxRunsPerUser(): number {
  return parseInt(process.env.COMPOSIO_MAX_RUNS_PER_USER || "50", 10);
}

/** Check if user is within their monthly Composio usage limit */
export function checkComposioUsage(userId: string): { allowed: boolean; used: number; limit: number; resetsAt: string } {
  const month = currentMonth();
  const limit = getMaxRunsPerUser();
  const entry = usageStore.get(userId);

  // Reset if new month
  if (!entry || entry.month !== month) {
    return { allowed: true, used: 0, limit, resetsAt: `${month}-01` };
  }

  return { allowed: entry.count < limit, used: entry.count, limit, resetsAt: `${month}-01` };
}

/** Increment usage after a Composio-enabled task run */
export function incrementComposioUsage(userId: string): void {
  const month = currentMonth();
  const entry = usageStore.get(userId);

  if (!entry || entry.month !== month) {
    usageStore.set(userId, { month, count: 1 });
  } else {
    entry.count++;
  }
}

/** Get usage stats for a user (for status endpoint) */
export function getComposioUsage(userId: string): { used: number; limit: number; month: string } {
  const month = currentMonth();
  const limit = getMaxRunsPerUser();
  const entry = usageStore.get(userId);

  if (!entry || entry.month !== month) {
    return { used: 0, limit, month };
  }
  return { used: entry.count, limit, month };
}

export function isComposioEnabled(): boolean {
  return !!process.env.COMPOSIO_API_KEY;
}

export function getComposioApiKey(): string {
  return process.env.COMPOSIO_API_KEY || "";
}

/** Look up the Composio integration UUID for an app name */
async function getIntegrationId(apiKey: string, appName: string): Promise<string> {
  const resp = await fetch(`https://backend.composio.dev/api/v1/integrations?appName=${appName}`, {
    headers: { "x-api-key": apiKey },
  });
  if (!resp.ok) throw new Error(`Failed to fetch integrations for ${appName}`);
  const data = await resp.json();
  const items = data.items || [];
  if (items.length === 0) throw new Error(`No Composio integration found for ${appName}. Set one up at app.composio.dev`);
  return items[0].id;
}

/** Initiate OAuth for a specific Composio app. Returns redirect URL. */
export async function initiateComposioOAuth(
  userId: string,
  app: ComposioApp,
  callbackUrl: string,
): Promise<string> {
  const apiKey = getComposioApiKey();

  // Look up the real integration UUID for this app
  const integrationId = await getIntegrationId(apiKey, app);

  const resp = await fetch("https://backend.composio.dev/api/v1/connectedAccounts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      integrationId,
      entityId: userId,
      redirectUri: callbackUrl,
      data: {},
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Composio OAuth initiation failed: ${err}`);
  }

  const data = await resp.json();
  return data.redirectUrl || data.url || "";
}

/** Store that a user has connected an app */
export function markAppConnected(userId: string, app: ComposioApp): void {
  if (!connectionStore.has(userId)) {
    connectionStore.set(userId, new Set());
  }
  connectionStore.get(userId)!.add(app);
}

/** Remove a user's app connection */
export function markAppDisconnected(userId: string, app: ComposioApp): void {
  connectionStore.get(userId)?.delete(app);
}

/** Check which apps a user has connected */
export function getConnectionStatus(userId: string): ComposioConnectionStatus {
  const connected = connectionStore.get(userId) || new Set();
  return {
    linkedin: connected.has("linkedin"),
    gmail: connected.has("gmail"),
    google_sheets: connected.has("google_sheets"),
    google_calendar: connected.has("google_calendar"),
    github: connected.has("github"),
  };
}

/** Check if user has any Composio connections */
export function hasAnyConnection(userId: string): boolean {
  const connected = connectionStore.get(userId);
  return !!connected && connected.size > 0;
}
