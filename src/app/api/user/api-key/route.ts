import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { encryptApiKey, decryptApiKey, maskApiKey } from "@/lib/ai/encrypt";

export async function GET() {
  const user = await getAuthUser();
  if (user.isDemo) return NextResponse.json({ openai: null, gemini: null, anthropic: null, provider: "openai" });

  if (!isSupabaseEnabled()) {
    return NextResponse.json({ openai: null, gemini: null, anthropic: null, provider: "openai" });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ openai: null, gemini: null, anthropic: null, provider: "openai" });

  const { data } = await supabase
    .from("users")
    .select("anthropic_api_key, gemini_api_key, openai_api_key, ai_provider")
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
    provider: data?.ai_provider || "openai",
    encryption: "AES-256-GCM",
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (user.isDemo) return NextResponse.json({ error: "Sign up to save your API key", login: true }, { status: 401 });

  const { api_key, provider } = await request.json();

  if (!api_key || typeof api_key !== "string") {
    return NextResponse.json({ error: "api_key is required" }, { status: 400 });
  }

  if (!provider || !["openai", "gemini", "anthropic"].includes(provider)) {
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

  if (!isSupabaseEnabled()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase not available" }, { status: 500 });

  const columnMap: Record<string, string> = {
    openai: "openai_api_key",
    gemini: "gemini_api_key",
    anthropic: "anthropic_api_key",
  };

  const encrypted = encryptApiKey(api_key);

  const { error } = await supabase
    .from("users")
    .update({ [columnMap[provider]]: encrypted, ai_provider: provider })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    success: true,
    maskedKey: maskApiKey(api_key),
    provider,
    encryption: "AES-256-GCM",
  });
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthUser();
  if (user.isDemo) return NextResponse.json({ error: "Sign up first", login: true }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider") || "openai";

  if (!isSupabaseEnabled()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase not available" }, { status: 500 });

  const columnMap: Record<string, string> = {
    openai: "openai_api_key",
    gemini: "gemini_api_key",
    anthropic: "anthropic_api_key",
  };

  const { error } = await supabase
    .from("users")
    .update({ [columnMap[provider] || "openai_api_key"]: null })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
