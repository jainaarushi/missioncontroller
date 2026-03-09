import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { encryptApiKey, decryptApiKey, maskApiKey } from "@/lib/ai/encrypt";

// GET — check if user has a key saved (returns masked version)
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isSupabaseEnabled()) {
    return NextResponse.json({ hasKey: false, maskedKey: null });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ hasKey: false, maskedKey: null });

  const { data } = await supabase
    .from("users")
    .select("anthropic_api_key")
    .eq("id", user.id)
    .single();

  if (!data?.anthropic_api_key) {
    return NextResponse.json({ hasKey: false, maskedKey: null });
  }

  try {
    const decrypted = decryptApiKey(data.anthropic_api_key);
    return NextResponse.json({
      hasKey: true,
      maskedKey: maskApiKey(decrypted),
      encryption: "AES-256-GCM",
    });
  } catch {
    return NextResponse.json({ hasKey: false, maskedKey: null });
  }
}

// POST — save user's API key (encrypted)
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { api_key } = await request.json();

  if (!api_key || typeof api_key !== "string") {
    return NextResponse.json({ error: "api_key is required" }, { status: 400 });
  }

  // Basic validation — Anthropic keys start with sk-ant-
  if (!api_key.startsWith("sk-ant-")) {
    return NextResponse.json({ error: "Invalid API key format. Anthropic keys start with sk-ant-" }, { status: 400 });
  }

  if (!isSupabaseEnabled()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase not available" }, { status: 500 });

  // Encrypt the key before storing
  const encrypted = encryptApiKey(api_key);

  const { error } = await supabase
    .from("users")
    .update({ anthropic_api_key: encrypted })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    maskedKey: maskApiKey(api_key),
    encryption: "AES-256-GCM",
  });
}

// DELETE — remove user's API key
export async function DELETE() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isSupabaseEnabled()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase not available" }, { status: 500 });

  const { error } = await supabase
    .from("users")
    .update({ anthropic_api_key: null })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
