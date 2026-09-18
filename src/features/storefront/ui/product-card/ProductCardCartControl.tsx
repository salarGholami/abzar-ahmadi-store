"use client";

import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import type { Product } from "@/domains/catalog";
import { useCart } from "@/features/cart/model/CartProvider";

type ProductCardCartControlProps = {
  product: Product;
};

export default function ProductCardCartControl({
  product,
}: ProductCardCartControlProps) {
  const { add, setQty, lines } = useCart();

  const line = lines.find((item) => item.productId === product.id);
  const quantity = line?.qty ?? 0;

  const outOfStock = product.stock <= 0;
  const stockLimitReached = quantity >= product.stock;

  const handleAdd = () => {
    if (outOfStock) return;

    add(product, 1);
  };

  const handleIncrease = () => {
    if (stockLimitReached) return;

    add(product, 1);
  };

  const handleDecrease = () => {
    if (!line) return;

    setQty(product.id, Math.max(0, line.qty - 1));
  };

  if (quantity > 0) {
    return (
      <div
        className="
          flex h-9 shrink-0 items-center overflow-hidden
          rounded-[10px]
          bg-[var(--primary)]
          text-white
          shadow-md
          sm:h-11
          sm:rounded-xl
        "
      >
        <button
          type="button"
          onClick={handleDecrease}
          className="
            grid size-7 place-items-center
            transition
            hover:bg-black/10
            active:bg-black/20
            sm:size-10
          "
          aria-label="کاهش تعداد"
        >
          <Minus size={13} />
        </button>

        <span
          className="
            min-w-5
            text-center
            text-[10px]
            font-black
            tabular-nums
            sm:min-w-7
            sm:text-xs
          "
          aria-label={`تعداد ${quantity}`}
        >
          {quantity.toLocaleString("fa-IR")}
        </span>

        <button
          type="button"
          onClick={handleIncrease}
          disabled={stockLimitReached}
          className="
            grid size-7 place-items-center
            transition
            hover:bg-black/10
            active:bg-black/20
            disabled:cursor-not-allowed
            disabled:opacity-40
            sm:size-10
          "
          aria-label="افزایش تعداد"
        >
          <Plus size={13} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={outOfStock}
      className="
        group/cart
        flex h-9 shrink-0
        items-center justify-center
        gap-1
        rounded-[10px]
        bg-[var(--primary)]
        px-2.5
        text-[9px]
        font-black
        text-white
        shadow-md
        shadow-[var(--primary)]/15
        transition-all
        hover:-translate-y-0.5
        hover:bg-[var(--primary-2)]
        active:translate-y-0
        active:scale-95
        disabled:cursor-not-allowed
        disabled:bg-[var(--muted)]
        disabled:opacity-50
        sm:h-11
        sm:gap-1.5
        sm:rounded-xl
        sm:px-3.5
        sm:text-xs
      "
      aria-label={outOfStock ? "محصول ناموجود" : "افزودن به سبد"}
    >
      {outOfStock ? (
        <Check size={13} />
      ) : (
        <ShoppingCart
          size={14}
          className="
            transition-transform
            duration-200
            group-hover/cart:scale-110
            sm:size-[15px]
          "
        />
      )}

      <span className="hidden sm:inline">
        {outOfStock ? "ناموجود" : "افزودن"}
      </span>
    </button>
  );
}
