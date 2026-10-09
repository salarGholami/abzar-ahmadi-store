"use client";

import { ShoppingBag, Zap } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Product } from "@/lib/types";
import { useCart } from "@/features/cart/model/CartProvider";
import { useToast } from "@/shared/ui/Toast";

type ProductStickyBarProps = {
  product: Product;
  finalPrice: number;
};

/**
 * Fixed bottom bar on mobile product pages so users can add to cart
 * without scrolling back up. Sits above the MobileBottomNav.
 */
export default function ProductStickyBar({
  product,
  finalPrice,
}: ProductStickyBarProps) {
  const { add } = useCart();
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  const handleAdd = async () => {
    if (outOfStock || busy) return;
    setBusy(true);
    try {
      await add(product, 1);
      setAdded(true);
      toast.success("به سبد خرید اضافه شد");
      window.setTimeout(() => setAdded(false), 1800);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "افزودن به سبد خرید انجام نشد.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleBuyNow = async () => {
    if (outOfStock || busy) return;
    setBusy(true);
    try {
      await add(product, 1);
      router.push("/cart");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "افزودن به سبد خرید انجام نشد.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="
        fixed inset-x-0 z-[55] border-t border-[var(--border)]
        bg-[var(--surface)]/95 backdrop-blur-xl
        px-3 py-2.5
        bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))]
        md:hidden
        shadow-[0_-8px_30px_rgba(0,0,0,0.08)]
        dark:shadow-[0_-8px_30px_rgba(0,0,0,0.35)]
      "
      role="region"
      aria-label="اقدامات سریع محصول"
    >
      <div className="mx-auto flex max-w-lg items-center gap-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-[var(--muted)]">
            {product.title}
          </p>
          <p className="mt-0.5 text-sm font-extrabold text-[var(--primary)]">
            {finalPrice.toLocaleString("fa-IR")}{" "}
            <span className="text-[11px] font-bold text-[var(--muted)]">
              تومان
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleBuyNow()}
          disabled={outOfStock || busy}
          className="flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-extrabold transition active:scale-95 disabled:opacity-40"
          aria-label="خرید سریع"
        >
          <Zap size={15} className="text-[var(--primary)]" aria-hidden />
          خرید
        </button>

        <button
          type="button"
          onClick={() => void handleAdd()}
          disabled={outOfStock || busy}
          className="flex h-11 min-w-[7.5rem] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] px-3 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(0,173,181,0.25)] transition active:scale-95 disabled:opacity-40"
        >
          <ShoppingBag size={15} aria-hidden />
          {outOfStock
            ? "ناموجود"
            : busy
              ? "..."
              : added
                ? "اضافه شد ✓"
                : "افزودن"}
        </button>
      </div>
    </div>
  );
}
