"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { ProductImage } from "@/lib/types";

export default function ProductGallery({
  title,
  images,
}: {
  title: string;
  images: ProductImage[];
}) {
  const safeImages =
    images.length > 0
      ? images
      : [
          {
            id: "fallback",
            url: "/placeholder-product.svg",
            alt: title,
            position: 0,
            createdAt: "",
          },
        ];

  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const current = safeImages[index];

  const next = () => {
    setIndex((value) => (value + 1) % safeImages.length);
  };

  const previous = () => {
    setIndex((value) => (value - 1 + safeImages.length) % safeImages.length);
  };

  useEffect(() => {
    if (!lightbox) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightbox(false);
      }

      if (event.key === "ArrowLeft") {
        next();
      }

      if (event.key === "ArrowRight") {
        previous();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox, safeImages.length]);

  return (
    <>
      <div className="grid gap-3 lg:grid-cols-[92px_1fr]">
        {/* thumbnails */}
        <div className="order-2 flex gap-2 overflow-x-auto lg:order-1 lg:flex-col">
          {safeImages.map((image, imageIndex) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setIndex(imageIndex)}
              className={[
                "relative size-[72px] shrink-0 overflow-hidden rounded-2xl border-2 bg-[var(--surface)] transition-all lg:size-[84px]",
                imageIndex === index
                  ? "border-[var(--primary)] shadow-[0_0_0_3px_rgba(0,173,181,0.08)]"
                  : "border-[var(--border)] opacity-70 hover:border-[var(--primary)]/40 hover:opacity-100",
              ].join(" ")}
            >
              <Image
                src={image.url}
                alt={image.alt || title}
                fill
                unoptimized
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {/* main image */}
        <div className="order-1 lg:order-2">
          <div className="group relative aspect-square overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_20px_70px_rgba(0,0,0,0.06)]">
            {/* top label */}
            <div className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-[9px] font-black text-white backdrop-blur-md">
              {`${(index + 1).toLocaleString("fa-IR")} / ${safeImages.length.toLocaleString("fa-IR")}`}
            </div>

            <Image
              src={current.url}
              alt={current.alt || title}
              fill
              priority
              unoptimized
              className="object-contain p-5 transition duration-700 group-hover:scale-[1.025] sm:p-8 lg:p-12"
            />

            {/* zoom */}
            <button
              type="button"
              onClick={() => setLightbox(true)}
              className="absolute bottom-4 left-4 grid size-11 place-items-center rounded-full border border-white/20 bg-black/55 text-white opacity-100 backdrop-blur-md transition hover:scale-105 hover:bg-black/75"
              aria-label="نمایش تصویر بزرگ"
            >
              <Maximize2 size={17} />
            </button>

            {/* arrows */}
            {safeImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={previous}
                  className="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/50 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100"
                  aria-label="تصویر قبلی"
                >
                  <ChevronRight size={19} />
                </button>

                <button
                  type="button"
                  onClick={next}
                  className="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/50 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100"
                  aria-label="تصویر بعدی"
                >
                  <ChevronLeft size={19} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute right-5 top-5 z-20 grid size-12 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="بستن"
          >
            <X size={21} />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              previous();
            }}
            className="absolute right-4 top-1/2 z-20 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
            aria-label="تصویر قبلی"
          >
            <ChevronRight />
          </button>

          <div
            className="relative h-[78vh] w-[88vw] max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={current.url}
              alt={current.alt || title}
              fill
              unoptimized
              className="object-contain"
            />
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              next();
            }}
            className="absolute left-4 top-1/2 z-20 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
            aria-label="تصویر بعدی"
          >
            <ChevronLeft />
          </button>
        </div>
      )}
    </>
  );
}
