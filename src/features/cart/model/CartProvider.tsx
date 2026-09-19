"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { Product } from "@/lib/types";
import { useCartMutation, useCartQuery } from "../hooks";
import type { CartLine } from "../api";

type CartContextValue = {
  lines: CartLine[];
  loading: boolean;
  count: number;
  subtotal: number;
  refresh: () => Promise<void>;
  add: (product: Product, qty?: number) => Promise<void>;
  setQty: (productId: string, qty: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const query = useCartQuery();
  const mutation = useCartMutation();
  const lines = query.data?.lines ?? [];

  const mutate = useCallback(
    async (action: "ADD" | "SET" | "REMOVE" | "CLEAR", productId?: string, quantity?: number) => {
      await mutation.mutateAsync({ action, productId, quantity });
    },
    [mutation],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      loading: query.isLoading || mutation.isPending,
      count: lines.reduce((sum, line) => sum + line.qty, 0),
      subtotal: lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0),
      refresh: async () => {
        await query.refetch();
      },
      add: (product, qty = 1) => mutate("ADD", product.id, qty),
      setQty: (productId, qty) => mutate("SET", productId, qty),
      remove: (productId) => mutate("REMOVE", productId),
      clear: () => mutate("CLEAR"),
    }),
    [lines, mutation.isPending, query.isLoading, query.refetch, mutate],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
