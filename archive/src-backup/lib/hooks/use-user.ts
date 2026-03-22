"use client";

import { useEffect, useState } from "react";
import { createClient, isSupabaseEnabled } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const DEMO_USER = {
  id: "u1000000-0000-0000-0000-000000000001",
  email: "demo@agentstudio.world",
};

interface AppUser {
  id: string;
  email: string;
}

export function useUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseEnabled()) {
      setUser(DEMO_USER);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setUser(DEMO_USER);
      setIsLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data: { user: sbUser } }) => {
      if (sbUser) {
        setUser({ id: sbUser.id, email: sbUser.email || "" });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || "" });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, isLoading };
}
