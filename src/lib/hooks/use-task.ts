import useSWR from "swr";
import type { TaskWithAgent, TaskStep } from "@/lib/types/task";

interface TaskDetail extends TaskWithAgent {
  steps: TaskStep[];
}

export function useTask(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<TaskDetail>(
    id ? `/api/tasks/${id}` : null
  );

  return {
    task: data || null,
    isLoading,
    error,
    mutate,
  };
}
