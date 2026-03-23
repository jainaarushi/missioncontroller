import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { encryptApiKey, decryptApiKey, maskApiKey } from "@/lib/ai/encrypt";
import { rateLimit } from "@/lib/rate-limit";
import { validateCookie } from "@/lib/linkedin/client";

// In-memory encrypted cookie store (no DB column needed)
const cookieStore = new Map<string, string>();

/** Get decrypted cookie for a user — used by other API routes */
export function getLinkedInCookie(userId: string): string | null {
  const encrypted = cookieStore.get(userId);
  if (!encrypted) return null;
  try {
    return decryptApiKey(encrypted);
  } catch {
    cookieStore.delete(userId);
    return null;
  }
}

/**
 * GET /api/user/linkedin-cookie
 * Returns whether the user has a LinkedIn cookie saved
 */
export async function GET() {
  const user = await getAuthUser();
  if (user.isDemo) {
    return NextResponse.json({ hasCookie: false });
  }

  const cookie = getLinkedInCookie(user.id);
  return NextResponse.json({
    hasCookie: !!cookie,
    maskedCookie: cookie ? maskApiKey(cookie) : null,
  });
}

/**
 * POST /api/user/linkedin-cookie
 * Save (and validate) LinkedIn li_at cookie
 */
export async function POST(request: NextRequest) {
  const user = await getAuthUser();

  if (user.isDemo) {
    return NextResponse.json(
      { error: "Sign in to save LinkedIn cookie" },
      { status: 401 }
    );
  }

  const rl = rateLimit(`li-cookie:${user.id}`, {
    maxRequests: 5,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait." },
      { status: 429 }
    );
  }

  let body: { cookie?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { cookie } = body;
  if (!cookie || cookie.trim().length < 10) {
    return NextResponse.json(
      { error: "Please provide a valid li_at cookie value" },
      { status: 400 }
    );
  }

  const cleanCookie = cookie.trim();

  // Validate the cookie against LinkedIn
  const valid = await validateCookie(cleanCookie);
  if (!valid) {
    return NextResponse.json(
      { error: "Cookie is invalid or expired. Make sure you copied the full li_at value." },
      { status: 400 }
    );
  }

  // Encrypt and store
  const encrypted = encryptApiKey(cleanCookie);
  cookieStore.set(user.id, encrypted);

  return NextResponse.json({
    success: true,
    maskedCookie: maskApiKey(cleanCookie),
  });
}

/**
 * DELETE /api/user/linkedin-cookie
 * Remove saved LinkedIn cookie
 */
export async function DELETE() {
  const user = await getAuthUser();

  if (user.isDemo) {
    return NextResponse.json(
      { error: "Sign in first" },
      { status: 401 }
    );
  }

  cookieStore.delete(user.id);
  return NextResponse.json({ success: true });
}
