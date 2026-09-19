import { request } from "@/shared/api/client";
import type { Product } from "@/lib/types";

export type CartLine = {
  productId: string;
  title: string;
  sku: string;
  image: string;
  unitPrice: number;
  stock: number;
  qty: number;
};

export type CartData = { lines: CartLine[] };

export const cartApi = {
  get: () => request<CartData>({ url: "/cart", method: "GET" }),
  mutate: (payload: {
    action: "ADD" | "SET" | "REMOVE" | "CLEAR";
    productId?: string;
    quantity?: number;
  }) => request<CartData>({ url: "/cart", method: "POST", data: payload }),
};
