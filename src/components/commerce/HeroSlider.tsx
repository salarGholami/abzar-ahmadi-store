"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types";

function productImages(p: Product): string[] {
  if (p.images && p.images.length > 0) return p.images.filter(Boolean);
  return p.image ? [p.image] : [];
}

export default function HeroSlider({ products }: { products: Product[] }) {
  const [index, setIndex] = useState(0);
  const items = products.slice(0, 8);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 4500);
    return () => clearInterval(t);
  }, [items.length]);

  if (!items.length) return null;

  const p = items[index];
  const img = productImages(p)[0] || p.image;
  const final = Math.round(p.price * (1 - p.discount / 100));

  return (
    <section className="mx-auto max-w-[1500px] px-4 pt-5 lg:px-6">
      <div className="relative overflow-hidden rounded-[32px] bg-[#0b1020] text-white">
        <div className="absolute -left-20 -top-28 size-96 rounded-full bg-indigo-600/25 blur-3xl" />
        <div className="absolute -bottom-40 right-20 size-80 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 grid min-h-[320px] items-center gap-6 px-7 py-10 md:grid-cols-2 md:px-12 md:py-14">
          <div>
            <span className="badge bg-white/10 text-indigo-200">محصولات منتخب</span>
            <h1 className="mt-4 text-3xl font-black leading-[1.2] md:text-5xl line-clamp-2">{p.title}</h1>
            <p className="mt-3 text-sm text-slate-300">
              {p.brand} · {p.category}
              {p.discount > 0 && (
                <span className="mr-2 rounded bg-red-500/90 px-2 py-0.5 text-xs">٪{p.discount} تخفیف</span>
              )}
            </p>
            <div className="mt-5 text-2xl font-black">
              {final.toLocaleString("fa-IR")} <span className="text-sm font-normal">تومان</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/products/${p.id}`} className="btn btn-primary px-6">
                مشاهده محصول
              </Link>
              <Link href="/products" className="btn border border-white/15 bg-white/10 px-6 text-white hover:bg-white/15">
                همه محصولات
              </Link>
            </div>
          </div>

          <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl bg-white/5">
            {img && (
              <Image src={img} alt={p.title} fill unoptimized className="object-cover" />
            )}
          </div>
        </div>

        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2 hover:bg-white/20 md:right-5"
              aria-label="قبلی"
            >
              <ChevronRight size={20} />
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % items.length)}
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2 hover:bg-white/20 md:left-5"
              aria-label="بعدی"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
                  aria-label={`اسلاید ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
