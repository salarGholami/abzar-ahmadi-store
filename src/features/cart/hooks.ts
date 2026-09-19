"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "./api";

export const cartKeys = { all: ["cart"] as const };

export function useCartQuery() {
  return useQuery({
    queryKey: cartKeys.all,
    queryFn: cartApi.get,
    staleTime: 15_000,
  });
}

export function useCartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.mutate,
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.all, data);
    },
  });
}
