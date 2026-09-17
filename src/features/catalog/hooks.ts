"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "./api";

export const catalogKeys = {
  products: (params?: Record<string, unknown>) => ["catalog", "products", params] as const,
  product: (id: string) => ["catalog", "product", id] as const,
  categories: ["catalog", "categories"] as const,
  brands: ["catalog", "brands"] as const,
};

export function useProducts(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({ queryKey: catalogKeys.products(params), queryFn: () => catalogApi.products(params) });
}

export function useProduct(id: string) {
  return useQuery({ queryKey: catalogKeys.product(id), queryFn: () => catalogApi.product(id), enabled: Boolean(id) });
}

export function useCategories() {
  return useQuery({ queryKey: catalogKeys.categories, queryFn: catalogApi.categories, staleTime: 5 * 60_000 });
}

export function useBrands() {
  return useQuery({ queryKey: catalogKeys.brands, queryFn: catalogApi.brands, staleTime: 5 * 60_000 });
}
