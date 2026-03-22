import useSWR from "swr";
import type { Agent } from "@/lib/types/agent";

export function useAgents() {
  const { data, error, isLoading, mutate } = useSWR<Agent[]>("/api/agents");

  return {
    agents: data || [],
    isLoading,
    error,
    mutate,
  };
}
