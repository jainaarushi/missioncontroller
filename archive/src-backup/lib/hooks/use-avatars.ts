import useSWR from "swr";

export function useAvatars() {
  const { data, error, isLoading, mutate } = useSWR<{
    avatars: Record<string, string>;
    hasFace: boolean;
  }>("/api/user/avatar");

  return {
    avatars: (data?.avatars || {}) as Record<string, string>,
    hasFace: data?.hasFace || false,
    isLoading,
    error,
    mutate,
  };
}
