import { createClient } from "@/lib/supabase/server";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { decryptApiKey } from "./encrypt";
import type { AIProvider } from "./client";

interface UserAIConfig {
  provider: AIProvider;
  apiKey: string;
}

export async function getUserAIConfig(userId: string): Promise<UserAIConfig | null> {
  if (!isSupabaseEnabled()) return null;

  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("users")
    .select("anthropic_api_key, gemini_api_key, ai_provider")
    .eq("id", userId)
    .single();

  if (!data) return null;

  const provider = (data.ai_provider || "anthropic") as AIProvider;

  // Try the selected provider first, then fall back to the other
  if (provider === "gemini" && data.gemini_api_key) {
    try {
      return { provider: "gemini", apiKey: decryptApiKey(data.gemini_api_key) };
    } catch { /* fall through */ }
  }

  if (provider === "anthropic" && data.anthropic_api_key) {
    try {
      return { provider: "anthropic", apiKey: decryptApiKey(data.anthropic_api_key) };
    } catch { /* fall through */ }
  }

  // Fall back: try whichever key exists
  if (data.gemini_api_key) {
    try {
      return { provider: "gemini", apiKey: decryptApiKey(data.gemini_api_key) };
    } catch { /* ignore */ }
  }

  if (data.anthropic_api_key) {
    try {
      return { provider: "anthropic", apiKey: decryptApiKey(data.anthropic_api_key) };
    } catch { /* ignore */ }
  }

  return null;
}
