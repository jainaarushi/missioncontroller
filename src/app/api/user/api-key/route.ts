import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { encryptApiKey, decryptApiKey, maskApiKey } from "@/lib/ai/encrypt";
import { getMockUserKeys, setMockUserKey, setMockAIProvider } from "@/lib/mock-data";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const user = await getAuthUser();

  // ── Local / no-Supabase mode: read from in-memory store ──
  if (!isSupabaseEnabled()) {
    const keys = getMockUserKeys(user.id);

    function mockKeyInfo(raw: string | null) {
      if (!raw) return null;
      return { hasKey: true, maskedKey: maskApiKey(raw) };
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
    encryption: "AES-256-GCM",
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();

  // Rate limit: 5 key saves per minute
  const rl = rateLimit(`apikey:${user.id}`, { maxRequests: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many attempts. Please wait." }, { status: 429 });
  }

  const { api_key, provider } = await request.json();

  if (!api_key || typeof api_key !== "string") {
    return NextResponse.json({ error: "api_key is required" }, { status: 400 });
  }

  if (!provider || !["openai", "gemini", "anthropic", "wispr", "tavily", "firecrawl", "serp"].includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

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

  // ── Local / no-Supabase mode: store in memory (plain text, ephemeral) ──
  if (!isSupabaseEnabled()) {
    const columnMap: Record<string, string> = {
      openai: "openai_api_key",
      gemini: "gemini_api_key",
      anthropic: "anthropic_api_key",
      wispr: "wispr_api_key",
      tavily: "tavily_api_key",
      firecrawl: "firecrawl_api_key",
      serp: "serp_api_key",
    };
    setMockUserKey(user.id, columnMap[provider], api_key);
    const llmProviders = ["openai", "gemini", "anthropic"];
    if (llmProviders.includes(provider)) setMockAIProvider(user.id, provider);

    return NextResponse.json({
      success: true,
      maskedKey: maskApiKey(api_key),
      provider,
    });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase not available" }, { status: 500 });

  const columnMap: Record<string, string> = {
    openai: "openai_api_key",
    gemini: "gemini_api_key",
    anthropic: "anthropic_api_key",
    wispr: "wispr_api_key",
    tavily: "tavily_api_key",
    firecrawl: "firecrawl_api_key",
    serp: "serp_api_key",
  };

  const encrypted = encryptApiKey(api_key);

  const updateData: Record<string, string> = { [columnMap[provider]]: encrypted };
  // Only change ai_provider for LLM providers
  const llmProviders = ["openai", "gemini", "anthropic"];
  if (llmProviders.includes(provider)) updateData.ai_provider = provider;

  const { error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    console.error("API key operation error:", error.message);
    return NextResponse.json({ error: "Operation failed. Please try again." }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    maskedKey: maskApiKey(api_key),
    provider,
    encryption: "AES-256-GCM",
  });
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthUser();

  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider") || "openai";

  // ── Local / no-Supabase mode ──
  if (!isSupabaseEnabled()) {
    const columnMap: Record<string, string> = {
      openai: "openai_api_key",
      gemini: "gemini_api_key",
      anthropic: "anthropic_api_key",
      wispr: "wispr_api_key",
      tavily: "tavily_api_key",
      firecrawl: "firecrawl_api_key",
      serp: "serp_api_key",
    };
    setMockUserKey(user.id, columnMap[provider] || "openai_api_key", null);
    return NextResponse.json({ success: true });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase not available" }, { status: 500 });

  const delColumnMap: Record<string, string> = {
    openai: "openai_api_key",
    gemini: "gemini_api_key",
    anthropic: "anthropic_api_key",
    wispr: "wispr_api_key",
    tavily: "tavily_api_key",
    firecrawl: "firecrawl_api_key",
    serp: "serp_api_key",
  };

  const { error } = await supabase
    .from("users")
    .update({ [delColumnMap[provider] || "openai_api_key"]: null })
    .eq("id", user.id);

  if (error) {
    console.error("API key operation error:", error.message);
    return NextResponse.json({ error: "Operation failed. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
