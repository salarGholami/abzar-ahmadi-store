"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ProductImage } from "@/lib/types";

export default function ProductGallery({ title, images }: { title: string; images: ProductImage[] }) {
  const safeImages = images.length ? images : [{ id: "fallback", url: "/placeholder-product.svg", alt: title, position: 0, createdAt: "" }];
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowLeft") setIndex((v) => (v + 1) % safeImages.length);
      if (event.key === "ArrowRight") setIndex((v) => (v - 1 + safeImages.length) % safeImages.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, safeImages.length]);

  const current = safeImages[index];
  return (
    <div>
      <button type="button" onClick={() => setLightbox(true)} className="card relative block aspect-square w-full overflow-hidden bg-[var(--surface-2)]">
        <Image src={current.url} alt={current.alt || title} fill unoptimized className="object-cover transition duration-500 hover:scale-[1.02]" />
      </button>
      {safeImages.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {safeImages.map((image, itemIndex) => (
            <button key={image.id} type="button" onClick={() => setIndex(itemIndex)} className={`relative aspect-square overflow-hidden rounded-xl border-2 ${itemIndex === index ? "border-[var(--primary)]" : "border-transparent"}`}>
              <Image src={image.url} alt="" fill unoptimized className="object-cover" />
            </button>
          ))}
        </div>
      )}
      {lightbox && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/85 p-4" role="dialog" aria-modal="true" onClick={() => setLightbox(false)}>
          <button type="button" onClick={() => setLightbox(false)} className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-white/10 text-white" aria-label="بستن"><X /></button>
          <button type="button" onClick={(e) => { e.stopPropagation(); setIndex((v) => (v - 1 + safeImages.length) % safeImages.length); }} className="absolute right-4 grid size-11 place-items-center rounded-full bg-white/10 text-white" aria-label="تصویر قبلی"><ChevronRight /></button>
          <div className="relative h-[80vh] w-[80vw] max-w-5xl" onClick={(e) => e.stopPropagation()}><Image src={current.url} alt={current.alt || title} fill unoptimized className="object-contain" /></div>
          <button type="button" onClick={(e) => { e.stopPropagation(); setIndex((v) => (v + 1) % safeImages.length); }} className="absolute left-4 grid size-11 place-items-center rounded-full bg-white/10 text-white" aria-label="تصویر بعدی"><ChevronLeft /></button>
        </div>
      )}
    </div>
  );
}
