import useSWR from "swr";
import type { TaskWithAgent } from "@/lib/types/task";

export function useTasks(section?: string) {
  const params = new URLSearchParams();
  if (section) params.set("section", section);

  const { data, error, isLoading, mutate } = useSWR<TaskWithAgent[]>(
    `/api/tasks?${params.toString()}`
  );

  return {
    tasks: data || [],
    isLoading,
    error,
    mutate,
  };
}
