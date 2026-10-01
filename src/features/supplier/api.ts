import { request } from "@/shared/api/client";
import type { PaginatedResult } from "@/lib/pagination";

export type SupplierOrder = {
  id: string;
  subtotal: number;
  paymentMethod: string;
  createdAt: string;
  itemCount: number;
  items: { id: string; quantity: number; unitCost: number; total: number; productTitle: string; productSku: string | null }[];
};
export type SupplierOverview = {
  supplier: { id: string; name: string; phone?: string } | null;
  stats: { productCount: number; orderCount: number; totalPurchaseAmount: number; totalUnits: number };
  recentOrders: { id: string; subtotal: number; paymentMethod: string; createdAt: string; itemCount: number }[];
};
export type SupplierFinance = {
  summary: { totalPurchases: number; totalAmount: number; cashAmount: number; checkAmount: number };
  entries: { id: string; amount: number; paymentMethod: string; createdAt: string; description: string }[];
  pagination?: import("@/lib/pagination").PaginationMeta;
};
export type SupplierProfile = {
  user: { id: string; name: string; phone: string; role: string };
  supplierId: string;
  supplier: { id: string; name: string; phone?: string; address?: string } | null;
};
export type SupplierProduct = {
  id: string; title: string; brand: string; sku: string; category: string; price: number; stock: number; image: string;
};

export const supplierApi = {
  overview: () => request<SupplierOverview>({ url: "/supplier/overview", method: "GET" }),
  orders: (params?: { page?: number; pageSize?: number; q?: string }) =>
    request<SupplierOrder[] | PaginatedResult<SupplierOrder>>({ url: "/supplier/orders", method: "GET", params }),
  profile: () => request<SupplierProfile>({ url: "/supplier/profile", method: "GET" }),
  updateProfile: (payload: { name: string; phone: string; address: string }) =>
    request<SupplierProfile>({ url: "/supplier/profile", method: "PATCH", data: payload }),
  products: (params?: { page?: number; pageSize?: number; q?: string }) =>
    request<SupplierProduct[] | PaginatedResult<SupplierProduct>>({ url: "/supplier/products", method: "GET", params }),
  finance: (params?: { page?: number; pageSize?: number }) =>
    request<SupplierFinance>({ url: "/supplier/finance", method: "GET", params }),
};
