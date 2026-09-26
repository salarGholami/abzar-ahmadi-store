import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  Home,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";

import ProductActions from "@/components/commerce/ProductActions";
import ProductGallery from "@/components/commerce/ProductGallery";
import ProductTabs from "@/components/commerce/ProductTabs";
import RatingStars from "@/components/commerce/RatingStars";
import ProductRow from "@/components/commerce/ProductRow";

import { getProduct, getProducts } from "@/lib/data";
import type { Product, ProductImage } from "@/lib/types";

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, products] = await Promise.all([
    getProduct(id),
    getProducts(),
  ]);

  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (!product) {
    return (
      <main dir="rtl" className="min-h-[70vh] bg-[var(--bg)] px-4 py-16">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[var(--surface)] shadow-lg">
            <PackageCheck size={28} className="text-[var(--muted)]" />
          </div>

          <h1 className="mt-5 text-2xl font-black">محصول پیدا نشد</h1>

          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            محصول موردنظر دیگر در فروشگاه موجود نیست یا آدرس آن تغییر کرده است.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[var(--primary)]/20 transition hover:-translate-y-0.5"
          >
            بازگشت به فروشگاه
            <ArrowLeft size={16} />
          </Link>
        </div>
      </main>
    );
  }

  const currentProduct: Product = product;

  /* =========================================================
     PRICE
  ========================================================= */

  const discount = currentProduct.discount;
  const price = currentProduct.price;

  const finalPrice =
    discount > 0 ? Math.round(price * (1 - discount / 100)) : price;

  const savedAmount = discount > 0 ? Math.max(0, price - finalPrice) : 0;

  /* =========================================================
     RELATED
  ========================================================= */

  const related: Product[] = products
    .filter(
      (item) =>
        item.category === currentProduct.category &&
        item.id !== currentProduct.id &&
        item.stock > 0,
    )
    .slice(0, 10);

  /* =========================================================
     IMAGES
  ========================================================= */

  const images: ProductImage[] =
    currentProduct.images && currentProduct.images.length > 0
      ? currentProduct.images
      : currentProduct.image
        ? [
            {
              id: `legacy-${currentProduct.id}`,
              url: currentProduct.image,
              alt: currentProduct.title,
              path: undefined,
              position: 0,
              createdAt: currentProduct.createdAt || new Date(0).toISOString(),
            },
          ]
        : [];

  const categoryHref = `/products?category=${encodeURIComponent(
    currentProduct.category,
  )}`;

  return (
    <main dir="rtl" className="min-h-screen overflow-hidden bg-[var(--bg)]">
      {/* =====================================================
          BREADCRUMB
      ====================================================== */}

      <div className="mx-auto max-w-[1280px] px-4 pt-4 sm:px-6 lg:px-8">
        <nav
          aria-label="مسیر صفحه"
          className="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-xs font-bold text-[var(--muted)]"
        >
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1.5 transition hover:text-[var(--primary)]"
          >
            <Home size={13} />
            خانه
          </Link>

          <ChevronLeft size={13} className="shrink-0" />

          <Link
            href="/products"
            className="shrink-0 transition hover:text-[var(--primary)]"
          >
            فروشگاه
          </Link>

          <ChevronLeft size={13} className="shrink-0" />

          <Link
            href={categoryHref}
            className="shrink-0 transition hover:text-[var(--primary)]"
          >
            {currentProduct.category}
          </Link>

          <ChevronLeft size={13} className="shrink-0" />

          <span className="max-w-[240px] truncate text-[var(--text)]">
            {currentProduct.title}
          </span>
        </nav>
      </div>

      {/* =====================================================
          PRODUCT
      ====================================================== */}

      <section className="mx-auto max-w-[1280px] px-4 pb-8 pt-6 sm:px-6 lg:px-8 lg:pt-7">
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_0.82fr] xl:gap-8">
          {/* =================================================
              GALLERY
          ================================================== */}

          <div className="min-w-0">
            <div className="mx-auto max-w-[560px] lg:max-w-none">
              <ProductGallery title={currentProduct.title} images={images} />
            </div>
          </div>

          {/* =================================================
              INFO
          ================================================== */}

          <div className="min-w-0">
            <div className="relative overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_12px_45px_rgba(0,0,0,0.045)] sm:p-6">
              {/* Glow */}

              <div className="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full bg-[var(--primary)]/[0.06] blur-3xl" />

              <div className="relative">
                {/* BRAND / SKU */}

                <div className="flex flex-wrap items-center gap-2.5">
                  {currentProduct.brand ? (
                    <span className="rounded-full bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-black text-[var(--primary)]">
                      {currentProduct.brand}
                    </span>
                  ) : null}

                  {currentProduct.sku ? (
                    <span className="text-xs font-bold text-[var(--muted)]">
                      کد کالا: {currentProduct.sku}
                    </span>
                  ) : null}
                </div>

                {/* TITLE */}

                <h1 className="mt-3.5 text-2xl font-black leading-[1.65] tracking-tight sm:text-[27px]">
                  {currentProduct.title}
                </h1>

                {/* RATING */}

                {currentProduct.rating !== undefined &&
                currentProduct.rating !== null ? (
                  <div className="mt-3">
                    <RatingStars
                      rating={currentProduct.rating}
                      reviewCount={currentProduct.reviewCount}
                      size={15}
                    />
                  </div>
                ) : null}

                {/* STATUS */}

                <div className="mt-4 flex flex-wrap gap-2">
                  {currentProduct.stock > 0 ? (
                    <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-600">
                      <CheckCircle2 size={15} />
                      موجود در انبار
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-black text-red-500">
                      <PackageCheck size={15} />
                      ناموجود
                    </span>
                  )}

                  <span className="inline-flex items-center gap-2 rounded-lg bg-[var(--surface-2)] px-3 py-2 text-xs font-black text-[var(--muted)]">
                    <ShieldCheck size={15} className="text-[var(--primary)]" />
                    ضمانت اصالت
                  </span>
                </div>

                {/* PRICE */}

                <div className="mt-4 rounded-[18px] bg-[var(--bg)] p-4.5 sm:p-5">
                  {discount > 0 ? (
                    <div className="mb-2 flex flex-wrap items-center gap-2.5">
                      <span className="rounded-md bg-red-500 px-2 py-1 text-xs font-black text-white">
                        {discount.toLocaleString("fa-IR")}٪ تخفیف
                      </span>

                      <span className="text-sm font-bold text-[var(--muted)] line-through">
                        {price.toLocaleString("fa-IR")}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex items-end justify-between gap-3">
                    <div className="flex items-baseline gap-2">
                      <strong className="text-[30px] font-black tracking-tight sm:text-[34px]">
                        {finalPrice.toLocaleString("fa-IR")}
                      </strong>

                      <span className="text-xs font-bold text-[var(--muted)]">
                        تومان
                      </span>
                    </div>

                    {discount > 0 && savedAmount > 0 ? (
                      <div className="text-left">
                        <div className="text-xs font-bold text-[var(--muted)]">
                          صرفه‌جویی
                        </div>

                        <div className="mt-1 text-xs font-black text-emerald-600">
                          {savedAmount.toLocaleString("fa-IR")} تومان
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="mt-5">
                  <ProductActions product={currentProduct} />
                </div>

                {/* BENEFITS */}

                <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-[17px] border border-[var(--border)]">
                  <div className="flex min-h-[70px] flex-col items-center justify-center gap-1.5 border-l border-[var(--border)] p-2.5 text-center">
                    <Truck size={18} className="text-[var(--primary)]" />

                    <span className="text-xs font-black">ارسال سریع</span>
                  </div>

                  <div className="flex min-h-[70px] flex-col items-center justify-center gap-1.5 border-l border-[var(--border)] p-2.5 text-center">
                    <ShieldCheck size={18} className="text-[var(--primary)]" />

                    <span className="text-xs font-black">اصالت کالا</span>
                  </div>

                  <div className="flex min-h-[70px] flex-col items-center justify-center gap-1.5 p-2.5 text-center">
                    <RotateCcw size={18} className="text-[var(--primary)]" />

                    <span className="text-xs font-black">پشتیبانی</span>
                  </div>
                </div>

                {/* QUICK SPECS */}

                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  <Link
                    href={categoryHref}
                    className="rounded-xl bg-[var(--bg)] p-3.5 transition hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <div className="text-xs font-bold text-[var(--muted)]">
                      دسته‌بندی
                    </div>

                    <div className="mt-1.5 truncate text-sm font-black">
                      {currentProduct.category}
                    </div>
                  </Link>

                  <div className="rounded-xl bg-[var(--bg)] p-3.5">
                    <div className="text-xs font-bold text-[var(--muted)]">
                      موجودی
                    </div>

                    <div className="mt-1.5 text-sm font-black">
                      {currentProduct.stock.toLocaleString("fa-IR")} عدد
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            TABS
        ====================================================== */}

        <div className="mt-7">
          <ProductTabs
            description={currentProduct.description}
            specs={currentProduct.specs}
          />
        </div>
      </section>

      {/* =====================================================
          RELATED PRODUCTS
      ====================================================== */}

      {related.length > 0 ? (
        <section className="border-t border-[var(--border)] bg-[var(--surface)]">
          <ProductRow
            title="محصولات مشابه"
            subtitle={`محصولات مرتبط با ${currentProduct.category}`}
            products={related}
            viewAllHref={categoryHref}
          />
        </section>
      ) : null}
    </main>
  );
}
