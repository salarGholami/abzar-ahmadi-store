"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, ArrowLeft } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types";

function endOfDay() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

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

    const id = window.setInterval(update, 1000);

    return () => window.clearInterval(id);
  }, [target]);

  // مهم:
  // روی سرور و اولین رندر کلاینت مقدار یکسان داریم
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

export default function FlashSale({ products }: { products: Product[] }) {
  const { hours, minutes, seconds } = useCountdown();

  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-8 lg:px-6">
      <div className="overflow-hidden rounded-[28px] bg-gradient-to-l from-red-600 via-red-500 to-orange-500 p-5 text-white sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/15">
              <Zap size={22} />
            </div>

            <div>
              <h2 className="text-xl font-black sm:text-2xl">
                تخفیف‌های ویژه امروز
              </h2>

              <p className="mt-1 text-xs font-bold text-white/80">
                فقط تا پایان امروز، موجودی محدود
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TimeBox value={hours} label="ساعت" />

            <span className="pb-4 font-black">:</span>

            <TimeBox value={minutes} label="دقیقه" />

            <span className="pb-4 font-black">:</span>

            <TimeBox value={seconds} label="ثانیه" />
          </div>

          <Link
            href="/products"
            className="hidden items-center gap-1 rounded-xl bg-white/15 px-4 py-2.5 text-xs font-black sm:flex"
          >
            مشاهده همه
            <ArrowLeft size={15} />
          </Link>
        </div>
      </div>

      <div className="scrollbar-none -mx-4 mt-5 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {products.map((product) => (
          <div key={product.id} className="w-[76vw] shrink-0 sm:w-auto">
            <ProductCard p={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 text-lg font-black tabular-nums backdrop-blur">
        {String(value).padStart(2, "0")}
      </div>

      <span className="mt-1 text-[10px] font-bold text-white/70">{label}</span>
    </div>
  );
}
