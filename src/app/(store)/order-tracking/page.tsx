"use client";

import Link from "next/link";
import { CheckCircle2, ChevronLeft, Clock3, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";

const stages = [
  { title: "ثبت سفارش", description: "سفارش شما در سیستم ثبت می‌شود.", icon: CheckCircle2 },
  { title: "تأیید پرداخت", description: "پرداخت یا فیش توسط سیستم بررسی می‌شود.", icon: ShieldCheck },
  { title: "آماده‌سازی", description: "کالا برای ارسال بسته‌بندی می‌شود.", icon: PackageCheck },
  { title: "تحویل به ارسال", description: "مرسوله به شرکت حمل تحویل داده می‌شود.", icon: Truck },
];

export default function OrderTrackingPage() {
  const [id, setId] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-xs font-black text-[var(--primary)]">خدمات مشتریان</p>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">پیگیری سفارش</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">شماره سفارش و موبایل را وارد کنید. جزئیات سفارش‌های ثبت‌شده بعد از ورود به حساب کاربری در دسترس است.</p>
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]"><Clock3 size={18} /></span>
            <div><h2 className="text-sm font-black">پیدا کردن سفارش</h2><p className="mt-1 text-xs text-[var(--muted)]">اطلاعات سفارش را دقیق وارد کنید.</p></div>
          </div>
          <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }} className="mt-6 space-y-3">
            <label className="block"><span className="field-label">شماره سفارش</span><input required className="input" inputMode="numeric" value={id} onChange={(e) => setId(e.target.value)} placeholder="مثلاً ۱۰۲۴" /></label>
            <label className="block"><span className="field-label">شماره موبایل</span><input required className="input" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xxxxxxxxx" /></label>
            <button className="btn btn-primary w-full">پیگیری سفارش</button>
          </form>
          {submitted ? <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-xs leading-6"><b>برای نمایش وضعیت واقعی سفارش، وارد حساب کاربری شوید.</b><div className="mt-2"><Link href={`/account?next=/orders`} className="font-black text-[var(--primary)]">ورود به حساب و مشاهده سفارش‌ها <ChevronLeft className="inline size-4" /></Link></div></div> : null}
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="text-sm font-black">مراحل استاندارد سفارش</h2>
          <div className="mt-6 space-y-4">
            {stages.map(({ title, description, icon: Icon }, index) => (
              <div key={title} className="relative flex gap-3">
                {index < stages.length - 1 ? <span className="absolute right-5 top-11 h-8 w-px bg-[var(--border)]" aria-hidden /> : null}
                <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 text-[var(--primary)]"><Icon size={17} /></span>
                <div className="min-w-0 pt-1"><p className="text-sm font-black">{title}</p><p className="mt-1 text-xs leading-6 text-[var(--muted)]">{description}</p></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
