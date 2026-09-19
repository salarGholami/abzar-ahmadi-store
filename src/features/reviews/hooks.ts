"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewsApi } from "./api";

export const reviewKeys = { product: (id: string) => ["reviews", id] as const };

export function useProductReviews(productId: string) {
  return useQuery({ queryKey: reviewKeys.product(productId), queryFn: () => reviewsApi.list(productId), enabled: Boolean(productId) });
}

export function useCreateReview() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: reviewsApi.create,
    onSuccess: (_data, variables) => client.invalidateQueries({ queryKey: reviewKeys.product(variables.productId) }),
  });
}
