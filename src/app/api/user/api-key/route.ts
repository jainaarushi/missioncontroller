import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { encryptApiKey, decryptApiKey, maskApiKey } from "@/lib/ai/encrypt";

// GET — check if user has keys saved
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isSupabaseEnabled()) {
    return NextResponse.json({ anthropic: null, gemini: null, provider: "gemini" });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ anthropic: null, gemini: null, provider: "gemini" });

  const { data } = await supabase
    .from("users")
    .select("anthropic_api_key, gemini_api_key, ai_provider")
    .eq("id", user.id)
    .single();

  let anthropicInfo = null;
  let geminiInfo = null;

  if (data?.anthropic_api_key) {
    try {
      const decrypted = decryptApiKey(data.anthropic_api_key);
      anthropicInfo = { hasKey: true, maskedKey: maskApiKey(decrypted) };
    } catch { /* ignore */ }
  }

  if (data?.gemini_api_key) {
    try {
      const decrypted = decryptApiKey(data.gemini_api_key);
      geminiInfo = { hasKey: true, maskedKey: maskApiKey(decrypted) };
    } catch { /* ignore */ }
  }

  return NextResponse.json({
    anthropic: anthropicInfo,
    gemini: geminiInfo,
    provider: data?.ai_provider || "gemini",
    encryption: "AES-256-GCM",
  });
}

// POST — save a key
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { api_key, provider } = await request.json();

  if (!api_key || typeof api_key !== "string") {
    return NextResponse.json({ error: "api_key is required" }, { status: 400 });
  }

  if (!provider || !["anthropic", "gemini"].includes(provider)) {
    return NextResponse.json({ error: "provider must be 'anthropic' or 'gemini'" }, { status: 400 });
  }

  // Validate key format
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

  const encrypted = encryptApiKey(api_key);
  const column = provider === "anthropic" ? "anthropic_api_key" : "gemini_api_key";

  const { error } = await supabase
    .from("users")
    .update({ [column]: encrypted, ai_provider: provider })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    success: true,
    maskedKey: maskApiKey(api_key),
    provider,
    encryption: "AES-256-GCM",
  });
}

// DELETE — remove a key
export async function DELETE(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider") || "anthropic";

  if (!isSupabaseEnabled()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase not available" }, { status: 500 });

  const column = provider === "anthropic" ? "anthropic_api_key" : "gemini_api_key";

  const { error } = await supabase
    .from("users")
    .update({ [column]: null })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
