"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, ArrowLeft, Clock3 } from "lucide-react";

import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types";

/* =========================================================
   پایان تخفیف روزانه
========================================================= */

function endOfDay() {
  const d = new Date();

  d.setHours(23, 59, 59, 999);

  return d;
}

/* =========================================================
   Countdown Hook
========================================================= */

function useCountdown() {
  const [target] = useState(() => endOfDay());

  const [remaining, setRemaining] = useState(0);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const update = () => {
      setRemaining(Math.max(0, target.getTime() - Date.now()));
    };

    update();

    const intervalId = window.setInterval(update, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [target]);

  if (!mounted) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const totalSeconds = Math.floor(remaining / 1000);

  return {
    hours: Math.floor(totalSeconds / 3600),

    minutes: Math.floor((totalSeconds % 3600) / 60),

    seconds: totalSeconds % 60,
  };
}

/* =========================================================
   Flash Sale
========================================================= */

export default function FlashSale({ products }: { products: Product[] }) {
  const { hours, minutes, seconds } = useCountdown();

  if (!products.length) {
    return null;
  }

  return (
    <section
      className="
        mx-auto
        w-full
        max-w-[1500px]
        px-4
        py-5
        sm:px-6
        lg:px-8
      "
    >
      <div
        className="
          relative
          overflow-hidden
          rounded-[24px]
          border
          border-[var(--border)]
          bg-[var(--surface)]
        "
      >
        {/* =================================================
            Background Decoration
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            size-64
            rounded-full
            bg-[var(--primary)]/[0.06]
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-32
            -left-20
            size-72
            rounded-full
            bg-[var(--primary)]/[0.035]
            blur-3xl
          "
        />

        <div
          className="
            relative
            z-10
            p-4
            sm:p-5
            lg:p-7
          "
        >
          {/* =================================================
              MOBILE
          ================================================= */}

          <div
            className="
              flex
              flex-col
              gap-4
              lg:hidden
            "
          >
            {/* =================================================
                MOBILE HEADER
            ================================================= */}

            <div
              className="
                flex
                items-start
                justify-between
                gap-2
              "
            >
              {/* عنوان */}

              <div
                className="
                  flex
                  min-w-0
                  flex-1
                  items-center
                  gap-3
                "
              >
                {/* آیکون */}

                <div
                  className="
                    grid
                    size-10
                    shrink-0
                    place-items-center
                    rounded-xl
                    bg-[var(--primary)]
                    text-white
                    shadow-md
                    shadow-[var(--primary)]/20
                  "
                >
                  <Zap size={19} fill="currentColor" strokeWidth={1.8} />
                </div>

                {/* متن */}

                <div className="min-w-0 flex-1">
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <span
                      className="
                        text-[9px]
                        font-black
                        tracking-[0.15em]
                        text-[var(--primary)]
                      "
                    >
                      پر تخفیف ها
                    </span>

                    <span
                      className="
                        rounded-full
                        bg-red-500/10
                        px-2
                        py-0.5
                        text-[8px]
                        font-black
                        text-red-500
                      "
                    >
                      محدود
                    </span>
                  </div>

                  {/* عنوان + دکمه دقیقاً هم‌سطح */}

                  <div
                    className="
                      mt-0.5
                      flex
                      min-w-0
                      items-center
                      justify-between
                      gap-2
                    "
                  >
                    <h2
                      className="
                        min-w-0
                        truncate
                        text-[16px]
                        font-black
                        leading-6
                        text-[var(--text)]
                        sm:text-lg
                      "
                    >
                      پیشنهادهای داغ امروز
                    </h2>

                    <Link
                      href="/products"
                      className="
                        flex
                        shrink-0
                        items-center
                        gap-1
                        rounded-xl
                        border
                        border-[var(--border)]
                        px-2
                        py-1.5
                        text-[8px]
                        font-black
                        leading-none
                        text-[var(--text)]
                        transition

                        hover:border-[var(--primary)]/40
                        hover:text-[var(--primary)]

                        sm:px-2.5
                        sm:py-2
                        sm:text-[9px]
                      "
                    >
                      <span className="whitespace-nowrap">همه تخفیف‌ها</span>

                      <ArrowLeft size={11} className="shrink-0" />
                    </Link>
                  </div>

                  <p
                    className="
                      mt-0.5
                      text-[10px]
                      text-[var(--muted)]
                    "
                  >
                    تخفیف ویژه محصولات منتخب
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                MOBILE TIMER
            ================================================= */}

            <MobileTimer hours={hours} minutes={minutes} seconds={seconds} />
          </div>

          {/* =================================================
              DESKTOP
          ================================================= */}

          <div
            className="
              hidden
              lg:block
            "
          >
            {/* =================================================
                DESKTOP TITLE
            ================================================= */}

            <div
              className="
                flex
                items-center
                justify-center
              "
            >
              <div className="text-center">
                <div
                  className="
                    mb-2
                    flex
                    items-center
                    justify-center
                    gap-2
                  "
                >
                  <div
                    className="
                      grid
                      size-9
                      place-items-center
                      rounded-xl
                      bg-[var(--primary)]/[0.10]
                      text-[var(--primary)]
                    "
                  >
                    <Zap size={17} fill="currentColor" strokeWidth={1.8} />
                  </div>

                  <span
                    className="
                      text-[10px]
                      font-black
                      tracking-[0.18em]
                      text-[var(--primary)]
                    "
                  >
                    پر تخفیف‌ها
                  </span>

                  <span
                    className="
                      rounded-full
                      bg-red-500/10
                      px-2.5
                      py-1
                      text-[9px]
                      font-black
                      text-red-500
                    "
                  >
                    محدود
                  </span>
                </div>

                <h2
                  className="
                    text-2xl
                    font-black
                    tracking-tight
                    text-[var(--text)]
                    xl:text-[28px]
                  "
                >
                  پیشنهادهای داغ امروز
                </h2>

                <p
                  className="
                    mt-2
                    text-xs
                    font-medium
                    text-[var(--muted)]
                  "
                >
                  تخفیف ویژه محصولات منتخب ابزار احمدی
                </p>
              </div>
            </div>

            {/* =================================================
                DESKTOP TIMER
                LTR = ساعت ← دقیقه ← ثانیه
            ================================================= */}

            <div
              className="
                mt-7
                flex
                justify-center
              "
            >
              <div
                className="
                  inline-flex
                  items-center
                  gap-4
                  rounded-[22px]
                  border
                  border-[var(--border)]
                  bg-[var(--surface-2)]
                  px-6
                  py-4
                  shadow-sm
                "
              >
                <Clock3
                  size={21}
                  className="
                    shrink-0
                    text-[var(--primary)]
                  "
                />

                <div
                  dir="ltr"
                  className="
                    flex
                    items-center
                    justify-center
                    gap-3
                  "
                >
                  <LargeTimeBox value={hours} label="ساعت" />

                  <LargeSeparator />

                  <LargeTimeBox value={minutes} label="دقیقه" />

                  <LargeSeparator />

                  <LargeTimeBox value={seconds} label="ثانیه" highlight />
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              DIVIDER
          ================================================= */}

          <div
            className="
              my-5
              h-px
              bg-[var(--border)]
              lg:my-7
            "
          />

          {/* =================================================
              PRODUCTS
          ================================================= */}

          <div
            className="
              scrollbar-none
              -mx-1
              flex
              gap-3
              overflow-x-auto
              px-1
              pb-2

              sm:grid
              sm:grid-cols-3
              sm:gap-3
              sm:overflow-visible

              lg:grid-cols-4
              lg:gap-5
            "
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="
                  w-[205px]
                  min-w-[205px]
                  shrink-0

                  sm:w-auto
                  sm:min-w-0
                "
              >
                <ProductCard p={product} compact />
              </div>
            ))}
          </div>

          {/* =================================================
              DESKTOP BOTTOM BUTTON
          ================================================= */}

          <div
            className="
              mt-6
              hidden
              justify-center
              lg:flex
            "
          >
            <Link
              href="/products"
              className="
                group
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-[var(--border)]
                bg-[var(--surface-2)]
                px-7
                py-3
                text-xs
                font-black
                text-[var(--text)]
                transition-all
                duration-300

                hover:-translate-y-0.5
                hover:border-[var(--primary)]/50
                hover:bg-[var(--primary)]/[0.05]
                hover:text-[var(--primary)]
              "
            >
              مشاهده همه تخفیف‌ها
              <ArrowLeft
                size={15}
                className="
                  transition-transform
                  duration-300
                  group-hover:-translate-x-1
                "
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MOBILE TIMER
========================================================= */

function MobileTimer({
  hours,
  minutes,
  seconds,
}: {
  hours: number;
  minutes: number;
  seconds: number;
}) {
  return (
    <div
      className="
        flex
        w-full
        justify-center
      "
    >
      <div
        dir="ltr"
        className="
          inline-flex
          items-center
          justify-center
          rounded-xl
          border
          border-[var(--border)]
          bg-[var(--surface-2)]
          px-3
          py-2
        "
      >
        {/* 
          ترتیب عمداً LTR است:
          ساعت : دقیقه : ثانیه
        */}

        <div
          className="
            flex
            h-[52px]
            items-center
            justify-center
            gap-1
            sm:h-[58px]
            sm:gap-1.5
          "
        >
          <TimeBox value={hours} label="ساعت" />

          <Separator />

          <TimeBox value={minutes} label="دقیقه" />

          <Separator />

          <TimeBox value={seconds} label="ثانیه" highlight />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MOBILE TIME BOX
========================================================= */

function TimeBox({
  value,
  label,
  highlight = false,
}: {
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      dir="rtl"
      className="
        flex
        w-[38px]
        flex-col
        items-center
        justify-center

        sm:w-[42px]
      "
    >
      <div
        className={`
          grid
          size-8
          place-items-center
          rounded-lg
          text-[11px]
          font-black
          tabular-nums

          sm:size-9
          sm:text-xs

          ${
            highlight
              ? `
                bg-[var(--primary)]
                text-white
                shadow-sm
                shadow-[var(--primary)]/20
              `
              : `
                border
                border-[var(--border)]
                bg-[var(--surface)]
                text-[var(--text)]
              `
          }
        `}
      >
        {String(value).padStart(2, "0")}
      </div>

      <span
        className="
          mt-1
          whitespace-nowrap
          text-[7px]
          font-bold
          leading-none
          text-[var(--muted)]

          sm:text-[8px]
        "
      >
        {label}
      </span>
    </div>
  );
}

/* =========================================================
   MOBILE SEPARATOR
========================================================= */

function Separator() {
  return (
    <span
      className="
        flex
        h-[52px]
        w-3
        items-center
        justify-center
        pb-3
        text-sm
        font-black
        leading-none
        text-[var(--muted)]

        sm:h-[58px]
        sm:w-4
        sm:text-base
      "
    >
      :
    </span>
  );
}

/* =========================================================
   DESKTOP LARGE TIME BOX
========================================================= */

function LargeTimeBox({
  value,
  label,
  highlight = false,
}: {
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      dir="rtl"
      className="
        flex
        w-[76px]
        flex-col
        items-center
      "
    >
      <div
        className={`
          grid
          h-[64px]
          w-[64px]
          place-items-center
          rounded-2xl
          text-2xl
          font-black
          tabular-nums

          xl:h-[70px]
          xl:w-[70px]
          xl:text-[26px]

          ${
            highlight
              ? `
                bg-[var(--primary)]
                text-white
                shadow-lg
                shadow-[var(--primary)]/20
              `
              : `
                border
                border-[var(--border)]
                bg-[var(--surface)]
                text-[var(--text)]
              `
          }
        `}
      >
        {String(value).padStart(2, "0")}
      </div>

      <span
        className="
          mt-2
          whitespace-nowrap
          text-[10px]
          font-bold
          leading-none
          text-[var(--muted)]
        "
      >
        {label}
      </span>
    </div>
  );
}

/* =========================================================
   DESKTOP LARGE SEPARATOR
========================================================= */

function LargeSeparator() {
  return (
    <span
      className="
        flex
        h-[64px]
        w-5
        items-center
        justify-center
        pb-5
        text-xl
        font-black
        leading-none
        text-[var(--muted)]

        xl:h-[70px]
      "
    >
      :
    </span>
  );
}
