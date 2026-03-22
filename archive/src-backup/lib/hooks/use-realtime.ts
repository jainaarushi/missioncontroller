"use client";

import { useEffect } from "react";
import type { TaskWithAgent } from "@/lib/types/task";
import type { KeyedMutator } from "swr";

export function useRealtimeTasks(mutate: KeyedMutator<TaskWithAgent[]>) {
  // Poll every 2 seconds to catch task status changes
  useEffect(() => {
    const interval = setInterval(() => {
      mutate();
    }, 2000);
    return () => clearInterval(interval);
  }, [mutate]);
}
