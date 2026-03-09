import { createClient } from "@/lib/supabase/server";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { decryptApiKey } from "./encrypt";

export async function getUserAnthropicKey(userId: string): Promise<string | null> {
  if (!isSupabaseEnabled()) return null;

  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("users")
    .select("anthropic_api_key")
    .eq("id", userId)
    .single();

  if (!data?.anthropic_api_key) return null;

  try {
    return decryptApiKey(data.anthropic_api_key);
  } catch {
    return null;
  }
}
