import { createClient } from "@/lib/supabase/server";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { decryptApiKey } from "./encrypt";
import { getMockUserKeys } from "@/lib/mock-data";

export interface UserToolKeys {
  tavily?: string;
  firecrawl?: string;
  serp?: string;
}

export async function getUserToolKeys(userId: string): Promise<UserToolKeys> {
  // ── Local / no-Supabase mode: read from in-memory store ──
  if (!isSupabaseEnabled()) {
    const keys = getMockUserKeys(userId);
    const result: UserToolKeys = {};
    if (keys.tavily_api_key) result.tavily = keys.tavily_api_key;
    if (keys.firecrawl_api_key) result.firecrawl = keys.firecrawl_api_key;
    if (keys.serp_api_key) result.serp = keys.serp_api_key;
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
    try {
      keys.tavily = decryptApiKey(data.tavily_api_key);
    } catch { /* skip */ }
  }
  if (data.firecrawl_api_key) {
    try {
      keys.firecrawl = decryptApiKey(data.firecrawl_api_key);
    } catch { /* skip */ }
  }
  if (data.serp_api_key) {
    try {
      keys.serp = decryptApiKey(data.serp_api_key);
    } catch { /* skip */ }
  }

  return keys;
}
