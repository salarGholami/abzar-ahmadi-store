import Link from "next/link";
import { ArrowLeft, Award, Package } from "lucide-react";
import brands from "@/../data/brands.json";

export default function BrandsPage() {
  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-black text-[var(--primary)]">
            <Award size={15} /> برندهای فروشگاه
          </span>
          <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">برندهای ابزار احمدی</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
            محصولات را بر اساس برند مورد اعتماد خود پیدا کنید و مستقیماً وارد فهرست کالاهای همان برند شوید.
          </p>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/products?brand=${encodeURIComponent(brand.name)}`}
            className="group rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--primary)]/40 hover:shadow-lg"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--primary)]">
              <Package size={21} />
            </div>
            <h2 className="mt-5 text-base font-black text-[var(--text)]">{brand.name}</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">{brand.productsCount.toLocaleString("fa-IR")} محصول</p>
            <span className="mt-5 flex items-center gap-1 text-xs font-black text-[var(--primary)]">
              مشاهده محصولات <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
