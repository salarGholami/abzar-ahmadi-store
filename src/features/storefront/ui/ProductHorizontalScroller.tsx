"use client";

import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

interface ProductHorizontalScrollerProps {
  products: Product[];
}

export default function ProductHorizontalScroller({
  products,
}: ProductHorizontalScrollerProps) {
  return (
    <div className="w-full">
      <Swiper
        dir="rtl"
        modules={[FreeMode]}
        slidesPerView="auto"
        spaceBetween={10}
        freeMode={{
          enabled: true,
          momentum: true,
          momentumRatio: 0.8,
          momentumVelocityRatio: 0.8,
          sticky: false,
        }}
        grabCursor
        allowTouchMove
        watchSlidesProgress
        preventClicks
        preventClicksPropagation
        resistance
        resistanceRatio={0.65}
        className="!overflow-visible"
        breakpoints={{
          640: {
            spaceBetween: 16,
          },
          1024: {
            spaceBetween: 20,
          },
        }}
      >
        {products.map((product) => (
          <SwiperSlide
            key={product.id}
            className="
              !h-auto
              !w-[61vw]
              sm:!w-[280px]
              lg:!w-[300px]
              xl:!w-[320px]
            "
          >
            <ProductCard p={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
