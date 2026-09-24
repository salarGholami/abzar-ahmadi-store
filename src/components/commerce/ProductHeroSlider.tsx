"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Sparkles, Tag, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Product } from "@/lib/types";

type ProductHeroSliderProps = {
  products: Product[];
};

function SliderArrow({
  direction,
  onClick,
  mobile = false,
}: {
  direction: "next" | "prev";
  onClick: () => void;
  mobile?: boolean;
}) {
  const buttonClass =
    (mobile
      ? "group/slider-arrow relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border backdrop-blur-xl transition-all duration-300 active:scale-90 "
      : "group/slider-arrow relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border backdrop-blur-xl transition-all duration-300 active:scale-90 ") +
    "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]";

  const triangleClass =
    "relative z-10 block h-0 w-0 border-y-[5px] border-y-transparent transition-transform duration-300 " +
    (direction === "next"
      ? "border-l-[7px] border-l-[var(--primary)] group-hover/slider-arrow:translate-x-0.5"
      : "border-r-[7px] border-r-[var(--primary)] group-hover/slider-arrow:-translate-x-0.5");

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "next" ? "محصول بعدی" : "محصول قبلی"}
      className={buttonClass}
    >
      <span className="absolute inset-0 scale-0 rounded-full bg-[var(--primary)]/10 transition-transform duration-500 group-hover/slider-arrow:scale-150" />

      <span className={triangleClass} />
    </button>
  );
}

function getProductImage(product: Product) {
  return (
    product.images?.[0]?.url || product.image || "/placeholder-product.svg"
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR").format(price);
}

export default function ProductHeroSlider({
  products,
}: ProductHeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef<number | null>(null);

  const touchEndX = useRef<number | null>(null);

  /*
   * =========================================================
   * PRODUCTS
   * =========================================================
   */

  const sliderProducts = useMemo(() => {
    return products.slice(0, 6);
  }, [products]);

  /*
   * =========================================================
   * AUTO SLIDER
   * =========================================================
   */

  useEffect(() => {
    if (sliderProducts.length <= 1 || isPaused) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => {
        return (current + 1) % sliderProducts.length;
      });
    }, 5500);

    return () => window.clearInterval(interval);
  }, [sliderProducts.length, isPaused]);

  /*
   * =========================================================
   * INDEX SAFETY
   * =========================================================
   */

  useEffect(() => {
    if (sliderProducts.length > 0 && activeIndex >= sliderProducts.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, sliderProducts.length]);

  /*
   * =========================================================
   * NEXT
   * =========================================================
   */

  const nextSlide = () => {
    if (sliderProducts.length <= 1) {
      return;
    }

    setActiveIndex((current) => {
      return (current + 1) % sliderProducts.length;
    });
  };

  /*
   * =========================================================
   * PREVIOUS
   * =========================================================
   */

  const previousSlide = () => {
    if (sliderProducts.length <= 1) {
      return;
    }

    setActiveIndex((current) => {
      return (current - 1 + sliderProducts.length) % sliderProducts.length;
    });
  };

  /*
   * =========================================================
   * TOUCH
   * =========================================================
   */

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;

    touchEndX.current = null;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) {
      return;
    }

    const distance = touchStartX.current - touchEndX.current;

    if (Math.abs(distance) < 45) {
      touchStartX.current = null;
      touchEndX.current = null;
      return;
    }

    if (distance > 0) {
      nextSlide();
    } else {
      previousSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  /*
   * =========================================================
   * EMPTY
   * =========================================================
   */

  if (!sliderProducts.length) {
    return null;
  }

  const activeProduct = sliderProducts[activeIndex] || sliderProducts[0];

  const activeImage = getProductImage(activeProduct);

  /*
   * =========================================================
   * PRICE
   * =========================================================
   */

  const discount =
    typeof activeProduct.discount === "number" ? activeProduct.discount : 0;

  const hasDiscount = discount > 0;

  const originalPrice = activeProduct.price;

  const finalPrice = hasDiscount
    ? Math.round(originalPrice - originalPrice * (discount / 100))
    : originalPrice;

  return (
    <section
      dir="rtl"
      className="
        relative
        w-full
        overflow-hidden
        rounded-[30px]
        border
        border-[var(--border)]
        bg-[var(--surface)]
        shadow-[0_18px_55px_rgba(34,40,49,0.08)]
        dark:shadow-[0_18px_55px_rgba(0,0,0,0.28)]
      "
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="absolute inset-0 overflow-hidden bg-[var(--bg-secondary)]">
        {/* Main Glow */}

        <div
          className="
            absolute
            -right-32
            -top-32
            h-[430px]
            w-[430px]
            rounded-full
            bg-primary-500/10
            blur-3xl
          "
        />

        {/* Bottom Glow */}

        <div
          className="
            absolute
            -bottom-40
            -left-40
            h-[500px]
            w-[500px]
            rounded-full
            bg-primary-500/5
            blur-3xl
          "
        />

        {/* Large Circle */}

        <div
          className="
            absolute
            -right-20
            top-1/2
            h-[440px]
            w-[440px]
            -translate-y-1/2
            rounded-full
            border
            border-charcoal-500/5
            dark:border-white/[0.035]
          "
        />

        {/* Second Circle */}

        <div
          className="
            absolute
            -right-8
            top-1/2
            h-[330px]
            w-[330px]
            -translate-y-1/2
            rounded-full
            border
            border-primary-500/10
          "
        />

        {/* Decorative Circle */}

        <div
          className="
            absolute
            right-[30%]
            top-[14%]
            h-20
            w-20
            rounded-full
            border
            border-primary-500/10
          "
        />

        <div
          className="
            absolute
            right-[33%]
            top-[17%]
            h-14
            w-14
            rounded-full
            border
            border-primary-500/10
          "
        />

        {/* Decorative Shape */}

        <div
          className="
            absolute
            -left-[15%]
            bottom-[-40%]
            h-[120%]
            w-[55%]
            rotate-[-18deg]
            rounded-[100px]
            border
            border-primary-500/5
            bg-primary-500/[0.02]
          "
        />

        {/* Dot Pattern */}

        <div
          className="
            absolute
            bottom-0
            left-0
            h-[220px]
            w-[320px]
            opacity-30
            [background-image:radial-gradient(circle,_var(--primary)_1px,_transparent_1px)]
            [background-size:18px_18px]
          "
        />

        {/* Lines */}

        <div
          className="
            absolute
            left-[8%]
            top-[18%]
            h-px
            w-[30%]
            bg-gradient-to-r
            from-transparent
            via-primary-500/20
            to-transparent
          "
        />

        <div
          className="
            absolute
            bottom-[18%]
            right-[8%]
            h-px
            w-[25%]
            bg-gradient-to-r
            from-transparent
            via-primary-500/20
            to-transparent
          "
        />
      </div>

      {/* =====================================================
          DESKTOP
      ====================================================== */}

      <div className="relative z-10 hidden min-h-[470px] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
        {/* ===================================================
            LEFT
        ==================================================== */}

        <div className="relative flex flex-col justify-center px-12 py-12 xl:px-16">
          {/* Badge */}

          <div
            className="
              mb-5
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-full
              border
              border-primary-500/20
              bg-primary-500/10
              px-4
              py-2
              text-xs
              font-black
              text-primary-700
              dark:text-primary-300
            "
          >
            <Sparkles className="h-3.5 w-3.5" />
            پیشنهاد ویژه ابزار احمدی
          </div>

          {/* Brand */}

          {activeProduct.brand && (
            <p
              className="
                mb-2
                text-sm
                font-bold
                text-primary-700
                dark:text-primary-300
              "
            >
              {activeProduct.brand}
            </p>
          )}

          {/* Title */}

          <h2
            key={`desktop-title-${activeProduct.id}`}
            className="
              max-w-[620px]
              text-[40px]
              font-black
              leading-[1.4]
              tracking-tight
              text-[var(--text)]
              xl:text-[48px]
            "
          >
            {activeProduct.title}
          </h2>

          {/* Description */}

          <p
            className="
              mt-5
              max-w-[560px]
              text-sm
              leading-8
              text-[var(--muted)]
            "
          >
            انتخاب حرفه‌ای برای پروژه‌های ساختمانی، صنعتی و کارگاهی با کیفیت
            بالا و قیمت مناسب.
          </p>

          {/* Price */}

          <div className="mt-8 flex items-end gap-5">
            <div>
              {hasDiscount && (
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="
                      text-sm
                      text-[var(--muted)]
                      line-through
                      decoration-red-500/60
                      decoration-2
                    "
                  >
                    {formatPrice(originalPrice)}
                  </span>

                  <span className="text-[10px] text-[var(--muted)]">تومان</span>
                </div>
              )}

              <div className="flex items-baseline gap-2">
                <span
                  className={
                    "text-[34px] font-black leading-none xl:text-[38px] " +
                    (hasDiscount
                      ? "text-primary-700 dark:text-primary-300"
                      : "text-[var(--text)]")
                  }
                >
                  {formatPrice(finalPrice)}
                </span>

                <span className="text-sm font-bold text-[var(--muted)]">
                  تومان
                </span>
              </div>
            </div>

            {hasDiscount && (
              <div
                className="
                  mb-0.5
                  flex
                  items-center
                  gap-1.5
                  rounded-xl
                  bg-red-500/10
                  px-3
                  py-2
                  text-xs
                  font-black
                  text-red-600
                  dark:text-red-400
                "
              >
                <Tag className="h-3.5 w-3.5" />
                {discount}% تخفیف
              </div>
            )}
          </div>

          {/* =================================================
              ACTIONS
          ================================================== */}

          <div className="mt-8 flex items-center gap-3">
            {/* خرید محصول */}

            <Link
              href={`/products/${activeProduct.id}`}
              className="
                group
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-[var(--primary)]
                px-6
                py-4
                text-sm
                font-black
                !text-white
                shadow-lg
                shadow-primary-500/15
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-[var(--primary-2)]
                hover:!text-white
                focus:!text-white
              "
            >
              <ShoppingCart
                className="
                  h-4
                  w-4
                  shrink-0
                  !text-white
                  transition-transform
                  duration-300
                  group-hover:scale-110
                "
              />

              <span className="!text-white">مشاهده و خرید محصول</span>
            </Link>

            {/* سبد خرید */}

            <Link
              href="/cart"
              className="
                group
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-[var(--border)]
                bg-[var(--surface)]
                px-6
                py-4
                text-sm
                font-bold
                text-[var(--text)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-primary-500/30
                hover:bg-primary-500/10
                hover:text-primary-700
                dark:hover:text-primary-300
              "
            >
              <ShoppingCart className="h-4 w-4" />
              سبد خرید
            </Link>
          </div>

          {/* Features */}

          <div className="mt-7 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-xl
                  bg-primary-500/10
                "
              >
                <Tag className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              </div>

              <span className="text-xs font-bold text-[var(--muted)]">
                قیمت مناسب
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-xl
                  bg-primary-500/10
                "
              >
                <Zap className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              </div>

              <span className="text-xs font-bold text-[var(--muted)]">
                کیفیت حرفه‌ای
              </span>
            </div>
          </div>
        </div>

        {/* ===================================================
            RIGHT / PRODUCT
        ==================================================== */}

        <div className="relative flex flex-col items-center justify-center px-12 py-10 xl:px-16">
          {/* Glow */}

          <div
            className="
              absolute
              right-[8%]
              top-[10%]
              h-[70%]
              w-[78%]
              rounded-full
              bg-primary-500/[0.08]
              blur-3xl
            "
          />

          {/* Product Image */}

          <div className="relative h-[360px] w-full max-w-[500px] xl:h-[375px]">
            {/* Outer */}

            <div
              className="
                absolute
                inset-0
                rounded-[38px]
                border
                border-[var(--border)]
                bg-[var(--surface)]/50
                backdrop-blur-xl
              "
            />

            {/* Inner */}

            <div
              className="
                absolute
                inset-5
                overflow-hidden
                rounded-[31px]
                bg-[var(--surface)]/40
              "
            >
              <Image
                key={`desktop-image-${activeProduct.id}`}
                src={activeImage}
                alt={activeProduct.title}
                fill
                priority
                sizes="(max-width: 1024px) 0px, 500px"
                className="
                  object-contain
                  p-10
                  transition-transform
                  duration-700
                  hover:scale-105
                "
              />
            </div>

            {/* Discount */}

            {hasDiscount && (
              <div
                className="
                  absolute
                  right-6
                  top-6
                  flex
                  items-center
                  gap-1.5
                  rounded-full
                  bg-[var(--primary)]
                  px-3.5
                  py-2
                  text-xs
                  font-black
                  !text-white
                  shadow-lg
                "
              >
                <Zap className="h-3.5 w-3.5 !text-white" />

                <span className="!text-white">{discount}% تخفیف</span>
              </div>
            )}
          </div>

          {/* =================================================
              ARROWS
              دقیقاً زیر عکس
          ================================================== */}

          <div className="relative z-30 mt-6 flex items-center justify-center gap-4">
            <SliderArrow direction="next" onClick={nextSlide} />

            <SliderArrow direction="prev" onClick={previousSlide} />
          </div>
        </div>
      </div>

      {/* =====================================================
          DESKTOP DOTS
          دقیقاً وسط کل اسلایدر
      ====================================================== */}

      <div
        className="
          absolute
          bottom-5
          left-0
          right-0
          z-40
          hidden
          items-center
          justify-center
          lg:flex
        "
      >
        <div className="flex items-center justify-center gap-2">
          {sliderProducts.map((product, index) => (
            <button
              key={product.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`رفتن به اسلاید ${index + 1}`}
              className={
                "h-1.5 rounded-full transition-all duration-500 " +
                (index === activeIndex
                  ? "w-9 bg-[var(--primary)]"
                  : "w-1.5 bg-charcoal-500/20 hover:bg-charcoal-500/40 dark:bg-white/20 dark:hover:bg-white/40")
              }
            />
          ))}
        </div>
      </div>

      {/* =====================================================
          MOBILE
      ====================================================== */}

      <div className="relative z-10 block px-4 pb-5 pt-5 sm:px-5 lg:hidden">
        {/* Top badges */}

        <div className="flex items-center justify-between gap-3">
          <div
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              border
              border-primary-500/20
              bg-primary-500/10
              px-2.5
              py-1.5
              text-[10px]
              font-black
              text-primary-700
              dark:text-primary-300
            "
          >
            <Sparkles className="h-3 w-3" />
            پیشنهاد ویژه
          </div>

          {hasDiscount && (
            <div
              className="
                flex
                items-center
                gap-1
                rounded-full
                bg-red-500/10
                px-2.5
                py-1.5
                text-[10px]
                font-black
                text-red-600
                dark:text-red-400
              "
            >
              <Tag className="h-3 w-3" />
              {discount}% تخفیف
            </div>
          )}
        </div>

        {/* =================================================
            MOBILE IMAGE
        ================================================== */}

        <div className="relative mx-auto mt-4 h-[220px] w-full max-w-[340px]">
          <div
            className="
              absolute
              inset-[8%]
              rounded-[30px]
              bg-primary-500/10
              blur-3xl
            "
          />

          <div
            className="
              relative
              h-full
              w-full
              overflow-hidden
              rounded-[26px]
              border
              border-[var(--border)]
              bg-[var(--surface)]/50
              backdrop-blur-xl
            "
          >
            <Image
              key={`mobile-${activeProduct.id}`}
              src={activeImage}
              alt={activeProduct.title}
              fill
              priority
              sizes="(max-width: 640px) 100vw, 340px"
              className="
                object-contain
                p-5
                transition-transform
                duration-700
              "
            />
          </div>
        </div>

        {/* =================================================
            MOBILE CONTENT
        ================================================== */}

        <div className="mt-4">
          {/* Brand */}

          <p
            className="
              text-[11px]
              font-bold
              text-primary-700
              dark:text-primary-300
            "
          >
            {activeProduct.brand || "ابزار احمدی"}
          </p>

          {/* Title */}

          <h2
            key={`mobile-title-${activeProduct.id}`}
            className="
              mt-1.5
              line-clamp-2
              text-[20px]
              font-black
              leading-[1.55]
              text-[var(--text)]
            "
          >
            {activeProduct.title}
          </h2>

          {/* Price */}

          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              {hasDiscount && (
                <div className="mb-1 flex items-center gap-1.5">
                  <span
                    className="
                      text-[10px]
                      text-[var(--muted)]
                      line-through
                    "
                  >
                    {formatPrice(originalPrice)}
                  </span>

                  <span className="text-[10px] text-[var(--muted)]">تومان</span>
                </div>
              )}

              <div className="flex items-baseline gap-1.5">
                <span
                  className={
                    "text-xl font-black " +
                    (hasDiscount
                      ? "text-primary-700 dark:text-primary-300"
                      : "text-[var(--text)]")
                  }
                >
                  {formatPrice(finalPrice)}
                </span>

                <span className="text-[10px] text-[var(--muted)]">تومان</span>
              </div>
            </div>

            {/* =================================================
                MOBILE BUY BUTTON
                همیشه سفید
            ================================================== */}

            <Link
              href={`/products/${activeProduct.id}`}
              className="
                inline-flex
                shrink-0
                items-center
                gap-1.5
                rounded-xl
                bg-[var(--primary)]
                px-3.5
                py-2.5
                text-[11px]
                font-black
                !text-white
                shadow-md
                shadow-primary-500/15
                transition-all
                duration-300
                hover:bg-[var(--primary-2)]
                hover:!text-white
                focus:!text-white
                active:scale-95
              "
            >
              <ShoppingCart
                className="
                  h-3.5
                  w-3.5
                  !text-white
                "
              />

              <span className="!text-white">خرید محصول</span>
            </Link>
          </div>
        </div>

        {/* =================================================
            MOBILE CONTROLS
        ================================================== */}

        <div className="mt-5 flex items-center justify-between gap-3">
          {/* Dots */}

          <div className="flex items-center gap-1.5">
            {sliderProducts.map((product, index) => (
              <button
                key={product.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`رفتن به اسلاید ${index + 1}`}
                className={
                  "h-1.5 rounded-full transition-all duration-500 " +
                  (index === activeIndex
                    ? "w-7 bg-[var(--primary)]"
                    : "w-1.5 bg-charcoal-500/20 dark:bg-white/20")
                }
              />
            ))}
          </div>

          {/* Arrows */}

          <div className="flex items-center gap-1.5">
            <SliderArrow direction="next" onClick={nextSlide} mobile />

            <SliderArrow direction="prev" onClick={previousSlide} mobile />
          </div>
        </div>

        {/* Progress */}

        <div
          className="
            mt-3
            h-[2px]
            w-full
            overflow-hidden
            rounded-full
            bg-charcoal-500/10
            dark:bg-white/[0.06]
          "
        >
          <div
            key={activeIndex}
            className="
              h-full
              rounded-full
              bg-[var(--primary)]
              transition-all
              duration-[5500ms]
              ease-linear
            "
            style={{
              width: isPaused ? "0%" : "100%",
            }}
          />
        </div>
      </div>
    </section>
  );
}
