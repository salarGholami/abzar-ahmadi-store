"use client";

import { useRef, useState } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  if (!categories.length) return null;

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const onMouseLeave = () => setIsDragging(false);
  const onMouseUp = () => setIsDragging(false);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // سرعت درگ
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section className="mx-auto max-w-[1500px] px-4 pt-8 lg:px-6">
      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        className="scrollbar-none -mx-4 flex cursor-grab gap-3 overflow-x-auto px-4 pb-1 active:cursor-grabbing sm:mx-0 sm:px-0"
      >
        {categories.map((category) => {
          const Icon = ICON_BY_CATEGORY_ID[category.id] || Tags;
          return (
            <Link
              key={category.id}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              draggable={false}
              className="group flex w-[104px] shrink-0 flex-col items-center gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center transition hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-lg"
              onClick={(e) => {
                // جلوگیری از کلیک وقتی درگ می‌کنیم
                if (isDragging) e.preventDefault();
              }}
            >
              <div className="grid size-11 place-items-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] transition group-hover:bg-[var(--primary)] group-hover:text-white">
                <Icon size={20} />
              </div>
              <span className="text-[11px] font-black leading-4">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
