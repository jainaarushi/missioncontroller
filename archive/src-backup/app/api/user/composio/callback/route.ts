import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { markAppConnected } from "@/lib/ai/composio/service";
import type { ComposioApp } from "@/lib/ai/composio/types";

const VALID_APPS = new Set<ComposioApp>(["linkedin", "gmail", "google_sheets", "google_calendar", "github"]);

export async function GET(request: NextRequest) {
  const user = await getAuthUser();

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const app = searchParams.get("app") as ComposioApp | null;

  if (status === "success" && app && VALID_APPS.has(app) && !user.isDemo) {
    markAppConnected(user.id, app);
  }

  // Redirect back to the originating page (or settings as fallback)
  const returnTo = searchParams.get("returnTo");
  const basePath = returnTo && returnTo.startsWith("/") ? returnTo : "/settings";
  const redirectUrl = new URL(basePath, request.nextUrl.origin);
  redirectUrl.searchParams.set("composio", status === "success" ? "connected" : "failed");
  if (app) redirectUrl.searchParams.set("app", app);

  return NextResponse.redirect(redirectUrl);
}
