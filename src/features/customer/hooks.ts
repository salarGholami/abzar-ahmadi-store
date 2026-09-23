"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerApi, type AddressPayload } from "./api";

export const customerKeys = {
  orders: ["customer", "orders"] as const,
  order: (id: string) => ["customer", "order", id] as const,
  notifications: ["customer", "notifications"] as const,
  addresses: ["customer", "addresses"] as const,
};

export const useCustomerOrders = (options?: { enabled?: boolean; page?: number; pageSize?: number }) =>
  useQuery({
    queryKey: [...customerKeys.orders, options?.page ?? 1, options?.pageSize ?? 10],
    queryFn: async () => {
      const result = await customerApi.orders({ page: options?.page ?? 1, pageSize: options?.pageSize ?? 10 });
      return Array.isArray(result)
        ? { items: result, pagination: { page: 1, pageSize: result.length || 10, total: result.length, totalPages: 1 } }
        : result;
    },
    enabled: options?.enabled ?? true,
  });
export const useCustomerOrder = (id: string) => useQuery({ queryKey: customerKeys.order(id), queryFn: () => customerApi.order(id), enabled: Boolean(id) });
export const useCustomerNotifications = () => useQuery({ queryKey: customerKeys.notifications, queryFn: customerApi.notifications });
export const useCustomerAddresses = () => useQuery({ queryKey: customerKeys.addresses, queryFn: customerApi.addresses });

export function useAddressMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { id?: string; payload: Partial<AddressPayload> }) =>
      input.id ? customerApi.updateAddress(input.id, input.payload) : customerApi.createAddress(input.payload as AddressPayload),
    onSuccess: () => client.invalidateQueries({ queryKey: customerKeys.addresses }),
  });
}

export function useDeleteAddress() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: customerApi.deleteAddress,
    onSuccess: () => client.invalidateQueries({ queryKey: customerKeys.addresses }),
  });
}

export function useMarkNotificationRead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: customerApi.markNotificationRead,
    onSuccess: () => client.invalidateQueries({ queryKey: customerKeys.notifications }),
  });
}
