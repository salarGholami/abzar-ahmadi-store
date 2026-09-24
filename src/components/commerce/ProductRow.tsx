import Link from "next/link";
import { ArrowLeft, ChevronLeft, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Product } from "@/lib/types";
import ProductHorizontalScroller from "./ProductHorizontalScroller";
interface ProductRowProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  products: Product[];
  viewAllHref?: string;
  accent?: "default" | "danger";
}
export default function ProductRow({
  title,
  subtitle,
  icon: Icon,
  products,
  viewAllHref,
  accent = "default",
}: ProductRowProps) {
  if (!products.length) return null;
  const isDanger = accent === "danger";
  const accentText = isDanger ? "text-red-500" : "text-[var(--primary)]";
  const accentBg = isDanger ? "bg-red-500" : "bg-[var(--primary)]";
  const accentSoft = isDanger ? "bg-red-500/10" : "bg-[var(--primary)]/10";
  return (
    <section className="w-full py-7 sm:py-10 lg:py-14">
      {" "}
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        {" "}
        {/* HEADER */}{" "}
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
          {" "}
          <div className="min-w-0">
            {" "}
            <div className="flex items-center gap-2.5">
              {" "}
              <div
                className={` relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-[12px] ${accentSoft} ${accentText} sm:size-10 sm:rounded-[14px] `}
              >
                {" "}
                <span
                  className={` absolute inset-0 ${accentBg} opacity-[0.06] `}
                />{" "}
                {Icon ? (
                  <Icon size={17} strokeWidth={2.3} className="relative z-10" />
                ) : (
                  <Sparkles
                    size={17}
                    strokeWidth={2.3}
                    className="relative z-10"
                  />
                )}{" "}
              </div>{" "}
              <div className="min-w-0">
                {" "}
                {subtitle && (
                  <div
                    className={` mb-0.5 flex items-center gap-1.5 text-[9px] font-black ${accentText} sm:text-[10px] `}
                  >
                    {" "}
                    <span
                      className={` size-1.5 shrink-0 rounded-full ${accentBg} `}
                    />{" "}
                    <span className="truncate"> {subtitle} </span>{" "}
                  </div>
                )}{" "}
                <h2 className=" truncate text-[18px] font-black leading-tight tracking-tight text-[var(--text)] sm:text-[21px] lg:text-[24px] ">
                  {" "}
                  {title}{" "}
                </h2>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className=" group flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[9px] font-black text-[var(--primary)] shadow-sm transition-all hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/[0.04] active:scale-95 sm:px-4 sm:py-2.5 sm:text-[10px] "
            >
              {" "}
              <span>مشاهده همه</span>{" "}
              <ArrowLeft
                size={13}
                strokeWidth={2.5}
                className=" transition-transform duration-200 group-hover:-translate-x-1 "
              />{" "}
            </Link>
          )}{" "}
        </div>{" "}
        {/* PRODUCTS */}{" "}
        <div className=" overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-2.5 shadow-[0_8px_35px_rgba(0,0,0,0.035)] sm:rounded-[28px] sm:p-3 lg:p-4 ">
          {" "}
          <ProductHorizontalScroller products={products} /> {/* FOOTER */}{" "}
          {products.length > 1 && (
            <div className=" mt-2.5 flex items-center justify-between border-t border-[var(--border)] px-1 pt-2.5 ">
              {" "}
              <div className="flex items-center gap-2">
                {" "}
                <div className="flex items-center gap-1">
                  {" "}
                  <span className=" size-1.5 rounded-full bg-[var(--primary)] " />{" "}
                  <span className=" size-1 rounded-full bg-[var(--primary)]/30 " />{" "}
                  <span className=" size-1 rounded-full bg-[var(--primary)]/15 " />{" "}
                </div>{" "}
                <span className=" text-[8px] font-bold text-[var(--muted)] sm:text-[9px] ">
                  {" "}
                  برای دیدن محصولات بیشتر بکشید{" "}
                </span>{" "}
              </div>{" "}
              <div className=" flex items-center gap-0.5 text-[8px] font-black text-[var(--primary)] sm:text-[9px] ">
                {" "}
                <span>بیشتر</span>{" "}
                <ChevronLeft size={11} strokeWidth={2.5} />{" "}
              </div>{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </section>
  );
}
