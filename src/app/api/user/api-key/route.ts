import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { encryptApiKey, decryptApiKey, maskApiKey } from "@/lib/ai/encrypt";
import { getMockUserKeys, setMockUserKey, setMockAIProvider } from "@/lib/mock-data";
import { rateLimit } from "@/lib/rate-limit";

const VALID_PROVIDERS = ["openai", "gemini", "anthropic", "wispr", "tavily", "firecrawl", "serp"] as const;
type Provider = typeof VALID_PROVIDERS[number];

const COLUMN_MAP: Record<Provider, string> = {
  openai: "openai_api_key",
  gemini: "gemini_api_key",
  anthropic: "anthropic_api_key",
  wispr: "wispr_api_key",
  tavily: "tavily_api_key",
  firecrawl: "firecrawl_api_key",
  serp: "serp_api_key",
};

const LLM_PROVIDERS = new Set(["openai", "gemini", "anthropic"]);

function isValidProvider(p: string): p is Provider {
  return VALID_PROVIDERS.includes(p as Provider);
}

// ── GET: retrieve masked key status ──
export async function GET() {
  const user = await getAuthUser();

  // Rate limit reads to prevent enumeration
  const rl = rateLimit(`apikey-get:${user.id}`, { maxRequests: 30, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  // ── Local / no-Supabase mode: read from in-memory store ──
  if (!isSupabaseEnabled()) {
    const keys = getMockUserKeys(user.id);

    function mockKeyInfo(raw: string | null) {
      if (!raw) return null;
      // Keys in mock store are encrypted — decrypt to mask
      try {
        const decrypted = decryptApiKey(raw);
        return { hasKey: true, maskedKey: maskApiKey(decrypted) };
      } catch {
        // Legacy plaintext key — mask directly then re-encrypt
        return { hasKey: true, maskedKey: maskApiKey(raw) };
      }
    }

    return NextResponse.json({
      openai: mockKeyInfo(keys.openai_api_key),
      gemini: mockKeyInfo(keys.gemini_api_key),
      anthropic: mockKeyInfo(keys.anthropic_api_key),
      wispr: mockKeyInfo(keys.wispr_api_key),
      tavily: mockKeyInfo(keys.tavily_api_key),
      firecrawl: mockKeyInfo(keys.firecrawl_api_key),
      serp: mockKeyInfo(keys.serp_api_key),
      provider: keys.ai_provider,
    });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ openai: null, gemini: null, anthropic: null, provider: "openai" });

  const { data } = await supabase
    .from("users")
    .select("anthropic_api_key, gemini_api_key, openai_api_key, wispr_api_key, tavily_api_key, firecrawl_api_key, serp_api_key, ai_provider")
    .eq("id", user.id)
    .single();

  function getKeyInfo(encrypted: string | null) {
    if (!encrypted) return null;
    try {
      return { hasKey: true, maskedKey: maskApiKey(decryptApiKey(encrypted)) };
    } catch { return null; }
  }

  return NextResponse.json({
    openai: getKeyInfo(data?.openai_api_key),
    gemini: getKeyInfo(data?.gemini_api_key),
    anthropic: getKeyInfo(data?.anthropic_api_key),
    wispr: getKeyInfo(data?.wispr_api_key),
    tavily: getKeyInfo(data?.tavily_api_key),
    firecrawl: getKeyInfo(data?.firecrawl_api_key),
    serp: getKeyInfo(data?.serp_api_key),
    provider: data?.ai_provider || "openai",
  });
}

// ── POST: save an API key ──
export async function POST(request: NextRequest) {
  const user = await getAuthUser();

  // Demo users cannot save real API keys
  if (user.isDemo) {
    return NextResponse.json({ error: "Sign in to save API keys" }, { status: 401 });
  }

  // Rate limit: 5 key saves per minute
  const rl = rateLimit(`apikey-post:${user.id}`, { maxRequests: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many attempts. Please wait." }, { status: 429 });
  }

  let body: { api_key?: unknown; provider?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { api_key, provider } = body;

  if (!api_key || typeof api_key !== "string" || api_key.length > 500) {
    return NextResponse.json({ error: "api_key is required and must be under 500 characters" }, { status: 400 });
  }

  if (!provider || typeof provider !== "string" || !isValidProvider(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  // Validate key format for known providers
  if (provider === "openai" && !api_key.startsWith("sk-")) {
    return NextResponse.json({ error: "Invalid OpenAI key. Must start with sk-" }, { status: 400 });
  }
  if (provider === "anthropic" && !api_key.startsWith("sk-ant-")) {
    return NextResponse.json({ error: "Invalid Anthropic key. Must start with sk-ant-" }, { status: 400 });
  }
  if (provider === "gemini" && !api_key.startsWith("AIza")) {
    return NextResponse.json({ error: "Invalid Gemini key. Must start with AIza" }, { status: 400 });
  }
  if (provider === "tavily" && !api_key.startsWith("tvly-")) {
    return NextResponse.json({ error: "Invalid Tavily key. Must start with tvly-" }, { status: 400 });
  }
  if (provider === "firecrawl" && !api_key.startsWith("fc-")) {
    return NextResponse.json({ error: "Invalid Firecrawl key. Must start with fc-" }, { status: 400 });
  }

  // Always encrypt before storage — even in local mode
  const encrypted = encryptApiKey(api_key);

  // ── Local / no-Supabase mode: store encrypted in memory ──
  if (!isSupabaseEnabled()) {
    setMockUserKey(user.id, COLUMN_MAP[provider], encrypted);
    if (LLM_PROVIDERS.has(provider)) setMockAIProvider(user.id, provider);

    return NextResponse.json({
      success: true,
      maskedKey: maskApiKey(api_key),
      provider,
    });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const updateData: Record<string, string> = { [COLUMN_MAP[provider]]: encrypted };
  if (LLM_PROVIDERS.has(provider)) updateData.ai_provider = provider;

  const { error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    console.error("API key save error:", error.message);
    return NextResponse.json({ error: "Failed to save key. Please try again." }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    maskedKey: maskApiKey(api_key),
    provider,
  });
}

// ── DELETE: remove an API key ──
export async function DELETE(request: NextRequest) {
  const user = await getAuthUser();

  // Demo users cannot delete keys
  if (user.isDemo) {
    return NextResponse.json({ error: "Sign in to manage API keys" }, { status: 401 });
  }

  // Rate limit: 10 deletes per minute
  const rl = rateLimit(`apikey-del:${user.id}`, { maxRequests: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many attempts. Please wait." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");

  // Validate provider — reject unknown values
  if (!provider || !isValidProvider(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  // ── Local / no-Supabase mode ──
  if (!isSupabaseEnabled()) {
    setMockUserKey(user.id, COLUMN_MAP[provider], null);
    return NextResponse.json({ success: true });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const { error } = await supabase
    .from("users")
    .update({ [COLUMN_MAP[provider]]: null })
    .eq("id", user.id);

  if (error) {
    console.error("API key delete error:", error.message);
    return NextResponse.json({ error: "Failed to remove key. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
