"use client";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "./types";

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
  add: (product: Product, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "abzarino_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch { /* ignore corrupt local storage */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  function add(product: Product, qty = 1) {
    const unitPrice = Math.round(product.price * (1 - product.discount / 100));
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      if (existing) {
        const nextQty = Math.min(product.stock, existing.qty + qty);
        return prev.map((l) => (l.productId === product.id ? { ...l, qty: nextQty } : l));
      }
      return [...prev, { productId: product.id, title: product.title, sku: product.sku, image: product.image, unitPrice, stock: product.stock, qty: Math.min(product.stock, qty) }];
    });
  }
  function setQty(productId: string, qty: number) {
    setLines((prev) => prev.flatMap((l) => {
      if (l.productId !== productId) return [l];
      if (qty <= 0) return [];
      return [{ ...l, qty: Math.min(l.stock, qty) }];
    }));
  }
  function remove(productId: string) {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }
  function clear() { setLines([]); }

  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);

  const value = useMemo(() => ({ lines, add, setQty, remove, clear, count, subtotal }), [lines, count, subtotal]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
