"use client";

import { useEffect } from "react";
import type { TaskWithAgent } from "@/lib/types/task";
import type { KeyedMutator } from "swr";

export function useRealtimeTasks(mutate: KeyedMutator<TaskWithAgent[]>) {
  // Demo mode: poll for updates every 2 seconds instead of Supabase Realtime
  useEffect(() => {
    const interval = setInterval(() => {
      mutate();
    }, 2000);
    return () => clearInterval(interval);
  }, [mutate]);
}
