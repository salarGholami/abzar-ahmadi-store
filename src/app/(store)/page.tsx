import Link from "next/link";
import {
  ArrowLeft,
  BadgePercent,
  Boxes,
  Flame,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";

import ProductHeroSlider from "@/components/commerce/ProductHeroSlider";
import CategoryStrip from "@/components/commerce/CategoryStrip";
import FlashSale from "@/components/commerce/FlashSale";
import ProductRow from "@/components/commerce/ProductRow";
import BrandStrip, {
  topBrandsFromProducts,
} from "@/components/commerce/BrandStrip";

import { getBestsellers, getProducts } from "@/lib/data";
import { getJson } from "@/lib/github";
import type { Category } from "@/lib/types";

export default async function Home() {
  const [products, categoryFile, bestsellers] = await Promise.all([
    getProducts(),
    getJson<Category[]>("categories.json", []),
    getBestsellers(8),
  ]);

  const categories = categoryFile.data.filter(
    (category) => category.active !== false,
  );

  const inStock = products.filter((product) => product.stock > 0);

  /*
   * ============================================================
   * HERO
   * ============================================================
   *
   * این بخش عمداً دست‌نخورده باقی می‌ماند.
   * ProductHeroSlider خودش نهایتاً ۶ محصول می‌گیرد،
   * اما اینجا فقط ۳ محصول شاخص به آن می‌دهیم.
   */
  const heroProducts = [
    ...inStock
      .filter((product) => product.discount >= 15)
      .sort((a, b) => b.discount - a.discount),

    ...inStock.filter((product) => product.discount < 15),
  ]
    .filter(
      (product, index, array) =>
        array.findIndex((item) => item.id === product.id) === index,
    )
    .slice(0, 3);

  /*
   * ============================================================
   * FLASH SALE
   * ============================================================
   */
  const discounted = inStock
    .filter((product) => product.discount >= 15)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 8);

  /*
   * ============================================================
   * NEW PRODUCTS
   * ============================================================
   */
  const newest = products
    .slice()
    .sort((a, b) =>
      String(b.createdAt || "").localeCompare(String(a.createdAt || "")),
    )
    .slice(0, 8);

  /*
   * ============================================================
   * CATEGORY PRODUCTS
   * ============================================================
   */
  const featuredCategoryNames = [
    "دریل و پیچ‌گوشتی",
    "لوازم ایمنی",
    "جوشکاری",
  ].filter((name) => categories.some((category) => category.name === name));

  const categoryRows = featuredCategoryNames
    .map((name) => ({
      name,
      products: products
        .filter((product) => product.category === name && product.stock > 0)
        .slice(0, 8),
    }))
    .filter((row) => row.products.length > 0);

  /*
   * ============================================================
   * BRANDS
   * ============================================================
   */
  const brands = topBrandsFromProducts(products, 10);

  return (
    <main dir="rtl" className="w-full overflow-hidden bg-[var(--bg)]">
      {/* ========================================================
          TRUST BAR
      ======================================================== */}
      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[var(--primary)]/[0.09] text-[var(--primary)]">
              <ShieldCheck size={15} />
            </span>

            <p className="truncate text-[10px] font-bold text-[var(--text)] sm:text-xs">
              خرید مطمئن ابزار حرفه‌ای
            </p>
          </div>

          <div className="hidden items-center gap-6 sm:flex">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--muted)]">
              <Boxes size={14} />
              تنوع بالای محصولات
            </span>

            <span className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--muted)]">
              <BadgePercent size={14} />
              قیمت رقابتی
            </span>

            <span className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--muted)]">
              <Zap size={14} />
              ارسال سریع
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================
          HERO — بدون تغییر
      ======================================================== */}
      <section className="mx-auto max-w-[1500px] px-4 pt-3 sm:px-6 sm:pt-5 lg:px-8">
        <div className="relative overflow-hidden rounded-[24px] sm:rounded-[30px] lg:rounded-[36px]">
          <ProductHeroSlider products={heroProducts} />
        </div>
      </section>

      {/* ========================================================
          CATEGORY STRIP
      ======================================================== */}
      <section className="mt-3 sm:mt-5">
        <CategoryStrip categories={categories} />
      </section>

      {/* ========================================================
          MOBILE QUICK ACTIONS
      ======================================================== */}
      <section className="mx-auto max-w-[1500px] px-4 pt-4 sm:hidden">
        <div className="grid grid-cols-3 gap-2.5">
          <Link
            href="/products"
            className="
              group flex min-h-[82px] flex-col justify-between
              rounded-2xl border border-[var(--border)]
              bg-[var(--surface)] p-3
              transition active:scale-[0.98]
            "
          >
            <span className="grid size-8 place-items-center rounded-xl bg-[var(--primary)]/[0.09] text-[var(--primary)]">
              <ShoppingBag size={16} />
            </span>

            <span className="text-[9px] font-black text-[var(--text)]">
              همه محصولات
            </span>
          </Link>

          <Link
            href="/products?sort=discount"
            className="
              group flex min-h-[82px] flex-col justify-between
              rounded-2xl border border-[var(--border)]
              bg-[var(--surface)] p-3
              transition active:scale-[0.98]
            "
          >
            <span className="grid size-8 place-items-center rounded-xl bg-orange-500/[0.09] text-orange-500">
              <BadgePercent size={16} />
            </span>

            <span className="text-[9px] font-black text-[var(--text)]">
              تخفیف‌ها
            </span>
          </Link>

          <Link
            href="/products?sort=newest"
            className="
              group flex min-h-[82px] flex-col justify-between
              rounded-2xl border border-[var(--border)]
              bg-[var(--surface)] p-3
              transition active:scale-[0.98]
            "
          >
            <span className="grid size-8 place-items-center rounded-xl bg-blue-500/[0.09] text-blue-500">
              <Sparkles size={16} />
            </span>

            <span className="text-[9px] font-black text-[var(--text)]">
              جدیدترین‌ها
            </span>
          </Link>
        </div>
      </section>

      {/* ========================================================
          FLASH SALE
      ======================================================== */}
      {discounted.length > 0 && (
        <section className="pt-6 sm:pt-9">
          <FlashSale products={discounted} />
        </section>
      )}

      {/* ========================================================
          BRANDS
      ======================================================== */}
      {brands.length > 0 && (
        <section className="mt-2 border-y border-[var(--border)] py-8 sm:py-10">
          <BrandStrip brands={brands} />
        </section>
      )}

      {/* ========================================================
          BEST SELLERS
      ======================================================== */}
      {bestsellers.length > 0 && (
        <section className="relative pt-8 sm:pt-11">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[var(--primary)]/[0.035] to-transparent" />

          <div className="relative">
            <ProductRow
              title="پرفروش‌ترین‌ها"
              subtitle="انتخاب‌های محبوب مشتری‌ها"
              // icon={Trophy}
              products={bestsellers}
              viewAllHref="/products"
            />
          </div>
        </section>
      )}

      {/* ========================================================
          DISCOVERY SECTION
      ======================================================== */}
      <section className="mx-auto max-w-[1500px] px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
        <div className="relative overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)]">
          {/* Grid */}
          <div
            className="
              pointer-events-none absolute inset-0 opacity-[0.035]
              [background-image:linear-gradient(var(--text)_1px,transparent_1px),linear-gradient(90deg,var(--text)_1px,transparent_1px)]
              [background-size:32px_32px]
            "
          />

          {/* Glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-[var(--primary)]/[0.08] blur-3xl" />

          <div className="relative flex flex-col gap-6 p-5 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-xl bg-[var(--primary)]/[0.1] text-[var(--primary)]">
                  <Search size={15} />
                </span>

                <span className="text-[9px] font-black tracking-[0.18em] text-[var(--primary)]">
                  FIND YOUR TOOL
                </span>
              </div>

              <h2 className="text-[21px] font-black leading-8 text-[var(--text)] sm:text-3xl sm:leading-[1.4]">
                ابزار مناسب پروژه‌ات رو پیدا کن
              </h2>

              <p className="mt-2 max-w-xl text-[10px] leading-6 text-[var(--muted)] sm:text-sm">
                بین محصولات ابزار احمدی جستجو کن و ابزار مناسب کارت را سریع‌تر
                پیدا کن.
              </p>
            </div>

            <Link
              href="/products"
              className="
                group inline-flex h-12 w-full shrink-0
                items-center justify-center gap-2
                rounded-2xl bg-[var(--primary)]
                px-6 text-[11px] font-black !text-white
                shadow-[0_12px_35px_rgba(0,173,181,0.22)]
                transition-all duration-300
                active:scale-[0.98]
                sm:h-13 sm:w-auto sm:px-7 sm:text-xs
                sm:hover:-translate-y-1
              "
            >
              <Search size={16} />
              جستجوی محصولات
              <ArrowLeft
                size={15}
                className="transition-transform group-hover:-translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          NEW PRODUCTS
      ======================================================== */}
      {newest.length > 0 && (
        <section className="relative border-t border-[var(--border)] pt-5 sm:pt-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-blue-500/[0.025] to-transparent" />

          <div className="relative">
            <ProductRow
              title="جدیدترین محصولات"
              subtitle="تازه‌واردهای فروشگاه"
              // icon={Package}
              products={newest}
              viewAllHref="/products"
            />
          </div>
        </section>
      )}

      {/* ========================================================
          WHY AHMADI
      ======================================================== */}
      <section className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-7 text-center sm:mb-9">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Star
              size={14}
              className="fill-[var(--primary)] text-[var(--primary)]"
            />

            <span className="text-[9px] font-black tracking-[0.2em] text-[var(--primary)]">
              WHY AHMADI
            </span>

            <Star
              size={14}
              className="fill-[var(--primary)] text-[var(--primary)]"
            />
          </div>

          <h2 className="text-[21px] font-black text-[var(--text)] sm:text-2xl">
            چرا ابزار احمدی؟
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-[10px] leading-6 text-[var(--muted)] sm:text-xs">
            تجربه خرید ابزار را ساده، سریع و حرفه‌ای طراحی کرده‌ایم.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* 1 */}
          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4 text-center transition-transform duration-300 hover:-translate-y-1 sm:p-6">
            <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-[var(--primary)]/[0.08] text-[var(--primary)]">
              <ShieldCheck size={20} />
            </span>

            <h3 className="mt-3 text-[11px] font-black text-[var(--text)] sm:text-xs">
              خرید مطمئن
            </h3>

            <p className="mt-1 text-[9px] leading-5 text-[var(--muted)] sm:text-[10px]">
              تجربه خرید ساده و مطمئن
            </p>
          </div>

          {/* 2 */}
          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4 text-center transition-transform duration-300 hover:-translate-y-1 sm:p-6">
            <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-orange-500/[0.08] text-orange-500">
              <BadgePercent size={20} />
            </span>

            <h3 className="mt-3 text-[11px] font-black text-[var(--text)] sm:text-xs">
              قیمت رقابتی
            </h3>

            <p className="mt-1 text-[9px] leading-5 text-[var(--muted)] sm:text-[10px]">
              انتخاب‌های متنوع با قیمت مناسب
            </p>
          </div>

          {/* 3 */}
          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4 text-center transition-transform duration-300 hover:-translate-y-1 sm:p-6">
            <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-blue-500/[0.08] text-blue-500">
              <Boxes size={20} />
            </span>

            <h3 className="mt-3 text-[11px] font-black text-[var(--text)] sm:text-xs">
              تنوع محصولات
            </h3>

            <p className="mt-1 text-[9px] leading-5 text-[var(--muted)] sm:text-[10px]">
              ابزار برای نیازهای مختلف
            </p>
          </div>

          {/* 4 */}
          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4 text-center transition-transform duration-300 hover:-translate-y-1 sm:p-6">
            <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-emerald-500/[0.08] text-emerald-500">
              <Zap size={20} />
            </span>

            <h3 className="mt-3 text-[11px] font-black text-[var(--text)] sm:text-xs">
              تجربه سریع
            </h3>

            <p className="mt-1 text-[9px] leading-5 text-[var(--muted)] sm:text-[10px]">
              پیدا کردن ابزار در کمترین زمان
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          FINAL CTA
      ======================================================== */}
      <section className="mx-auto max-w-[1500px] px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-[var(--dark,#222831)] px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
          <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-[var(--primary)]/[0.14] blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 left-10 size-52 rounded-full bg-[var(--primary)]/[0.07] blur-3xl" />

          <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <ShoppingBag size={16} className="text-[var(--primary)]" />

                <span className="text-[9px] font-black tracking-[0.18em] text-[var(--primary)]">
                  AHMADI TOOLS
                </span>
              </div>

              <h2 className="max-w-2xl text-[21px] font-black leading-8 text-white sm:text-3xl sm:leading-[1.45]">
                ابزار بعدی پروژه‌ات همین‌جاست.
              </h2>

              <p className="mt-2 max-w-xl text-[10px] leading-6 text-white/50 sm:text-sm">
                محصولات را ببین، مقایسه کن و ابزار مناسب کارت را انتخاب کن.
              </p>
            </div>

            <Link
              href="/products"
              className="
                group inline-flex h-12 shrink-0
                items-center justify-center gap-2
                rounded-2xl bg-[var(--primary)]
                px-6 text-[11px] font-black !text-white
                shadow-[0_12px_35px_rgba(0,173,181,0.25)]
                transition-all duration-300
                active:scale-[0.98]
                sm:h-13 sm:px-7 sm:text-xs
                sm:hover:-translate-y-1
              "
            >
              <ShoppingBag size={16} />
              ورود به فروشگاه
              <ArrowLeft
                size={15}
                className="transition-transform group-hover:-translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
