import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { isComposioEnabled, getConnectionStatus, getComposioUsage } from "@/lib/ai/composio/service";

export async function GET() {
  const user = await getAuthUser();

  if (user.isDemo) {
    return NextResponse.json({
      enabled: false,
      connections: { linkedin: false, gmail: false, google_sheets: false, google_calendar: false, github: false },
    });
  }

  if (!isComposioEnabled()) {
    return NextResponse.json({
      enabled: false,
      connections: { linkedin: false, gmail: false, google_sheets: false, google_calendar: false, github: false },
    });
  }

  const connections = getConnectionStatus(user.id);
  const usage = getComposioUsage(user.id);

  return NextResponse.json({ enabled: true, connections, usage });
}
