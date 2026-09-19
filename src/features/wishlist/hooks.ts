"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { wishlistApi } from "./api";

export const wishlistKeys = { all: ["wishlist"] as const };

export function useWishlist() {
  return useQuery({ queryKey: wishlistKeys.all, queryFn: wishlistApi.get, retry: false });
}

export function useToggleWishlist() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: wishlistApi.toggle,
    onSuccess: (data) => client.setQueryData(wishlistKeys.all, data),
  });
}
