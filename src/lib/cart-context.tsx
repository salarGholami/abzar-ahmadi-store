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

      if (raw) {
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) {
          setLines(parsed);
        }
      }
    } catch {
      // localStorage خراب یا نامعتبر است
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignore storage errors
    }
  }, [lines, hydrated]);

  function add(product: Product, qty = 1) {
    const unitPrice = Math.round(product.price * (1 - product.discount / 100));

    setLines((prev) => {
      const existing = prev.find((line) => line.productId === product.id);

      if (existing) {
        const nextQty = Math.min(product.stock, existing.qty + qty);

        return prev.map((line) =>
          line.productId === product.id
            ? {
                ...line,
                qty: nextQty,
                stock: product.stock,
                unitPrice,
              }
            : line,
        );
      }

      return [
        ...prev,
        {
          productId: product.id,
          title: product.title,
          sku: product.sku,
          image: product.image,
          unitPrice,
          stock: product.stock,
          qty: Math.min(product.stock, qty),
        },
      ];
    });
  }

  function setQty(productId: string, qty: number) {
    setLines((prev) =>
      prev.flatMap((line) => {
        if (line.productId !== productId) {
          return [line];
        }

        if (qty <= 0) {
          return [];
        }

        return [
          {
            ...line,
            qty: Math.min(line.stock, qty),
          },
        ];
      }),
    );
  }

  function remove(productId: string) {
    setLines((prev) => prev.filter((line) => line.productId !== productId));
  }

  function clear() {
    setLines([]);
  }

  const count = lines.reduce((sum, line) => sum + line.qty, 0);

  const subtotal = lines.reduce(
    (sum, line) => sum + line.unitPrice * line.qty,
    0,
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      add,
      setQty,
      remove,
      clear,
      count,
      subtotal,
    }),
    [lines, count, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
