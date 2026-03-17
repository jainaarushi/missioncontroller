import { createClient } from "@/lib/supabase/server";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { decryptApiKey } from "./encrypt";
import { getMockUserKeys } from "@/lib/mock-data";
import type { AIProvider } from "./client";

interface UserAIConfig {
  provider: AIProvider;
  apiKey: string;
}

export async function getUserAIConfig(userId: string): Promise<UserAIConfig | null> {
  // ── Local / no-Supabase mode: read from in-memory store ──
  if (!isSupabaseEnabled()) {
    const keys = getMockUserKeys(userId);
    const provider = (keys.ai_provider || "openai") as AIProvider;

    const keyMap: Record<AIProvider, string | null> = {
      openai: keys.openai_api_key,
      gemini: keys.gemini_api_key,
      anthropic: keys.anthropic_api_key,
    };

    // Selected provider first
    if (keyMap[provider]) {
      return { provider, apiKey: keyMap[provider]! };
    }

    // Fallback: any key that exists
    for (const [p, key] of Object.entries(keyMap)) {
      if (key) return { provider: p as AIProvider, apiKey: key };
    }

    return null;
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("users")
    .select("anthropic_api_key, gemini_api_key, openai_api_key, ai_provider")
    .eq("id", userId)
    .single();

  if (!data) return null;

  const provider = (data.ai_provider || "openai") as AIProvider;

  // Try selected provider first
  const keyMap: Record<AIProvider, string | null> = {
    openai: data.openai_api_key,
    gemini: data.gemini_api_key,
    anthropic: data.anthropic_api_key,
  };

  // Selected provider
  if (keyMap[provider]) {
    try {
      return { provider, apiKey: decryptApiKey(keyMap[provider]!) };
    } catch { /* fall through */ }
  }

  // Fallback: try any key that exists
  for (const [p, key] of Object.entries(keyMap)) {
    if (key) {
      try {
        return { provider: p as AIProvider, apiKey: decryptApiKey(key) };
      } catch { /* continue */ }
    }
  }

  return null;
}
