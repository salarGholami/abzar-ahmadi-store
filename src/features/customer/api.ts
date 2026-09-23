import { request } from "@/shared/api/client";
import type { CustomerAddress, Sale, StoreNotification } from "@/lib/types";
import type { PaginatedResult } from "@/lib/pagination";

export type AddressPayload = {
  title: string;
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  isDefault: boolean;
};

export const customerApi = {
  orders: (params?: { page?: number; pageSize?: number }) => request<Sale[] | PaginatedResult<Sale>>({ url: "/account/orders", method: "GET", params }),
  order: (id: string) => request<Sale>({ url: `/account/orders/${id}`, method: "GET" }),
  notifications: () => request<StoreNotification[]>({ url: "/account/notifications", method: "GET" }),
  markNotificationRead: (id: string) =>
    request<unknown>({ url: "/account/notifications", method: "POST", data: { id } }),
  preferences: () => request<Record<string, unknown>>({ url: "/account/preferences", method: "GET" }),
  addresses: () => request<CustomerAddress[]>({ url: "/account/addresses", method: "GET" }),
  createAddress: (payload: AddressPayload) =>
    request<CustomerAddress>({ url: "/account/addresses", method: "POST", data: payload }),
  updateAddress: (id: string, payload: Partial<CustomerAddress>) =>
    request<CustomerAddress>({ url: `/account/addresses/${id}`, method: "PATCH", data: payload }),
  deleteAddress: (id: string) =>
    request<unknown>({ url: `/account/addresses/${id}`, method: "DELETE" }),
};
