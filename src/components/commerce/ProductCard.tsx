"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Minus, PackageCheck, Plus, ShoppingCart } from "lucide-react";

import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import RatingStars from "./RatingStars";

interface ProductCardProps {
  p: Product;
  compact?: boolean;
}

export default function ProductCard({ p, compact = false }: ProductCardProps) {
  const { add, setQty, lines } = useCart();

  const line = lines.find((item) => item.productId === p.id);
  const quantity = line?.qty ?? 0;

  const finalPrice = Math.round(p.price * (1 - p.discount / 100));

  const primaryImage =
    p.images?.[0]?.url || p.image || "/placeholder-product.svg";

  const secondaryImage = p.images?.[1]?.url;

  const isOutOfStock = p.stock <= 0;
  const reachedStockLimit = quantity >= p.stock;

  function handleAdd() {
    if (isOutOfStock || reachedStockLimit) return;

    add(p, 1);
  }

  function decrease() {
    if (!line) return;

    setQty(p.id, Math.max(0, line.qty - 1));
  }

  return (
    <article
      className="
        group
        relative
        flex
        h-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-[22px]
        border
        border-[var(--border)]
        bg-[var(--surface)]
        shadow-[0_4px_18px_rgba(0,0,0,0.035)]
        transition-all
        duration-300
        active:scale-[0.99]
        sm:rounded-[24px]
        sm:hover:-translate-y-1
        sm:hover:border-[var(--primary)]/20
        sm:hover:shadow-[0_18px_45px_rgba(0,0,0,0.09)]
      "
    >
      {/* =====================================================
          IMAGE
      ====================================================== */}

      <Link
        href={`/products/${p.id}`}
        className="block shrink-0"
        aria-label={`مشاهده ${p.title}`}
      >
        <div
          className={`
            relative
            overflow-hidden
            bg-[var(--surface-2)]

            ${compact ? "aspect-[1.08]" : "aspect-square"}
          `}
        >
          {/* IMAGE */}
          <Image
            src={primaryImage}
            alt={p.title}
            fill
            unoptimized
            sizes="
              (max-width: 639px) 82vw,
              (max-width: 1023px) 50vw,
              (max-width: 1279px) 33vw,
              25vw
            "
            className="
              object-cover
              transition-transform
              duration-500
              ease-out
              sm:group-hover:scale-[1.045]
            "
          />

          {/* SECOND IMAGE */}
          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt=""
              fill
              unoptimized
              sizes="
                (max-width: 639px) 82vw,
                (max-width: 1023px) 50vw,
                (max-width: 1279px) 33vw,
                25vw
              "
              aria-hidden="true"
              className="
                object-cover
                opacity-0
                transition-all
                duration-500
                ease-out
                sm:group-hover:scale-[1.045]
                sm:group-hover:opacity-100
              "
            />
          )}

          {/* IMAGE OVERLAY */}
          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              bottom-0
              h-24
              bg-linear-to-t
              from-black/20
              to-transparent
              opacity-70
            "
          />

          {/* DISCOUNT */}
          {p.discount > 0 && (
            <span
              className="
                absolute
                right-2.5
                top-2.5
                rounded-full
                bg-red-500
                px-2.5
                py-1.5
                text-[9px]
                font-black
                leading-none
                text-white
                shadow-lg
                shadow-red-500/20
                sm:right-3
                sm:top-3
                sm:text-[10px]
              "
            >
              ٪{p.discount} تخفیف
            </span>
          )}

          {/* STOCK STATUS */}
          {isOutOfStock && (
            <span
              className="
                absolute
                left-2.5
                top-2.5
                rounded-full
                bg-black/65
                px-2.5
                py-1.5
                text-[9px]
                font-black
                text-white
                backdrop-blur-md
                sm:left-3
                sm:top-3
                sm:text-[10px]
              "
            >
              ناموجود
            </span>
          )}

          {/* MOBILE IMAGE INDICATOR */}
          {secondaryImage && (
            <span
              className="
                absolute
                bottom-3
                left-1/2
                -translate-x-1/2
                rounded-full
                bg-white/80
                px-2
                py-1
                text-[8px]
                font-black
                text-[var(--text)]
                shadow-sm
                backdrop-blur-md
                sm:hidden
              "
            >
              ۲ تصویر
            </span>
          )}
        </div>
      </Link>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className={`
          flex
          flex-1
          flex-col
          ${compact ? "p-3" : "p-3.5 sm:p-4"}
        `}
      >
        {/* BRAND / SKU */}

        <div
          className="
            mb-2
            flex
            min-w-0
            items-center
            justify-between
            gap-2
            text-[9px]
            font-bold
            text-[var(--muted)]
            sm:text-[10px]
          "
        >
          <span className="min-w-0 truncate">{p.brand}</span>

          <span className="shrink-0 rounded-md bg-[var(--surface-2)] px-1.5 py-1 font-mono">
            {p.sku}
          </span>
        </div>

        {/* TITLE */}

        <Link
          href={`/products/${p.id}`}
          className="
            min-h-[44px]
            line-clamp-2
            text-[13px]
            font-black
            leading-5
            tracking-tight
            text-[var(--text)]
            transition-colors
            hover:text-[var(--primary)]
            sm:min-h-[48px]
            sm:text-[15px]
            sm:leading-6
          "
        >
          {p.title}
        </Link>

        {/* RATING */}

        {p.rating ? (
          <div className="mt-2">
            <RatingStars
              rating={p.rating}
              reviewCount={p.reviewCount}
              size={11}
            />
          </div>
        ) : (
          <div className="h-[19px]" />
        )}

        {/* STOCK */}

        <div
          className="
            mt-2.5
            flex
            min-w-0
            items-center
            gap-1.5
            text-[9px]
            font-bold
            text-[var(--muted)]
            sm:mt-3
            sm:text-[10px]
          "
        >
          <PackageCheck
            size={13}
            className={
              isOutOfStock
                ? "shrink-0 text-red-500"
                : "shrink-0 text-[var(--success)]"
            }
          />

          <span className="truncate">
            {isOutOfStock
              ? "در حال حاضر موجود نیست"
              : `موجودی ${p.stock.toLocaleString("fa-IR")} عدد`}
          </span>
        </div>

        {/* DIVIDER */}

        <div className="my-3 h-px bg-[var(--border)]" />

        {/* PRICE + CART */}

        <div className="mt-auto flex items-end justify-between gap-2">
          {/* PRICE */}

          <div className="min-w-0">
            {p.discount > 0 && (
              <div
                className="
                  mb-0.5
                  truncate
                  text-[9px]
                  font-medium
                  text-[var(--muted)]
                  line-through
                  sm:text-[10px]
                "
              >
                {p.price.toLocaleString("fa-IR")} تومان
              </div>
            )}

            <div
              className="
                flex
                items-baseline
                gap-1
                whitespace-nowrap
                text-[15px]
                font-black
                tracking-tight
                text-[var(--text)]
                sm:text-lg
              "
            >
              <span>{finalPrice.toLocaleString("fa-IR")}</span>

              <span
                className="
                  text-[8px]
                  font-bold
                  text-[var(--muted)]
                  sm:text-[10px]
                "
              >
                تومان
              </span>
            </div>
          </div>

          {/* CART */}

          {quantity > 0 ? (
            <div
              className="
                flex
                h-10
                shrink-0
                items-center
                overflow-hidden
                rounded-xl
                bg-[var(--primary)]
                text-white
                shadow-md
                shadow-[var(--primary)]/15
                sm:h-11
              "
            >
              {/* MINUS */}

              <button
                type="button"
                onClick={decrease}
                className="
                  grid
                  size-9
                  place-items-center
                  transition
                  hover:bg-black/10
                  active:bg-black/20
                  sm:size-10
                "
                aria-label="کاهش تعداد"
              >
                <Minus size={15} />
              </button>

              {/* QUANTITY */}

              <span
                className="
                  min-w-7
                  text-center
                  text-xs
                  font-black
                  tabular-nums
                "
                aria-label={`تعداد ${quantity}`}
              >
                {quantity.toLocaleString("fa-IR")}
              </span>

              {/* PLUS */}

              <button
                type="button"
                onClick={handleAdd}
                disabled={reachedStockLimit}
                className="
                  grid
                  size-9
                  place-items-center
                  transition
                  hover:bg-black/10
                  active:bg-black/20
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                  sm:size-10
                "
                aria-label="افزایش تعداد"
              >
                <Plus size={15} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              disabled={isOutOfStock}
              className="
                group/cart
                flex
                h-10
                shrink-0
                items-center
                justify-center
                gap-1.5
                rounded-xl
                bg-[var(--primary)]
                px-3
                text-[10px]
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
                sm:px-3.5
                sm:text-xs
              "
              aria-label={isOutOfStock ? "محصول ناموجود" : "افزودن به سبد"}
            >
              {isOutOfStock ? (
                <Check size={14} />
              ) : (
                <ShoppingCart
                  size={15}
                  className="
                    transition-transform
                    duration-200
                    group-hover/cart:scale-110
                  "
                />
              )}

              <span>{isOutOfStock ? "ناموجود" : "افزودن"}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
