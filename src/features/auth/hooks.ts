"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, type AuthPayload } from "./api";

export const authKeys = { me: ["auth", "me"] as const };

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: authApi.me,
    retry: false,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: AuthPayload) => authApi.login(payload),
    onSuccess: (data) => client.setQueryData(authKeys.me, data.user),
  });
}

export function useRegister() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: AuthPayload) => authApi.register(payload),
    onSuccess: (data) => client.setQueryData(authKeys.me, data.user),
  });
}

export function useLogout() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      client.setQueryData(authKeys.me, null);
      void client.invalidateQueries();
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: authApi.resetPassword,
  });
}
