import { request } from "@/shared/api/client";
import type { AppUser, Category, Product, Sale } from "@/lib/types";
import type { PaginatedResult } from "@/lib/pagination";

export type AdminCollection =
  | "categories"
  | "products"
  | "sales"
  | "purchases"
  | "customers"
  | "suppliers"
  | "reviews"
  | "notifications"
  | "coupons"
  | "shipping"
  | "shipping-methods"
  | "finance"
  | "checks"
  | "incomes"
  | "expenses"
  | "quotations"
  | "returns"
  | "brands"
  | "banners"
  | "articles"
  | "activity-logs"
  | "users";

export const adminApi = {
  collection: <T>(
    collection: AdminCollection,
    params?: { page?: number; pageSize?: number; q?: string },
  ) =>
    request<T[] | PaginatedResult<T>>({
      url: `/admin/${collection}`,
      method: "GET",
      params,
    }),
  create: <T>(collection: AdminCollection, payload: Record<string, unknown>) =>
    request<T>({ url: `/admin/${collection}`, method: "POST", data: payload }),
  update: <T>(collection: AdminCollection, id: string, payload: Record<string, unknown>) =>
    request<T>({ url: `/admin/${collection}/${id}`, method: "PATCH", data: payload }),
  remove: (collection: AdminCollection, id: string) =>
    request<unknown>({ url: `/admin/${collection}/${id}`, method: "DELETE" }),
  products: () => request<Product[]>({ url: "/admin/products", method: "GET" }),
  createProduct: (payload: Record<string, unknown>) =>
    request<Product>({ url: "/admin/products", method: "POST", data: payload }),
  updateProduct: (id: string, payload: Record<string, unknown>) =>
    request<Product>({ url: `/admin/products/${id}`, method: "PATCH", data: payload }),
  product: (id: string) => request<Product>({ url: `/admin/products/${id}`, method: "GET" }),
  categories: () => request<Category[]>({ url: "/admin/categories", method: "GET" }),
  sales: () => request<Sale[]>({ url: "/admin/sales", method: "GET" }),
  reports: () => request<Record<string, unknown>>({ url: "/admin/reports/summary", method: "GET" }),
  dataCenter: (method: "GET" | "POST", payload?: Record<string, unknown>) =>
    request<Record<string, unknown>>({ url: "/admin/data-center", method, data: payload }),
  users: () =>
    request<Omit<AppUser, "passwordHash">[]>({
      url: "/admin/users",
      method: "GET",
    }),
  createUser: (payload: Record<string, unknown>) =>
    request<Omit<AppUser, "passwordHash">>({
      url: "/admin/users",
      method: "POST",
      data: payload,
    }),
  updateUser: (id: string, payload: Record<string, unknown>) =>
    request<Omit<AppUser, "passwordHash">>({
      url: `/admin/users/${id}`,
      method: "PATCH",
      data: payload,
    }),
  deleteUser: (id: string) =>
    request<unknown>({ url: `/admin/users/${id}`, method: "DELETE" }),
  productImages: (productId: string, method: "POST" | "PATCH" | "DELETE", data?: unknown) =>
    request<unknown>({ url: `/admin/products/${productId}/images`, method, data }),
  updateShipping: (saleId: string, payload: Record<string, unknown>) =>
    request<Sale>({ url: `/admin/sales/${saleId}/shipping`, method: "PATCH", data: payload }),
};
