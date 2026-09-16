"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "./api";

export const settingsKeys = {
  preferences: ["settings", "preferences"] as const,
  public: ["settings", "public"] as const,
};

export function usePreferences() {
  return useQuery({
    queryKey: settingsKeys.preferences,
    queryFn: settingsApi.getPreferences,
    retry: false,
    staleTime: Infinity,
  });
}

export function useUpdateTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (theme: "light" | "dark") => settingsApi.updatePreferences({ theme }),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.preferences, data);
    },
  });
}

export function usePublicSettings() {
  return useQuery({
    queryKey: settingsKeys.public,
    queryFn: settingsApi.getPublic,
    staleTime: 5 * 60_000,
  });
}
