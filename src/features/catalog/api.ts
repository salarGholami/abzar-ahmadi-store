import { request } from "@/shared/api/client";
import type { Category, Product } from "@/lib/types";

export const catalogApi = {
  products: (params?: Record<string, string | number | boolean | undefined>) =>
    request<Product[]>({ url: "/products", method: "GET", params }),
  product: (id: string) => request<Product>({ url: `/products/${id}`, method: "GET" }),
  categories: () => request<Category[]>({ url: "/categories", method: "GET" }),
  brands: () => request<string[]>({ url: "/brands", method: "GET" }),
};
