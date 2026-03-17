import { useEffect } from "react";
import useSWR from "swr";
import { createClient, isSupabaseEnabled } from "@/lib/supabase/client";
import type { TaskWithAgent, TaskStep } from "@/lib/types/task";

interface TaskDetail extends TaskWithAgent {
  steps: TaskStep[];
}

export function useTask(id: string | null, options?: { refreshInterval?: number }) {
  const { data, error, isLoading, mutate } = useSWR<TaskDetail>(
    id ? `/api/tasks/${id}` : null,
    { refreshInterval: options?.refreshInterval || 0 }
  );

  // Supabase realtime subscription for this specific task
  useEffect(() => {
    if (!id || !isSupabaseEnabled()) return;

    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`task-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `id=eq.${id}`,
        },
        () => {
          mutate();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "task_steps",
          filter: `task_id=eq.${id}`,
        },
        () => {
          mutate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, mutate]);

  return {
    task: data || null,
    isLoading,
    error,
    mutate,
  };
}
