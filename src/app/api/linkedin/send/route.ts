import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getLinkedInCookie } from "@/app/api/user/linkedin-cookie/route";
import {
  extractUsername,
  getProfile,
  sendConnectionRequest,
  sendMessage,
} from "@/lib/linkedin/client";

/**
 * POST /api/linkedin/send
 * Send a connection request or direct message to a LinkedIn profile.
 *
 * Body: {
 *   profileUrl: "https://linkedin.com/in/username",
 *   message: "Hi, I'd love to connect!",
 *   action: "connect" | "message"
 * }
 */
export async function POST(request: NextRequest) {
  const user = await getAuthUser();

  if (user.isDemo) {
    return NextResponse.json(
      { error: "Sign in to send LinkedIn messages" },
      { status: 401 }
    );
  }

  // Rate limit: 20 sends per minute (LinkedIn safe threshold)
  const rl = rateLimit(`li-send:${user.id}`, {
    maxRequests: 20,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Slow down to avoid LinkedIn rate limits." },
      { status: 429 }
    );
  }

  const cookie = getLinkedInCookie(user.id);
  if (!cookie) {
    return NextResponse.json(
      { error: "LinkedIn cookie not set. Add it in Settings." },
      { status: 400 }
    );
  }

  let body: {
    profileUrl?: string;
    message?: string;
    action?: "connect" | "message";
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { profileUrl, message, action = "connect" } = body;

  if (!profileUrl || !message) {
    return NextResponse.json(
      { error: "profileUrl and message are required" },
      { status: 400 }
    );
  }

  // Extract username from URL
  const username = extractUsername(profileUrl);
  if (!username) {
    return NextResponse.json(
      { error: "Invalid LinkedIn profile URL" },
      { status: 400 }
    );
  }

  try {
    // Look up the profile to get internal IDs
    const profile = await getProfile(cookie, username);

    if (action === "message") {
      // Send DM (requires 1st-degree connection)
      const result = await sendMessage(cookie, profile.entityUrn, message);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        action: "message",
        name: `${profile.firstName} ${profile.lastName}`,
      });
    } else {
      // Send connection request with personalized message
      const result = await sendConnectionRequest(cookie, profile.profileId, message);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        action: "connect",
        name: `${profile.firstName} ${profile.lastName}`,
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "LinkedIn request failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
