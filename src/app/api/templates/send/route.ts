import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import {
  isComposioEnabled,
  getComposioApiKey,
  getConnectionStatus,
  checkComposioUsage,
  incrementComposioUsage,
} from "@/lib/ai/composio/service";

const COMPOSIO_API_BASE = "https://backend.composio.dev/api/v2";

async function executeComposioAction(
  apiKey: string,
  actionName: string,
  entityId: string,
  params: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const url = `${COMPOSIO_API_BASE}/actions/${actionName}/execute`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      entityId,
      input: params,
    }),
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
 * Debug: list available Composio actions for an app
 */
export async function GET(request: NextRequest) {
  const app = request.nextUrl.searchParams.get("app") || "LINKEDIN";
  const apiKey = getComposioApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "No Composio API key" }, { status: 500 });
  }

  try {
    const resp = await fetch(
      `${COMPOSIO_API_BASE}/actions?appNames=${app.toUpperCase()}&limit=50`,
      { headers: { "x-api-key": apiKey }, signal: AbortSignal.timeout(10_000) }
    );
    const data = await resp.json();
    const actions = (data.items || []).map(
      (a: { name?: string; displayName?: string; description?: string }) => ({
        name: a.name,
        displayName: a.displayName,
        description: a.description?.slice(0, 100),
      })
    );
    return NextResponse.json({ app, actions });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * POST /api/templates/send
 * Sends a single draft message via Composio (LinkedIn, Gmail, etc.)
 *
 * Body: { app: "linkedin", action: "LINKEDIN_CREATE_POST", params: { text: "..." } }
 * Or:   { app: "linkedin", action: "LINKEDIN_SEND_CONNECTION_REQUEST", params: { ... } }
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

  // Check Composio directly for connected accounts instead of in-memory store
  // (the in-memory store resets on every deploy/restart)
  try {
    const apiKey = getComposioApiKey();
    const connResp = await fetch(
      `https://backend.composio.dev/api/v1/connectedAccounts?user_uuid=${user.id}&status=ACTIVE`,
      { headers: { "x-api-key": apiKey }, signal: AbortSignal.timeout(10_000) }
    );
    if (connResp.ok) {
      const connData = await connResp.json();
      const items = connData.items || [];
      const hasApp = items.some(
        (item: { appName?: string }) =>
          item.appName?.toLowerCase() === app.toLowerCase()
      );
      if (!hasApp) {
        return NextResponse.json(
          { error: `${app} is not connected. Connect it in Settings first.` },
          { status: 400 }
        );
      }
    }
  } catch {
    // If check fails, proceed anyway — let Composio return its own error
    console.warn("[templates/send] Could not verify connection status, proceeding anyway");
  }

  // Allowlist of actions we support
  const ALLOWED_ACTIONS = new Set([
    "LINKEDIN_CREATE_POST",
    "LINKEDIN_CREATE_LINKED_POST",
    "LINKEDIN_SEND_CONNECTION_REQUEST",
    "LINKEDIN_SEND_MESSAGE",
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

    // Log the outgoing request for debugging
    console.log(`[templates/send] action=${action} entityId=${user.id} params=`, JSON.stringify(params).slice(0, 300));

    const result = await executeComposioAction(apiKey, action, user.id, params);
    incrementComposioUsage(user.id);

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("Template send error:", err);
    const message = err instanceof Error ? err.message : "Failed to send message";

    // If action failed, try to list available actions for debugging
    try {
      const apiKey = getComposioApiKey();
      const actionsResp = await fetch(
        `https://backend.composio.dev/api/v2/actions?appNames=${app.toUpperCase()}&limit=20`,
        { headers: { "x-api-key": apiKey }, signal: AbortSignal.timeout(5_000) }
      );
      if (actionsResp.ok) {
        const actionsData = await actionsResp.json();
        const available = (actionsData.items || []).map(
          (a: { name?: string; displayName?: string }) => a.name || a.displayName
        );
        console.log(`[templates/send] Available ${app} actions:`, available.join(", "));
        return NextResponse.json(
          { error: message, availableActions: available },
          { status: 500 }
        );
      }
    } catch {
      // ignore
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
