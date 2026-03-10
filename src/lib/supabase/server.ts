import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const hasConfig =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

// Cache the client per request to avoid "lock was stolen" errors
// from multiple concurrent cookies() + createServerClient() calls
let cachedPromise: Promise<ReturnType<typeof createServerClient> | null> | null = null;
let cachedForCookieStore: Awaited<ReturnType<typeof cookies>> | null = null;

export async function createClient() {
  if (!hasConfig) return null;

  const cookieStore = await cookies();

  // If the cookie store is the same object (same request), reuse the cached client
  if (cachedPromise && cachedForCookieStore === cookieStore) {
    return cachedPromise;
  }

  cachedForCookieStore = cookieStore;
  cachedPromise = Promise.resolve(
    createServerClient(
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
    )
  );

  return cachedPromise;
}

export function isSupabaseEnabled(): boolean {
  return hasConfig;
}
