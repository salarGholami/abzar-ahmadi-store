"use client";

import { Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";

export default function ProductActions({ product }: { product: Product }) {
  const { add } = useCart();
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const outOfStock = product.stock <= 0;

  const decrease = () => {
    setQuantity((value) => Math.max(1, value - 1));
  };

  const increase = () => {
    setQuantity((value) => Math.min(product.stock, value + 1));
  };

  const handleAdd = () => {
    if (outOfStock) return;

    add(product, quantity);

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  const handleBuyNow = () => {
    if (outOfStock) return;

    add(product, quantity);
    router.push("/cart");
  };

  return (
    <div>
      {/* Quantity */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-black">تعداد</div>

          <div className="mt-1 text-[10px] font-bold text-[var(--muted)]">
            حداکثر {product.stock.toLocaleString("fa-IR")} عدد
          </div>
        </div>

        <div className="flex h-12 items-center overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
          <button
            type="button"
            onClick={decrease}
            disabled={outOfStock || quantity <= 1}
            className="grid size-11 place-items-center transition hover:bg-[var(--surface-2)] disabled:opacity-30"
            aria-label="کاهش تعداد"
          >
            <Minus size={16} />
          </button>

          <div className="grid min-w-12 place-items-center text-sm font-black">
            {quantity.toLocaleString("fa-IR")}
          </div>

          <button
            type="button"
            onClick={increase}
            disabled={outOfStock || quantity >= product.stock}
            className="grid size-11 place-items-center transition hover:bg-[var(--surface-2)] disabled:opacity-30"
            aria-label="افزایش تعداد"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Main actions */}
      <div className="mt-4 grid gap-3 sm:grid-cols-[1.4fr_1fr]">
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className="group relative flex min-h-14 items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-[var(--primary)] px-5 text-sm font-black text-white shadow-[0_12px_30px_rgba(0,173,181,0.22)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(0,173,181,0.3)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-0" />

          <ShoppingBag size={19} className="relative" />

          <span className="relative">
            {outOfStock
              ? "ناموجود"
              : added
                ? "به سبد اضافه شد ✓"
                : "افزودن به سبد خرید"}
          </span>
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-black transition hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Zap size={18} className="text-[var(--primary)]" />
          خرید سریع
        </button>
      </div>
    </div>
  );
}
