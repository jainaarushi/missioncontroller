import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { markAppConnected } from "@/lib/ai/composio/service";
import type { ComposioApp } from "@/lib/ai/composio/types";

const VALID_APPS = new Set<ComposioApp>(["linkedin", "gmail", "google_sheets", "google_calendar", "github"]);

export async function GET(request: NextRequest) {
  const user = await getAuthUser();

  const { searchParams } = request.nextUrl;
  // Composio sends back "status" param, but may not always — treat absence as success
  // if we got redirected back at all (user completed OAuth)
  const status = searchParams.get("status") || "success";
  // "app" was included by us in the callback URL we gave to Composio
  const app = searchParams.get("app") as ComposioApp | null;

  const isSuccess = status === "success" || status === "1" || status === "true";

  if (isSuccess && app && VALID_APPS.has(app) && !user.isDemo) {
    markAppConnected(user.id, app);
  }

  // Redirect back to the originating page (or settings as fallback)
  const returnTo = searchParams.get("returnTo");
  const basePath = returnTo && returnTo.startsWith("/") ? returnTo : "/settings";
  const redirectUrl = new URL(basePath, request.nextUrl.origin);
  redirectUrl.searchParams.set("composio", isSuccess ? "connected" : "failed");
  if (app) redirectUrl.searchParams.set("app", app);

  return NextResponse.redirect(redirectUrl);
}
