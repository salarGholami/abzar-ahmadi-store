import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpLeft,
  BadgePercent,
  Boxes,
  ChevronLeft,
  Flame,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tags,
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
  /* =========================================================
     DATA
  ========================================================= */

  const [products, categoryFile, bestsellers] = await Promise.all([
    getProducts(),
    getJson<Category[]>("categories.json", []),
    getBestsellers(8),
  ]);

  /* =========================================================
     CATEGORIES
  ========================================================= */

  const categories = categoryFile.data.filter(
    (category) => category.active !== false,
  );

  /* =========================================================
     PRODUCTS
  ========================================================= */

  const inStock = products.filter((product) => product.stock > 0);

  const heroProducts = inStock.slice(0, 6);

  const discounted = inStock
    .filter((product) => product.discount >= 15)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 8);

  const newest = products
    .slice()
    .sort((a, b) =>
      String(b.createdAt || "").localeCompare(String(a.createdAt || "")),
    )
    .slice(0, 8);

  /* =========================================================
     CATEGORY PRODUCT ROWS
  ========================================================= */

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

  /* =========================================================
     CATEGORY COUNTS
  ========================================================= */

  const categoryCounts = new Map(
    categories.map((category) => [
      category.name,
      products.filter((product) => product.category === category.name).length,
    ]),
  );

  /* =========================================================
     BRANDS
  ========================================================= */

  const brands = topBrandsFromProducts(products, 10);

  return (
    <main className="w-full overflow-hidden bg-[var(--bg)]">
      {/* =====================================================
          TOP TRUST BAR
      ====================================================== */}

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

          <div className="hidden items-center gap-5 sm:flex">
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

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="mx-auto max-w-[1500px] px-4 pt-3 sm:px-6 sm:pt-5 lg:px-8">
        <div className="relative overflow-hidden rounded-[24px] sm:rounded-[30px] lg:rounded-[36px]">
          <ProductHeroSlider products={heroProducts} />
        </div>
      </section>

      {/* =====================================================
          QUICK CATEGORY STRIP
      ====================================================== */}

      <section className="mt-2 sm:mt-4">
        <CategoryStrip categories={categories} />
      </section>

      {/* =====================================================
          MOBILE QUICK ACTIONS
      ====================================================== */}

      <section className="mx-auto max-w-[1500px] px-4 pt-3 sm:hidden">
        <div className="grid grid-cols-3 gap-2">
          <Link
            href="/products"
            className="group flex min-h-[76px] flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 transition active:scale-[0.98]"
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
            className="group flex min-h-[76px] flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 transition active:scale-[0.98]"
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
            className="group flex min-h-[76px] flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 transition active:scale-[0.98]"
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

      {/* =====================================================
          FLASH SALE
      ====================================================== */}

      {discounted.length > 0 && (
        <section className="pt-5 sm:pt-8">
          <FlashSale products={discounted} />
        </section>
      )}

      {/* =====================================================
          BEST SELLERS — PREMIUM SECTION
      ====================================================== */}

      <section className="relative pt-8 sm:pt-12">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--primary)]/[0.035] to-transparent" />

        <div className="relative">
          <ProductRow
            title="پرفروش‌ترین‌های ابزار احمدی"
            subtitle="محصولاتی که بیشتر انتخاب شده‌اند"
            icon={Trophy}
            products={bestsellers}
            viewAllHref="/products"
          />
        </div>
      </section>

      {/* =====================================================
          CATEGORY SHOWCASE
      ====================================================== */}

      <section className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* Section heading */}

        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-8">
          <div className="min-w-0">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-[var(--primary)]/[0.09] text-[var(--primary)]">
                <Tags size={14} />
              </span>

              <span className="text-[9px] font-black tracking-[0.22em] text-[var(--primary)] sm:text-[10px]">
                SHOP BY CATEGORY
              </span>
            </div>

            <h2 className="text-[21px] font-black tracking-tight text-[var(--text)] sm:text-3xl">
              برای هر کاری، یک ابزار
            </h2>

            <p className="mt-1.5 max-w-xl text-[10px] leading-5 text-[var(--muted)] sm:text-sm">
              دسته‌بندی مورد نظرت را انتخاب کن و مستقیم وارد محصولات شو.
            </p>
          </div>

          <Link
            href="/products"
            className="group hidden shrink-0 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-[10px] font-black text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:flex"
          >
            همه دسته‌بندی‌ها
            <ArrowLeft
              size={13}
              className="transition-transform group-hover:-translate-x-1"
            />
          </Link>
        </div>

        {/* Category cards */}

        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {categories.slice(0, 8).map((category, index) => {
            const count = categoryCounts.get(category.name) ?? 0;

            return (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="
                  group relative min-h-[205px] w-[80vw] shrink-0 snap-start
                  overflow-hidden rounded-[26px]
                  border border-[var(--border)]
                  bg-[var(--surface)]
                  p-4
                  transition-all duration-300
                  active:scale-[0.985]

                  sm:w-auto
                  sm:min-h-[220px]
                  sm:p-5

                  sm:hover:-translate-y-1.5
                  sm:hover:border-[var(--primary)]/30
                  sm:hover:shadow-[0_25px_60px_rgba(0,0,0,0.09)]
                "
              >
                {/* Giant number */}

                <span className="pointer-events-none absolute -bottom-8 -left-2 select-none text-[110px] font-black leading-none tracking-[-0.12em] text-[var(--text)]/[0.035] transition duration-500 group-hover:-translate-y-2 group-hover:text-[var(--primary)]/[0.075]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Glow */}

                <span className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-[var(--primary)]/[0.045] blur-3xl transition duration-500 group-hover:bg-[var(--primary)]/[0.11]" />

                {/* Top row */}

                <div className="relative z-10 flex items-start justify-between">
                  <span className="grid size-12 place-items-center rounded-[17px] bg-[var(--primary)]/[0.08] text-[var(--primary)] transition-all duration-300 group-hover:scale-105 group-hover:bg-[var(--primary)] group-hover:text-white">
                    <Tags size={21} strokeWidth={1.8} />
                  </span>

                  <span className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-[9px] font-black text-[var(--muted)]">
                    {count.toLocaleString("fa-IR")} محصول
                  </span>
                </div>

                {/* Content */}

                <div className="relative z-10 mt-7">
                  <h3 className="max-w-[85%] text-[15px] font-black leading-6 text-[var(--text)] transition-colors group-hover:text-[var(--primary)] sm:text-base">
                    {category.name}
                  </h3>

                  <p className="mt-1.5 max-w-[90%] line-clamp-2 text-[10px] leading-5 text-[var(--muted)] sm:text-xs">
                    {category.description || "مشاهده محصولات این دسته‌بندی"}
                  </p>
                </div>

                {/* Bottom CTA */}

                <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between sm:bottom-5 sm:left-5 sm:right-5">
                  <span className="text-[9px] font-black text-[var(--primary)] sm:text-[10px]">
                    مشاهده محصولات
                  </span>

                  <span className="grid size-8 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-all duration-300 group-hover:border-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white">
                    <ArrowLeft size={13} />
                  </span>
                </div>

                {/* Bottom accent */}

                <span className="absolute bottom-0 right-0 h-[3px] w-0 bg-[var(--primary)] transition-all duration-500 group-hover:w-full" />
              </Link>
            );
          })}
        </div>

        {/* Mobile all categories */}

        <Link
          href="/products"
          className="mt-3 flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[10px] font-black text-[var(--primary)] sm:hidden"
        >
          مشاهده همه دسته‌بندی‌ها
          <ArrowLeft size={13} />
        </Link>
      </section>

      {/* =====================================================
          CATEGORY PRODUCT ROWS
      ====================================================== */}

      {categoryRows.map((row) => (
        <section
          key={row.name}
          className="relative border-t border-[var(--border)] pt-2 sm:pt-5"
        >
          <ProductRow
            title={row.name}
            subtitle="منتخب‌های این دسته"
            icon={Flame}
            products={row.products}
            viewAllHref={`/products?category=${encodeURIComponent(row.name)}`}
          />
        </section>
      ))}

      {/* =====================================================
          MID PAGE PROMO
      ====================================================== */}

      <section className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)]">
          {/* Background grid */}

          <div
            className="
              pointer-events-none absolute inset-0 opacity-[0.035]
              [background-image:linear-gradient(var(--text)_1px,transparent_1px),linear-gradient(90deg,var(--text)_1px,transparent_1px)]
              [background-size:32px_32px]
            "
          />

          {/* Glow */}

          <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-[var(--primary)]/[0.09] blur-3xl" />

          <div className="relative flex flex-col gap-7 p-5 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-xl bg-[var(--primary)]/[0.1] text-[var(--primary)]">
                  <Search size={15} />
                </span>

                <span className="text-[9px] font-black tracking-[0.18em] text-[var(--primary)]">
                  FIND YOUR TOOL
                </span>
              </div>

              <h2 className="text-[20px] font-black leading-8 text-[var(--text)] sm:text-3xl sm:leading-[1.4]">
                دنبال ابزار خاصی هستی؟
              </h2>

              <p className="mt-2 max-w-xl text-[10px] leading-6 text-[var(--muted)] sm:text-sm">
                از بین محصولات ابزار احمدی، ابزار مناسب پروژه‌ات را پیدا کن.
              </p>
            </div>

            <Link
              href="/products"
              className="
                group inline-flex h-12 w-full shrink-0 items-center
                justify-center gap-2 rounded-2xl
                bg-[var(--primary)] px-6
                text-[11px] font-black !text-white
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

      {/* =====================================================
          NEW PRODUCTS
      ====================================================== */}

      <section className="relative border-t border-[var(--border)] pt-4 sm:pt-7">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-blue-500/[0.025] to-transparent" />

        <div className="relative">
          <ProductRow
            title="جدیدترین محصولات"
            subtitle="تازه‌واردهای فروشگاه"
            icon={Package}
            products={newest}
            viewAllHref="/products"
          />
        </div>
      </section>

      {/* =====================================================
          WHY AHMADI
      ====================================================== */}

      <section className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-6 text-center sm:mb-8">
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

          <h2 className="text-[20px] font-black text-[var(--text)] sm:text-2xl">
            چرا ابزار احمدی؟
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4 text-center sm:p-6">
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

          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4 text-center sm:p-6">
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

          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4 text-center sm:p-6">
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

          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4 text-center sm:p-6">
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

      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="mx-auto max-w-[1500px] px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8">
        <div className="relative overflow-hidden rounded-[30px] bg-[var(--dark,#222831)] px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
          {/* Decorative circles */}

          <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-[var(--primary)]/[0.16] blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 left-10 size-52 rounded-full bg-[var(--primary)]/[0.08] blur-3xl" />

          <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <ShoppingBag size={16} className="text-[var(--primary)]" />

                <span className="text-[9px] font-black tracking-[0.18em] text-[var(--primary)]">
                  AHMADI TOOLS
                </span>
              </div>

              <h2 className="max-w-2xl text-[21px] font-black leading-8 text-white sm:text-3xl sm:leading-[1.45]">
                آماده‌ای ابزار بعدی پروژه‌ات را پیدا کنی؟
              </h2>

              <p className="mt-2 max-w-xl text-[10px] leading-6 text-white/55 sm:text-sm">
                محصولات را ببین، مقایسه کن و ابزار مناسب کارت را انتخاب کن.
              </p>
            </div>

            <Link
              href="/products"
              className="
                group inline-flex h-12 shrink-0 items-center justify-center
                gap-2 rounded-2xl bg-[var(--primary)]
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

      {/* =====================================================
          BRANDS
      ====================================================== */}

      <section className="border-t border-[var(--border)] pb-8 pt-8 sm:pb-12 sm:pt-10">
        <BrandStrip brands={brands} />
      </section>
    </main>
  );
}
