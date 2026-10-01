"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "./types";
import { trackEvent } from "./analytics";

export type CartLine = {
  productId: string;
  title: string;
  sku: string;
  image: string;
  unitPrice: number;
  stock: number;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  add: (product: Product, qty?: number) => Promise<void>;
  setQty: (productId: string, qty: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
  loading: boolean;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

async function requestCart(action?: string, productId?: string, quantity?: number) {
  const response = await fetch("/api/cart", {
    method: action ? "POST" : "GET",
    headers: action ? { "Content-Type": "application/json" } : undefined,
    body: action ? JSON.stringify({ action, productId, quantity }) : undefined,
    cache: "no-store",
  });
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message || "سبد خرید بروزرسانی نشد.");
  }
  return json.data;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await requestCart();
      setLines(Array.isArray(data?.lines) ? data.lines : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  async function mutate(action: "ADD" | "SET" | "REMOVE" | "CLEAR", productId?: string, qty?: number) {
    const data = await requestCart(action, productId, qty);
    setLines(Array.isArray(data?.lines) ? data.lines : []);
  }

  async function add(product: Product, qty = 1) {
    await mutate("ADD", product.id, qty);
  }

  async function setQty(productId: string, qty: number) {
    await mutate("SET", productId, qty);
  }

  async function remove(productId: string) {
    await mutate("REMOVE", productId);
  }

  async function clear() {
    await mutate("CLEAR");
  }

  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);

  const value = useMemo<CartContextValue>(
    () => ({ lines, add, setQty, remove, clear, refresh, loading, count, subtotal }),
    [lines, loading, count, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
