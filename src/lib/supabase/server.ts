import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const hasConfig =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

// Use a WeakMap keyed by the cookie store object to cache clients per-request.
// Each request gets a unique cookie store from Next.js, so this is safe for
// concurrent users — no data leaks between requests.
const clientCache = new WeakMap<object, ReturnType<typeof createServerClient>>();

export async function createClient() {
  if (!hasConfig) return null;

  const cookieStore = await cookies();

  const cached = clientCache.get(cookieStore);
  if (cached) return cached;

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — safe to ignore
          }
        },
      },
    }
  );

  clientCache.set(cookieStore, client);
  return client;
}

export function isSupabaseEnabled(): boolean {
  return hasConfig;
}
