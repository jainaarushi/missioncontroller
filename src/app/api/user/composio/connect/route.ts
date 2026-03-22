import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { isComposioEnabled, initiateComposioOAuth } from "@/lib/ai/composio/service";
import type { ComposioApp } from "@/lib/ai/composio/types";

const VALID_APPS = new Set<ComposioApp>(["linkedin", "gmail", "google_sheets", "google_calendar", "github"]);

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (user.isDemo) {
    return NextResponse.json({ error: "Sign in to connect apps" }, { status: 401 });
  }

  if (!isComposioEnabled()) {
    return NextResponse.json({ error: "Composio integration is not configured" }, { status: 503 });
  }

  const body = await request.json();
  const app = body.app as ComposioApp;

  if (!app || !VALID_APPS.has(app)) {
    return NextResponse.json({ error: "Invalid app. Must be one of: linkedin, gmail, google_sheets, google_calendar, github" }, { status: 400 });
  }

  try {
    const origin = request.nextUrl.origin;
    const returnTo = typeof body.returnTo === "string" ? body.returnTo : "";
    const callbackUrl = new URL(`${origin}/api/user/composio/callback`);
    callbackUrl.searchParams.set("app", app);
    if (returnTo && returnTo.startsWith("/")) {
      callbackUrl.searchParams.set("returnTo", returnTo);
    }
    const redirectUrl = await initiateComposioOAuth(user.id, app, callbackUrl.toString());

    return NextResponse.json({ redirectUrl, app });
  } catch (err) {
    console.error("Composio OAuth error:", err);
    return NextResponse.json({ error: "Failed to initiate connection" }, { status: 500 });
  }
}
