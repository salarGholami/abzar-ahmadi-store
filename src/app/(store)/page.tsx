import Link from "next/link";
import { ArrowLeft, ShieldCheck, Truck, Headphones, CreditCard, Sparkles, Tags } from "lucide-react";
import StoreHeader from "@/components/layout/StoreHeader";
import StoreFooter from "@/components/commerce/StoreFooter";
import ProductCard from "@/components/commerce/ProductCard";
import { getProducts } from "@/lib/data";
import { getJson } from "@/lib/github";
import type { Category } from "@/lib/types";

export default async function Home() {
  const [products, categoryFile] = await Promise.all([
    getProducts(),
    getJson<Category[]>("categories.json", [])
  ]);
  const categories = categoryFile.data.filter((category) => category.active !== false).slice(0, 8);

  return (
    <>
      <StoreHeader />
      <main>
        <section className="mx-auto max-w-[1500px] px-4 pt-5 lg:px-6">
          <div className="relative overflow-hidden rounded-[32px] bg-[#0b1020] px-7 py-12 text-white md:px-12 md:py-20">
            <div className="absolute -left-20 -top-28 size-96 rounded-full bg-indigo-600/25 blur-3xl" />
            <div className="absolute -bottom-40 right-20 size-80 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="relative z-10 max-w-2xl">
              <span className="badge bg-white/10 text-indigo-200"><Sparkles size={14} /> انتخاب حرفه‌ای‌ها</span>
              <h1 className="mt-5 text-4xl font-black leading-[1.18] md:text-6xl">ابزار درست،<br /><span className="text-indigo-300">پروژه بهتر.</span></h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 md:text-base">کاتالوگ حرفه‌ای ابزار ساختمانی و کارگاهی با دسته‌بندی، جستجو و فیلتر سریع برای انتخاب دقیق‌تر.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/products" className="btn btn-primary px-6">مشاهده محصولات <ArrowLeft size={18} /></Link>
                <Link href="/account" className="btn border border-white/15 bg-white/10 px-6 text-white hover:bg-white/15">حساب کاربری</Link>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 hidden text-[180px] font-black leading-none text-white/[.025] lg:block">TOOLS</div>
          </div>
        </section>

        <section className="mx-auto max-w-[1500px] px-4 py-14 lg:px-6">
          <div className="mb-7 flex items-end justify-between">
            <div><div className="text-xs font-black text-[var(--primary)]">کاتالوگ</div><h2 className="mt-1 text-2xl font-black">دسته‌بندی محصولات</h2><p className="mt-2 text-sm text-[var(--muted)]">دسته‌ها مستقیماً از داشبورد مدیریت می‌شوند.</p></div>
            <Link href="/products" className="text-sm font-black text-[var(--primary)]">همه محصولات ←</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => {
              const count = products.filter((product) => product.category === category.name).length;
              return <Link href={`/products?category=${encodeURIComponent(category.name)}`} key={category.id} className="card group p-5 hover:-translate-y-1 hover:border-[var(--primary)]">
                <div className="flex items-center justify-between"><div className="grid size-12 place-items-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]"><Tags size={20} /></div><span className="text-xs font-black text-[var(--muted)]">0{index + 1}</span></div>
                <h3 className="mt-5 font-black">{category.name}</h3>
                <p className="mt-2 min-h-10 text-xs leading-5 text-[var(--muted)]">{category.description || "مشاهده محصولات این دسته‌بندی"}</p>
                <div className="mt-5 flex items-center justify-between text-xs font-black text-[var(--primary)]"><span>{count} محصول</span><ArrowLeft size={15} className="transition group-hover:-translate-x-1" /></div>
              </Link>;
            })}
          </div>
        </section>

        <section className="mx-auto max-w-[1500px] px-4 py-8 lg:px-6">
          <div className="mb-7"><div className="text-xs font-black text-[var(--primary)]">منتخب فروشگاه</div><h2 className="mt-1 text-2xl font-black">محصولات پیشنهادی</h2></div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.slice(0, 8).map((product) => <ProductCard key={product.id} p={product} />)}</div>
        </section>

        <section className="mx-auto grid max-w-[1500px] gap-4 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
          {[
            ["ارسال سریع", "تحویل سریع سفارش‌ها", Truck],
            ["ضمانت اصالت", "کالای معتبر و اصل", ShieldCheck],
            ["مشاوره تخصصی", "قبل از خرید راهنمایی بگیرید", Headphones],
            ["پرداخت امن", "فرآیند پرداخت مطمئن", CreditCard]
          ].map(([title, description, Icon]) => {
            const FeatureIcon = Icon as typeof Truck;
            return <div className="card flex gap-4 p-5" key={String(title)}><div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--surface-2)] text-[var(--primary)]"><FeatureIcon size={21} /></div><div><div className="font-black">{String(title)}</div><div className="mt-1 text-xs text-[var(--muted)]">{String(description)}</div></div></div>;
          })}
        </section>
      </main>
      <StoreFooter />
    </>
  );
}
