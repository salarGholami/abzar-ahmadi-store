"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";

export default function ProductHeroSlider({ products }: { products: Product[] }) {
  const slides = products.slice(0, 6);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => setIndex((v) => (v + 1) % slides.length), 5000);
    return () => window.clearInterval(id);
  }, [slides.length]);
  if (!slides.length) return null;
  const p = slides[index];
  const image = p.images?.[0]?.url || p.image;
  const final = Math.round(p.price * (1 - p.discount / 100));
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-[#0b1020] text-white">
      <div className="absolute -left-20 -top-28 size-96 rounded-full bg-indigo-600/25 blur-3xl" />
      <div className="absolute -bottom-40 right-20 size-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="relative z-10 grid min-h-[430px] items-center gap-8 px-7 py-10 md:px-12 lg:grid-cols-[1fr_0.9fr] lg:py-12">
        <div className="max-w-xl">
          <span className="badge bg-white/10 text-indigo-200"><Sparkles size={14} /> پیشنهاد ویژه امروز</span>
          <div className="mt-5 text-sm font-bold text-indigo-200">{p.brand} · {p.category}</div>
          <h1 className="mt-3 text-3xl font-black leading-tight md:text-5xl">{p.title}</h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">محصول منتخب آچارستان با قیمت به‌روز و موجودی واقعی.</p>
          <div className="mt-6 flex items-end gap-3"><strong className="text-2xl md:text-3xl">{final.toLocaleString("fa-IR")} تومان</strong>{p.discount > 0 && <span className="text-sm text-slate-400 line-through">{p.price.toLocaleString("fa-IR")}</span>}</div>
          <Link href={`/products/${p.id}`} className="btn btn-primary mt-7 px-6">مشاهده محصول <ArrowLeft size={18} /></Link>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-[460px] overflow-hidden rounded-3xl bg-white/5">
          <Image src={image || "/placeholder-product.svg"} alt={p.title} fill unoptimized priority className="object-cover transition duration-700" />
        </div>
      </div>
      {slides.length > 1 && <>
        <button type="button" onClick={() => setIndex((v) => (v - 1 + slides.length) % slides.length)} className="absolute right-4 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur" aria-label="اسلاید قبلی"><ChevronRight size={18} /></button>
        <button type="button" onClick={() => setIndex((v) => (v + 1) % slides.length)} className="absolute left-4 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur" aria-label="اسلاید بعدی"><ChevronLeft size={18} /></button>
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">{slides.map((s, i) => <button key={s.id} type="button" onClick={() => setIndex(i)} className={`h-1.5 rounded-full transition-all ${i === index ? "w-7 bg-white" : "w-1.5 bg-white/40"}`} aria-label={`اسلاید ${i + 1}`} />)}</div>
      </>}
    </section>
  );
}
