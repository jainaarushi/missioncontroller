import { createClient } from "@/lib/supabase/server";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { decryptApiKey } from "./encrypt";
import { getMockUserKeys } from "@/lib/mock-data";
import type { AIProvider } from "./client";

interface UserAIConfig {
  provider: AIProvider;
  apiKey: string;
}

function tryDecrypt(value: string): string | null {
  try {
    return decryptApiKey(value);
  } catch {
    // Legacy unencrypted value — return as-is (only possible in dev)
    return value;
  }
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
      const decrypted = tryDecrypt(keyMap[provider]!);
      if (decrypted) return { provider, apiKey: decrypted };
    }

    // Fallback: any key that exists
    for (const [p, key] of Object.entries(keyMap)) {
      if (key) {
        const decrypted = tryDecrypt(key);
        if (decrypted) return { provider: p as AIProvider, apiKey: decrypted };
      }
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

  const keyMap: Record<AIProvider, string | null> = {
    openai: data.openai_api_key,
    gemini: data.gemini_api_key,
    anthropic: data.anthropic_api_key,
  };

  // Selected provider
  if (keyMap[provider]) {
    const decrypted = tryDecrypt(keyMap[provider]!);
    if (decrypted) return { provider, apiKey: decrypted };
  }

  // Fallback: try any key that exists
  for (const [p, key] of Object.entries(keyMap)) {
    if (key) {
      const decrypted = tryDecrypt(key);
      if (decrypted) return { provider: p as AIProvider, apiKey: decrypted };
    }
  }

  return null;
}
