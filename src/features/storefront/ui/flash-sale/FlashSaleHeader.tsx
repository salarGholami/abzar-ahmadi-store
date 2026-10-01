import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";

export default function FlashSaleHeader() {
  return (
    <>
      <div className="flex items-start justify-between gap-2 lg:hidden">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20"><Zap size={19} fill="currentColor" /></div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"><span className="text-[9px] font-black tracking-[0.15em] text-[var(--primary)]">پر تخفیف ها</span><span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[8px] font-black text-red-500">محدود</span></div>
            <div className="mt-0.5 flex items-center justify-between gap-2">
              <h2 className="min-w-0 truncate text-[16px] font-black leading-6 text-[var(--text)] sm:text-lg">پیشنهادهای داغ امروز</h2>
              <Link href="/products" className="flex shrink-0 items-center gap-1 rounded-xl border border-[var(--border)] px-2 py-1.5 text-[8px] font-black text-[var(--text)] hover:border-[var(--primary)]/40 hover:text-[var(--primary)]"><span>همه تخفیف‌ها</span><ArrowLeft size={11} /></Link>
            </div>
            <p className="mt-0.5 text-[10px] text-[var(--muted)]">تخفیف ویژه محصولات منتخب</p>
          </div>
        </div>
      </div>
      <div className="hidden text-center lg:block">
        <div className="mb-2 flex items-center justify-center gap-2"><span className="grid size-9 place-items-center rounded-xl bg-[var(--primary)]/[0.10] text-[var(--primary)]"><Zap size={17} fill="currentColor" /></span><span className="text-[10px] font-black tracking-[0.18em] text-[var(--primary)]">پر تخفیف‌ها</span><span className="rounded-full bg-red-500/10 px-2.5 py-1 text-[9px] font-black text-red-500">محدود</span></div>
        <h2 className="text-2xl font-black tracking-tight text-[var(--text)] xl:text-[28px]">پیشنهادهای داغ امروز</h2>
        <p className="mt-2 text-xs font-medium text-[var(--muted)]">تخفیف ویژه محصولات منتخب ابزار احمدی</p>
      </div>
    </>
  );
}
