import { createClient } from "@/lib/supabase/server";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { decryptApiKey } from "./encrypt";
import { getMockUserKeys } from "@/lib/mock-data";

export interface UserToolKeys {
  tavily?: string;
  firecrawl?: string;
  serp?: string;
}

function tryDecrypt(value: string): string | null {
  try {
    return decryptApiKey(value);
  } catch {
    // Legacy unencrypted value — return as-is (only possible in dev)
    return value;
  }
}

export async function getUserToolKeys(userId: string): Promise<UserToolKeys> {
  // ── Local / no-Supabase mode: read from in-memory store (encrypted) ──
  if (!isSupabaseEnabled()) {
    const keys = getMockUserKeys(userId);
    const result: UserToolKeys = {};
    if (keys.tavily_api_key) {
      const d = tryDecrypt(keys.tavily_api_key);
      if (d) result.tavily = d;
    }
    if (keys.firecrawl_api_key) {
      const d = tryDecrypt(keys.firecrawl_api_key);
      if (d) result.firecrawl = d;
    }
    if (keys.serp_api_key) {
      const d = tryDecrypt(keys.serp_api_key);
      if (d) result.serp = d;
    }
    return result;
  }

  const supabase = await createClient();
  if (!supabase) return {};

  const { data } = await supabase
    .from("users")
    .select("tavily_api_key, firecrawl_api_key, serp_api_key")
    .eq("id", userId)
    .single();

  if (!data) return {};

  const keys: UserToolKeys = {};

  if (data.tavily_api_key) {
    const d = tryDecrypt(data.tavily_api_key);
    if (d) keys.tavily = d;
  }
  if (data.firecrawl_api_key) {
    const d = tryDecrypt(data.firecrawl_api_key);
    if (d) keys.firecrawl = d;
  }
  if (data.serp_api_key) {
    const d = tryDecrypt(data.serp_api_key);
    if (d) keys.serp = d;
  }

  return keys;
}
