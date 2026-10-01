"use client";

import { useQuery } from "@tanstack/react-query";
import { supplierApi } from "./api";

export const supplierKeys = {
  overview: ["supplier", "overview"] as const,
  orders: ["supplier", "orders"] as const,
  profile: ["supplier", "profile"] as const,
  products: ["supplier", "products"] as const,
  finance: ["supplier", "finance"] as const,
};

export const useSupplierOverview = () => useQuery({ queryKey: supplierKeys.overview, queryFn: supplierApi.overview });
export const useSupplierOrders = (options?: { page?: number; pageSize?: number; q?: string }) =>
  useQuery({
    queryKey: [...supplierKeys.orders, options?.page ?? 1, options?.pageSize ?? 20, options?.q ?? ""],
    queryFn: async () => {
      const result = await supplierApi.orders(options);
      return Array.isArray(result)
        ? { items: result, pagination: { page: 1, pageSize: result.length || 20, total: result.length, totalPages: 1 } }
        : result;
    },
  });
export const useSupplierProfile = () => useQuery({ queryKey: supplierKeys.profile, queryFn: supplierApi.profile });
export const useSupplierProducts = (options?: { page?: number; pageSize?: number; q?: string }) =>
  useQuery({
    queryKey: [...supplierKeys.products, options?.page ?? 1, options?.pageSize ?? 20, options?.q ?? ""],
    queryFn: async () => {
      const result = await supplierApi.products(options);
      return Array.isArray(result)
        ? { items: result, pagination: { page: 1, pageSize: result.length || 20, total: result.length, totalPages: 1 } }
        : result;
    },
  });
export const useSupplierFinance = (options?: { page?: number; pageSize?: number }) =>
  useQuery({ queryKey: [...supplierKeys.finance, options?.page ?? 1], queryFn: () => supplierApi.finance(options) });
