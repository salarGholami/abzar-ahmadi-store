import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  Headphones,
  CreditCard,
  Tags,
  Flame,
  Trophy,
} from "lucide-react";

import StoreHeader from "@/components/layout/StoreHeader";
import StoreFooter from "@/components/commerce/StoreFooter";
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

  const featuredCategoryNames = [
    "دریل و پیچ‌گوشتی",
    "لوازم ایمنی",
    "جوشکاری",
  ].filter((name) => categories.some((category) => category.name === name));

  const categoryRows = featuredCategoryNames.map((name) => ({
    name,
    products: products
      .filter((product) => product.category === name && product.stock > 0)
      .slice(0, 8),
  }));

  const brands = topBrandsFromProducts(products, 10);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* Header */}
      <StoreHeader />

      {/* Main content */}
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-[1500px] px-4 pt-5 lg:px-6">
          <ProductHeroSlider products={heroProducts} />
        </section>

        {/* Categories */}
        <CategoryStrip categories={categories} />

        {/* Flash sale */}
        {discounted.length > 0 && <FlashSale products={discounted} />}

        {/* Best sellers */}
        <ProductRow
          title="پرفروش‌ترین‌های فروشگاه"
          subtitle="پرطرفدار"
          icon={Trophy}
          products={bestsellers}
          viewAllHref="/products"
        />

        {/* Categories catalog */}
        <section className="mx-auto max-w-[1500px] px-4 py-8 lg:px-6">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <div className="text-xs font-black text-[var(--primary)]">
                کاتالوگ
              </div>

              <h2 className="mt-1 text-2xl font-black text-[var(--text)]">
                دسته‌بندی محصولات
              </h2>

              <p className="mt-2 text-sm text-[var(--muted)]">
                دسته‌ها مستقیماً از داشبورد مدیریت می‌شوند.
              </p>
            </div>

            <Link
              href="/products"
              className="hidden shrink-0 items-center gap-1 text-sm font-black text-[var(--primary)] sm:flex"
            >
              همه محصولات
              <ArrowLeft size={15} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 8).map((category, index) => {
              const count = products.filter(
                (product) => product.category === category.name,
              ).length;

              return (
                <Link
                  href={`/products?category=${encodeURIComponent(
                    category.name,
                  )}`}
                  key={category.id}
                  className="card group p-5 transition duration-200 hover:-translate-y-1 hover:border-[var(--primary)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="grid size-12 place-items-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                      <Tags size={20} />
                    </div>

                    <span className="text-xs font-black text-[var(--muted)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-5 font-black text-[var(--text)]">
                    {category.name}
                  </h3>

                  <p className="mt-2 min-h-10 text-xs leading-5 text-[var(--muted)]">
                    {category.description || "مشاهده محصولات این دسته‌بندی"}
                  </p>

                  <div className="mt-5 flex items-center justify-between text-xs font-black text-[var(--primary)]">
                    <span>{count.toLocaleString("fa-IR")} محصول</span>

                    <ArrowLeft
                      size={15}
                      className="transition group-hover:-translate-x-1"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Category product rows */}
        {categoryRows.map((row) => (
          <ProductRow
            key={row.name}
            title={row.name}
            subtitle="پیشنهاد دسته‌بندی"
            icon={Flame}
            products={row.products}
            viewAllHref={`/products?category=${encodeURIComponent(row.name)}`}
          />
        ))}

        {/* New products */}
        <ProductRow
          title="جدیدترین محصولات"
          subtitle="تازه‌های فروشگاه"
          products={newest}
          viewAllHref="/products"
        />

        {/* Brands */}
        <BrandStrip brands={brands} />

        {/* Features */}
        <section className="mx-auto grid max-w-[1500px] gap-4 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
          {[
            {
              title: "ارسال سریع",
              description: "تحویل سریع سفارش‌ها",
              icon: Truck,
            },
            {
              title: "ضمانت اصالت",
              description: "کالای معتبر و اصل",
              icon: ShieldCheck,
            },
            {
              title: "مشاوره تخصصی",
              description: "قبل از خرید راهنمایی بگیرید",
              icon: Headphones,
            },
            {
              title: "پرداخت امن",
              description: "فرآیند پرداخت مطمئن",
              icon: CreditCard,
            },
          ].map(({ title, description, icon: FeatureIcon }) => (
            <div className="card flex gap-4 p-5" key={title}>
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--surface-2)] text-[var(--primary)]">
                <FeatureIcon size={21} />
              </div>

              <div>
                <div className="font-black text-[var(--text)]">{title}</div>

                <div className="mt-1 text-xs text-[var(--muted)]">
                  {description}
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Mobile footer */}
      <StoreFooter />
    </div>
  );
}
