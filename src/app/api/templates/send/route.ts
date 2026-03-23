import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import {
  isComposioEnabled,
  getComposioApiKey,
  checkComposioUsage,
  incrementComposioUsage,
} from "@/lib/ai/composio/service";

const COMPOSIO_API_BASE = "https://backend.composio.dev/api/v2";
const COMPOSIO_API_V1 = "https://backend.composio.dev/api/v1";

/** Find the connected account ID for a user + app combo */
async function getConnectedAccountId(
  apiKey: string,
  entityId: string,
  appName: string,
): Promise<string | null> {
  try {
    const resp = await fetch(
      `${COMPOSIO_API_V1}/connectedAccounts?user_uuid=${entityId}&showActiveOnly=true`,
      { headers: { "x-api-key": apiKey }, signal: AbortSignal.timeout(10_000) }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    const items = data.items || [];
    const match = items.find(
      (item: { appName?: string }) =>
        item.appName?.toLowerCase() === appName.toLowerCase()
    );
    return match?.id || null;
  } catch {
    return null;
  }
}

async function executeComposioAction(
  apiKey: string,
  actionName: string,
  entityId: string,
  appName: string,
  connectedAccountId: string | null,
  params: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const url = `${COMPOSIO_API_BASE}/actions/${actionName}/execute`;

  // Build body — include connectedAccountId if we have it, otherwise appName + entityId
  const body: Record<string, unknown> = {
    entityId,
    appName: appName.toLowerCase(),
    input: params,
  };
  if (connectedAccountId) {
    body.connectedAccountId = connectedAccountId;
  }

  // Log action name only — no sensitive IDs
  console.log(`[Composio execute] ${actionName}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown error");
    throw new Error(`Composio action failed (${res.status}): ${errText.slice(0, 500)}`);
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(`Composio: ${data.error}`);
  }

  return data.data || data;
}

/**
 * GET /api/templates/send?app=linkedin
 * List available Composio actions + current user's connections only
 */
export async function GET(request: NextRequest) {
  const user = await getAuthUser();

  if (user.isDemo) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }

  const app = request.nextUrl.searchParams.get("app") || "LINKEDIN";
  const apiKey = getComposioApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "No Composio API key" }, { status: 500 });
  }

  try {
    // List actions + only THIS user's connected accounts
    const [actionsResp, connResp] = await Promise.all([
      fetch(
        `${COMPOSIO_API_V1}/actions?appNames=${app.toUpperCase()}&limit=50`,
        { headers: { "x-api-key": apiKey }, signal: AbortSignal.timeout(10_000) }
      ),
      fetch(
        `${COMPOSIO_API_V1}/connectedAccounts?user_uuid=${user.id}&showActiveOnly=true`,
        { headers: { "x-api-key": apiKey }, signal: AbortSignal.timeout(10_000) }
      ),
    ]);

    const actionsData = actionsResp.ok ? await actionsResp.json() : {};
    const connData = connResp.ok ? await connResp.json() : {};

    const actions = (actionsData.items || []).map(
      (a: { name?: string; displayName?: string; description?: string; appName?: string }) => ({
        name: a.name,
        displayName: a.displayName,
        appName: a.appName,
        description: a.description?.slice(0, 100),
      })
    );

    // Only return app names and status — no internal IDs
    const connections = (connData.items || []).map(
      (c: { appName?: string; status?: string }) => ({
        appName: c.appName,
        status: c.status,
      })
    );

    return NextResponse.json({ app, actions, connections });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * POST /api/templates/send
 * Sends a single draft message via Composio (LinkedIn, Gmail, etc.)
 */
export async function POST(request: NextRequest) {
  const user = await getAuthUser();

  if (user.isDemo) {
    return NextResponse.json(
      { error: "Sign in to send messages" },
      { status: 401 }
    );
  }

  const rl = rateLimit(`tmpl-send:${user.id}`, {
    maxRequests: 30,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait." },
      { status: 429 }
    );
  }

  if (!isComposioEnabled()) {
    return NextResponse.json(
      { error: "Composio is not configured. Add COMPOSIO_API_KEY to your environment." },
      { status: 500 }
    );
  }

  // Check monthly usage
  const usage = checkComposioUsage(user.id);
  if (!usage.allowed) {
    return NextResponse.json(
      { error: `Monthly Composio limit reached (${usage.used}/${usage.limit}). Resets next month.` },
      { status: 429 }
    );
  }

  let body: {
    app?: string;
    action?: string;
    params?: Record<string, unknown>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { app, action, params } = body;

  if (!app || !action || !params) {
    return NextResponse.json(
      { error: "app, action, and params are required" },
      { status: 400 }
    );
  }

  // Allowlist of actions we support
  const ALLOWED_ACTIONS = new Set([
    "LINKEDIN_CREATE_LINKED_IN_POST",
    "LINKEDIN_CREATE_ARTICLE_OR_URL_SHARE",
    "LINKEDIN_CREATE_COMMENT_ON_POST",
    "LINKEDIN_GET_PERSON",
    "LINKEDIN_GET_MY_INFO",
    "GMAIL_SEND_EMAIL",
  ]);
  if (!ALLOWED_ACTIONS.has(action)) {
    return NextResponse.json(
      { error: `Action ${action} is not supported` },
      { status: 400 }
    );
  }

  try {
    const apiKey = getComposioApiKey();

    // Look up the connected account ID for this user + app
    const connectedAccountId = await getConnectedAccountId(apiKey, user.id, app);
    console.log(`[templates/send] action=${action} user=${user.id.slice(0, 8)}... hasConnection=${!!connectedAccountId}`);

    if (!connectedAccountId) {
      return NextResponse.json(
        { error: `${app} is not connected. Connect it in Settings first.` },
        { status: 400 }
      );
    }

    const result = await executeComposioAction(apiKey, action, user.id, app, connectedAccountId, params);
    incrementComposioUsage(user.id);

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("Template send error:", err);
    const message = err instanceof Error ? err.message : "Failed to send message";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
