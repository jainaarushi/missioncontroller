// LinkedIn Voyager API client — cookie-based authentication
// Uses LinkedIn's internal API (same approach as Dripify, Waalaxy, etc.)

import { randomBytes } from "crypto";

const VOYAGER_BASE = "https://www.linkedin.com/voyager/api";

function generateCsrfToken(): string {
  return `ajax:${Date.now()}`;
}

function generateTrackingId(): string {
  return randomBytes(16).toString("base64");
}

function buildHeaders(liAtCookie: string): Record<string, string> {
  const csrf = generateCsrfToken();
  return {
    Cookie: `li_at=${liAtCookie}; JSESSIONID="${csrf}"`,
    "Csrf-Token": csrf,
    "X-Li-Lang": "en_US",
    "X-Restli-Protocol-Version": "2.0.0",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Content-Type": "application/json; charset=UTF-8",
  };
}

// ── Profile lookup ──

export interface LinkedInProfile {
  firstName: string;
  lastName: string;
  headline: string;
  profileId: string;
  entityUrn: string;
  publicIdentifier: string;
}

/** Extract the vanity username from a LinkedIn profile URL */
export function extractUsername(url: string): string | null {
  const match = url.match(/linkedin\.com\/in\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/** Get profile info by vanity username */
export async function getProfile(
  cookie: string,
  username: string,
): Promise<LinkedInProfile> {
  const headers = buildHeaders(cookie);
  const url = `${VOYAGER_BASE}/identity/profiles/${username}/profileView`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  let res: Response;
  try {
    res = await fetch(url, {
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    const msg = err instanceof Error ? err.message : "Network error";
    throw new Error(`LinkedIn API unreachable: ${msg}. This may happen if LinkedIn blocks server IPs.`);
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 401 || res.status === 403) {
      throw new Error("LinkedIn cookie expired or invalid. Please update it in Settings.");
    }
    throw new Error(`LinkedIn profile lookup failed (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const profile = data.profile || data;

  return {
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    headline: profile.headline || "",
    profileId: profile.miniProfile?.objectUrn?.replace("urn:li:member:", "") ||
               profile.entityUrn?.replace("urn:li:fs_profile:", "") || "",
    entityUrn: profile.miniProfile?.entityUrn || profile.entityUrn || "",
    publicIdentifier: profile.miniProfile?.publicIdentifier || username,
  };
}

// ── Connection requests ──

export interface SendResult {
  success: boolean;
  error?: string;
}

/** Send a connection request with optional personalized message (max 300 chars) */
export async function sendConnectionRequest(
  cookie: string,
  profileId: string,
  message?: string,
): Promise<SendResult> {
  const headers = buildHeaders(cookie);
  const trackingId = generateTrackingId();

  const body: Record<string, unknown> = {
    emberEntityName: "growth/invitation/norm-invitation",
    invitee: {
      "com.linkedin.voyager.growth.invitation.InviteeProfile": {
        profileId,
      },
    },
    trackingId,
  };

  if (message) {
    body.message = message.slice(0, 300);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  let res: Response;
  try {
    res = await fetch(`${VOYAGER_BASE}/growth/normInvitations`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    const msg = err instanceof Error ? err.message : "Network error";
    return { success: false, error: `LinkedIn API unreachable: ${msg}` };
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      return { success: false, error: "LinkedIn cookie expired. Update it in Settings." };
    }
    if (res.status === 429) {
      return { success: false, error: "LinkedIn rate limit reached. Try again later." };
    }
    const text = await res.text().catch(() => "");
    return { success: false, error: `Connection request failed (${res.status}): ${text.slice(0, 200)}` };
  }

  return { success: true };
}

// ── Direct messages ──

/** Send a direct message to a 1st-degree connection */
export async function sendMessage(
  cookie: string,
  profileUrn: string,
  text: string,
): Promise<SendResult> {
  const headers = buildHeaders(cookie);

  const body = {
    keyVersion: "LEGACY_INBOX",
    conversationCreate: {
      eventCreate: {
        value: {
          "com.linkedin.voyager.messaging.create.MessageCreate": {
            attributedBody: {
              text,
              attributes: [],
            },
            attachments: [],
          },
        },
      },
      recipients: [profileUrn],
      subtype: "MEMBER_TO_MEMBER",
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  let res: Response;
  try {
    res = await fetch(`${VOYAGER_BASE}/messaging/conversations`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    const msg = err instanceof Error ? err.message : "Network error";
    return { success: false, error: `LinkedIn API unreachable: ${msg}` };
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      return { success: false, error: "LinkedIn cookie expired. Update it in Settings." };
    }
    if (res.status === 429) {
      return { success: false, error: "LinkedIn rate limit reached. Try again later." };
    }
    const text = await res.text().catch(() => "");
    return { success: false, error: `Message failed (${res.status}): ${text.slice(0, 200)}` };
  }

  return { success: true };
}

// ── Cookie validation ──

/** Quick check if a LinkedIn cookie is still valid */
export async function validateCookie(cookie: string): Promise<boolean> {
  const headers = buildHeaders(cookie);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(`${VOYAGER_BASE}/me`, {
      headers,
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
