"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, type AdminCollection } from "./api";

export const adminKeys = {
  collection: (name: AdminCollection) => ["admin", name] as const,
  products: ["admin", "products"] as const,
  categories: ["admin", "categories"] as const,
  sales: ["admin", "sales"] as const,
  reports: ["admin", "reports"] as const,
  users: ["admin", "users"] as const,
};

export function useAdminCollection<T = Record<string, unknown>>(
  collection: AdminCollection,
  options?: { page?: number; pageSize?: number; q?: string },
) {
  return useQuery({
    queryKey: [...adminKeys.collection(collection), options?.page ?? 1, options?.pageSize ?? 20, options?.q ?? ""],
    queryFn: async () => {
      const result = await adminApi.collection<T>(
        collection,
        options
          ? {
              page: options.page ?? 1,
              pageSize: options.pageSize ?? 20,
              q: options.q || undefined,
            }
          : undefined,
      );
      if (Array.isArray(result)) {
        return {
          items: result,
          pagination: { page: 1, pageSize: result.length || 20, total: result.length, totalPages: 1 },
        };
      }
      return result;
    },
    placeholderData: (previous) => previous,
  });
}

export function useAdminProducts() {
  return useQuery({ queryKey: adminKeys.products, queryFn: adminApi.products });
}

export function useAdminCategories() {
  return useQuery({ queryKey: adminKeys.categories, queryFn: adminApi.categories });
}

export function useAdminSales() {
  return useQuery({ queryKey: adminKeys.sales, queryFn: adminApi.sales });
}

export function useAdminReports() {
  return useQuery({ queryKey: adminKeys.reports, queryFn: adminApi.reports });
}

export function useAdminUsers() {
  return useQuery({ queryKey: adminKeys.users, queryFn: adminApi.users });
}

export function useAdminCrud() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      collection: AdminCollection;
      id?: string;
      payload?: Record<string, unknown>;
      action: "create" | "update" | "delete";
    }) => {
      if (input.action === "create") return adminApi.create(input.collection, input.payload || {});
      if (input.action === "update" && input.id) return adminApi.update(input.collection, input.id, input.payload || {});
      if (input.action === "delete" && input.id) return adminApi.remove(input.collection, input.id);
      throw new Error("عملیات CRUD نامعتبر است.");
    },
    onSuccess: (_data, variables) => {
      void client.invalidateQueries({ queryKey: adminKeys.collection(variables.collection) });
      if (variables.collection === "products") void client.invalidateQueries({ queryKey: adminKeys.products });
      if (variables.collection === "categories") void client.invalidateQueries({ queryKey: adminKeys.categories });
    },
  });
}

export function useProductImageMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      productId: string;
      method: "POST" | "PATCH" | "DELETE";
      data?: unknown;
    }) => adminApi.productImages(input.productId, input.method, input.data),
    onSuccess: (_data, variables) =>
      client.invalidateQueries({ queryKey: adminKeys.products }),
  });
}

export function useUpdateShipping() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: { saleId: string; payload: Record<string, unknown> }) =>
      adminApi.updateShipping(input.saleId, input.payload),
    onSuccess: () => client.invalidateQueries({ queryKey: adminKeys.sales }),
  });
}

export function useSaveProduct() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { id?: string; payload: Record<string, unknown> }) =>
      input.id ? adminApi.updateProduct(input.id, input.payload) : adminApi.createProduct(input.payload),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: adminKeys.products });
      void client.invalidateQueries({ queryKey: adminKeys.collection("products") });
    },
  });
}

export function useUploadProductImages() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { productId: string; files: File[] }) => {
      const formData = new FormData();
      input.files.forEach((file) => formData.append("files", file));
      return adminApi.productImages(input.productId, "POST", formData);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: adminKeys.products }),
  });
}

export function useUserAccountMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { action: "create" | "update" | "delete"; id?: string; payload?: Record<string, unknown> }) => {
      if (input.action === "create") return adminApi.createUser(input.payload || {});
      if (input.action === "update" && input.id) return adminApi.updateUser(input.id, input.payload || {});
      if (input.action === "delete" && input.id) return adminApi.deleteUser(input.id);
      throw new Error("عملیات حساب نامعتبر است.");
    },
    onSuccess: () => client.invalidateQueries({ queryKey: adminKeys.users }),
  });
}

export function useCreateAdminPurchase() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => adminApi.create("purchases", payload),
    onSuccess: () => client.invalidateQueries({ queryKey: adminKeys.collection("purchases") }),
  });
}
