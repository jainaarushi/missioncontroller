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
    throw new Error(`Composio action failed: ${res.status} ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(`Composio: ${data.error}`);
  }

  return data.data || data;
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

  // Verify user has the app connected
  const connections = getConnectionStatus(user.id);
  const appKey = app as keyof typeof connections;
  if (!(appKey in connections) || !connections[appKey]) {
    return NextResponse.json(
      { error: `${app} is not connected. Connect it in Settings first.` },
      { status: 400 }
    );
  }

  // Allowlist of actions we support
  const ALLOWED_ACTIONS = new Set([
    "LINKEDIN_CREATE_POST",
    "LINKEDIN_SEND_CONNECTION_REQUEST",
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
    const result = await executeComposioAction(apiKey, action, user.id, params);
    incrementComposioUsage(user.id);

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("Template send error:", err);
    const message = err instanceof Error ? err.message : "Failed to send message";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
