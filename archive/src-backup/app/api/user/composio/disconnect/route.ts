import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { isComposioEnabled, markAppDisconnected } from "@/lib/ai/composio/service";
import type { ComposioApp } from "@/lib/ai/composio/types";

const VALID_APPS = new Set<ComposioApp>(["linkedin", "gmail", "google_sheets", "google_calendar", "github"]);

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (user.isDemo) {
    return NextResponse.json({ error: "Sign in to manage apps" }, { status: 401 });
  }

  if (!isComposioEnabled()) {
    return NextResponse.json({ error: "Composio integration is not configured" }, { status: 503 });
  }

  const body = await request.json();
  const app = body.app as ComposioApp;

  if (!app || !VALID_APPS.has(app)) {
    return NextResponse.json({ error: "Invalid app" }, { status: 400 });
  }

  markAppDisconnected(user.id, app);

  return NextResponse.json({ success: true, app });
}
