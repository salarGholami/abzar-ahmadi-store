"use client";

import Link from "next/link";
import {
  Hammer,
  Ruler,
  Scissors,
  Warehouse,
  Flame,
  Drill,
  CircleDot,
  HardHat,
  Bolt,
  PaintBucket,
  Wrench,
  Zap,
  Milestone,
  Fuel,
  Tags,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import type { Category } from "@/lib/types";
import { useRef, useState } from "react";

const ICON_BY_CATEGORY_ID: Record<string, LucideIcon> = {
  "cat-1": Hammer,
  "cat-2": Ruler,
  "cat-3": Scissors,
  "cat-4": Warehouse,
  "cat-5": Flame,
  "cat-6": Drill,
  "cat-7": CircleDot,
  "cat-8": HardHat,
  "cat-9": Bolt,
  "cat-10": PaintBucket,
  "cat-11": Wrench,
  "cat-12": Zap,
  "cat-13": Milestone,
  "cat-14": Fuel,
};

export default function CategoryStrip({
  categories,
}: {
  categories: Category[];
}) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [initialScroll, setInitialScroll] = useState(0);
  const [moved, setMoved] = useState(false);

  if (!categories.length) return null;

  const startDragging = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;

    setIsDragging(true);
    setMoved(false);
    setStartX(e.pageX);
    setInitialScroll(sliderRef.current.scrollLeft);
  };

  const dragging = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !sliderRef.current) return;

    e.preventDefault();

    const distance = e.pageX - startX;

    if (Math.abs(distance) > 5) {
      setMoved(true);
    }

    sliderRef.current.scrollLeft = initialScroll - distance;
  };

  const stopDragging = () => {
    setIsDragging(false);

    setTimeout(() => {
      setMoved(false);
    }, 80);
  };

  return (
    <section className="mx-auto w-full max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--primary)] opacity-30" />
              <span className="relative inline-flex size-2 rounded-full bg-[var(--primary)]" />
            </span>

            <span className="text-[10px] font-black tracking-[0.16em] text-[var(--primary)]">
              دسته بندی ابزارها
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight text-[var(--text)] sm:text-2xl">
            برای هر کاری، یک ابزار
          </h2>

          <p className="mt-1.5 text-xs font-medium text-[var(--muted)] sm:text-sm">
            ابزار مناسب پروژه‌ات را سریع پیدا کن
          </p>
        </div>

        <Link
          href="/products"
          className="
            hidden
            rounded-xl
            border
            border-[var(--border)]
            bg-[var(--surface)]
            px-4
            py-2.5
            text-xs
            font-black
            text-[var(--text)]
            transition-all
            duration-300

            hover:border-[var(--primary)]/40
            hover:bg-[var(--primary)]/[0.05]
            hover:text-[var(--primary)]

            sm:block
          "
        >
          مشاهده همه
        </Link>
      </div>

      {/* Slider */}
      <div className="relative">
        <div
          ref={sliderRef}
          onMouseDown={startDragging}
          onMouseMove={dragging}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
          className={`
            scrollbar-none
            flex
            gap-4
            overflow-x-auto
            pb-3
            select-none
            ${isDragging ? "cursor-grabbing" : "cursor-grab"}
          `}
        >
          {categories.map((category, index) => {
            const Icon = ICON_BY_CATEGORY_ID[category.id] || Tags;

            return (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                draggable={false}
                onClick={(e) => {
                  if (moved) {
                    e.preventDefault();
                  }
                }}
                className="
                  group
                  relative
                  h-[168px]
                  w-[154px]
                  shrink-0
                  overflow-hidden
                  rounded-[26px]
                  border
                  border-[var(--border)]
                  bg-[var(--surface)]
                  p-4
                  transition-all
                  duration-400

                  hover:-translate-y-1.5
                  hover:border-[var(--primary)]/35
                  hover:shadow-[0_18px_45px_color-mix(in_srgb,var(--primary)_11%,transparent)]

                  sm:h-[178px]
                  sm:w-[166px]
                  sm:p-5
                "
              >
                {/* Background Glow */}
                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-8
                    -top-8
                    size-28
                    rounded-full
                    bg-[var(--primary)]/[0.045]
                    blur-2xl
                    transition-all
                    duration-500

                    group-hover:scale-150
                    group-hover:bg-[var(--primary)]/[0.10]
                  "
                />

                {/* Big number */}
                <span
                  className="
                    pointer-events-none
                    absolute
                    bottom-[-18px]
                    left-1
                    text-[82px]
                    font-black
                    leading-none
                    tracking-[-0.08em]
                    text-[var(--text)]/[0.035]
                    transition-all
                    duration-500

                    group-hover:text-[var(--primary)]/[0.08]
                    group-hover:-translate-y-1
                  "
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Icon */}
                <div className="relative z-10">
                  <div
                    className="
                      grid
                      size-14
                      place-items-center
                      rounded-full
                      border
                      border-[var(--border)]
                      bg-[var(--surface-2)]
                      text-[var(--primary)]
                      shadow-sm
                      transition-all
                      duration-400

                      group-hover:scale-110
                      group-hover:border-[var(--primary)]/30
                      group-hover:bg-[var(--primary)]
                      group-hover:text-white
                      group-hover:shadow-[0_10px_30px_color-mix(in_srgb,var(--primary)_25%,transparent)]
                    "
                  >
                    <Icon
                      size={25}
                      strokeWidth={1.7}
                      className="
                        transition-transform
                        duration-400
                        group-hover:rotate-[-8deg]
                      "
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10 mt-5">
                  <h3
                    className="
                      line-clamp-2
                      min-h-[40px]
                      text-[12px]
                      font-black
                      leading-5
                      text-[var(--text)]
                      transition-colors
                      duration-300

                      group-hover:text-[var(--primary)]
                    "
                  >
                    {category.name}
                  </h3>

                  <div className="mt-1 flex items-center gap-1">
                    <span
                      className="
                        text-[9px]
                        font-medium
                        text-[var(--muted)]
                      "
                    >
                      مشاهده محصولات
                    </span>

                    <span
                      className="
                        h-1
                        w-1
                        rounded-full
                        bg-[var(--primary)]
                        opacity-50
                      "
                    />
                  </div>
                </div>

                {/* Bottom Accent */}
                <span
                  className="
                    absolute
                    bottom-0
                    right-0
                    h-[3px]
                    w-0
                    rounded-l-full
                    bg-[var(--primary)]
                    transition-all
                    duration-500

                    group-hover:w-full
                  "
                />
              </Link>
            );
          })}
        </div>

        {/* Drag indicator */}
        <div
          className="
            pointer-events-none
            absolute
            left-2
            top-1/2
            hidden
            -translate-y-1/2
            items-center
            gap-1.5
            rounded-full
            border
            border-[var(--border)]
            bg-[var(--surface)]/90
            px-3
            py-1.5
            text-[9px]
            font-bold
            text-[var(--muted)]
            shadow-sm
            backdrop-blur
            lg:flex
          "
        >
          <span className="text-[11px]">↔</span>
          بکش
        </div>
      </div>

      {/* Mobile CTA */}
      <Link
        href="/products"
        className="
          mt-4
          flex
          items-center
          justify-center
          rounded-2xl
          border
          border-[var(--border)]
          bg-[var(--surface)]
          py-3
          text-xs
          font-black
          text-[var(--muted)]
          transition-all
          duration-300

          hover:border-[var(--primary)]
          hover:text-[var(--primary)]

          sm:hidden
        "
      >
        مشاهده همه دسته‌بندی‌ها
      </Link>
    </section>
  );
}
