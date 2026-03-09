import useSWR from "swr";

interface Stats {
  working: number;
  review: number;
  todo: number;
  done: number;
  spent: number;
}

export function useStats() {
  const { data, error, isLoading } = useSWR<Stats>("/api/stats");

  return {
    stats: data || { working: 0, review: 0, todo: 0, done: 0, spent: 0 },
    isLoading,
    error,
  };
}
