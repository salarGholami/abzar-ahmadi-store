import Link from "next/link";
import { ArrowLeft, ShieldCheck, Truck, Headphones, CreditCard, Sparkles } from "lucide-react";
import StoreHeader from "@/components/layout/StoreHeader";
import StoreFooter from "@/components/commerce/StoreFooter";
import ProductCard from "@/components/commerce/ProductCard";
import { getProducts } from "@/lib/data";

export default async function Home(){
 const products=await getProducts();
 const cats=[["ابزار برقی","دریل، فرز، بتن‌کن و تجهیزات برقی"],["ابزار دستی","آچار، پیچ‌گوشتی، انبر و ست ابزار"],["اندازه‌گیری","متر، تراز، لیزر و تجهیزات دقیق"],["تجهیزات کارگاهی","کمپرسور، جوش و تجهیزات کارگاه"]];
 return <><StoreHeader/><main>
  <section className="mx-auto max-w-[1400px] px-4 pt-5 lg:px-6">
   <div className="relative overflow-hidden rounded-[28px] bg-[#0f172a] px-7 py-12 text-white md:px-12 md:py-20">
    <div className="relative z-10 max-w-2xl">
      <span className="badge bg-white/10 text-blue-200"><Sparkles size={14}/> انتخاب حرفه‌ای‌ها</span>
      <h1 className="mt-5 text-4xl font-black leading-[1.2] md:text-6xl">ابزار درست،<br/><span className="text-blue-400">پروژه بهتر.</span></h1>
      <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 md:text-base">تجهیزات ساختمانی و کارگاهی حرفه‌ای، انتخاب‌شده برای پروژه‌هایی که کیفیت در آن‌ها قابل مذاکره نیست.</p>
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/products" className="btn btn-primary px-6">مشاهده محصولات <ArrowLeft size={18}/></Link><Link href="/dashboard/pos" className="btn border border-white/15 bg-white/10 text-white px-6">فروش حضوری</Link></div>
    </div>
    <div className="absolute -left-24 -top-24 size-96 rounded-full bg-blue-600/20 blur-3xl"/>
    <div className="absolute bottom-0 left-0 hidden text-[180px] font-black leading-none text-white/[.025] lg:block">TOOLS</div>
   </div>
  </section>
  <section className="mx-auto max-w-[1400px] px-4 py-14 lg:px-6">
   <div className="mb-7 flex items-end justify-between"><div><div className="text-sm font-bold text-[var(--primary)]">دسته‌بندی‌ها</div><h2 className="mt-1 text-2xl font-black">برای هر پروژه، ابزار مناسب</h2></div><Link href="/products" className="text-sm font-bold text-[var(--primary)]">همه محصولات ←</Link></div>
   <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cats.map(([a,b],i)=><Link href="/products" key={a} className="card group p-5 hover:border-[var(--primary)]"><div className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-xl font-black text-blue-600 dark:bg-blue-950/40">{["01","02","03","04"][i]}</div><h3 className="mt-5 font-black">{a}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{b}</p><div className="mt-5 text-sm font-bold text-[var(--primary)]">مشاهده دسته ←</div></Link>)}</div>
  </section>
  <section className="mx-auto max-w-[1400px] px-4 py-8 lg:px-6">
   <div className="mb-7"><div className="text-sm font-bold text-[var(--primary)]">منتخب فروشگاه</div><h2 className="mt-1 text-2xl font-black">پرفروش‌های این هفته</h2></div>
   <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.slice(0,4).map(p=><ProductCard key={p.id} p={p}/>)}</div>
  </section>
  <section className="mx-auto grid max-w-[1400px] gap-4 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
   {[["ارسال سریع","تحویل سریع سفارش‌ها",Truck],["ضمانت اصالت","کالای معتبر و اصل",ShieldCheck],["مشاوره تخصصی","قبل از خرید راهنمایی بگیرید",Headphones],["پرداخت امن","فرآیند پرداخت مطمئن",CreditCard]].map(([t,s,I])=><div className="card flex gap-4 p-5" key={String(t)}><div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--surface-2)] text-[var(--primary)]"><I size={21}/></div><div><div className="font-black">{String(t)}</div><div className="mt-1 text-xs text-[var(--muted)]">{String(s)}</div></div></div>)}
  </section>
 </main><StoreFooter/></>
}
