import { createClient as createServerClient } from "@/lib/supabase/server";

const DEMO_USER_ID = "u1000000-0000-0000-0000-000000000001";

export async function getAuthUser(): Promise<{ id: string; email: string; isDemo: boolean }> {
  const supabase = await createServerClient();
  if (!supabase) {
    return { id: DEMO_USER_ID, email: "demo@agentstudio.world", isDemo: true };
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    // Not authenticated — return demo user so app works in preview mode
    return { id: DEMO_USER_ID, email: "demo@agentstudio.world", isDemo: true };
  }
  return { id: user.id, email: user.email || "", isDemo: false };
}

