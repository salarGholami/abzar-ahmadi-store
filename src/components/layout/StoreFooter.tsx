"use client";

import Link from "next/link";
import {
  ArrowUp,
  ChevronDown,
  Instagram,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  CreditCard,
  Headphones,
} from "lucide-react";
import { useState } from "react";

const footerLinks = {
  quick: [
    { label: "فروشگاه", href: "/products" },
    { label: "دسته‌بندی محصولات", href: "/products" },
    { label: "پرفروش‌ترین‌ها", href: "/products?sort=popular" },
    { label: "محصولات جدید", href: "/products?sort=newest" },
  ],
  support: [
    { label: "تماس با ما", href: "/contact" },
    { label: "درباره ما", href: "/about" },
    { label: "پیگیری سفارش", href: "/orders" },
    { label: "سوالات متداول", href: "/faq" },
  ],
};

function FooterSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[var(--border)] last:border-b-0 md:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-right md:pointer-events-none md:cursor-default"
      >
        <span className="text-sm font-black text-[var(--text)]">{title}</span>
        <ChevronDown
          size={18}
          strokeWidth={2}
          className={`text-[var(--muted)] transition-transform duration-200 md:hidden ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 md:!grid-rows-[1fr] md:!opacity-100 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-4 md:pb-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function StoreFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface)] pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] md:pb-0">
      {/* Trust bar */}
      <section className="border-b border-[var(--border)] bg-[var(--surface-2)]">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-px sm:grid-cols-4">
          {[
            {
              icon: Truck,
              title: "ارسال سریع",
              desc: "تحویل در کمترین زمان",
            },
            {
              icon: ShieldCheck,
              title: "ضمانت اصالت",
              desc: "کالای ۱۰۰٪ اصلی",
            },
            {
              icon: CreditCard,
              title: "پرداخت امن",
              desc: "درگاه‌های معتبر",
            },
            {
              icon: Headphones,
              title: "پشتیبانی تخصصی",
              desc: "شنبه تا پنجشنبه ۹–۱۸",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center justify-center gap-2 px-3 py-5 text-center sm:flex-row sm:gap-3 sm:text-right"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                <item.icon size={20} strokeWidth={1.8} />
              </span>
              <div>
                <p className="text-xs font-black text-[var(--text)]">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main links */}
      <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-6">
        <div className="grid gap-2 md:grid-cols-4 md:gap-10">
          {/* Brand */}
          <div className="mb-4 md:mb-0">
            <div className="text-xl font-black tracking-tight text-[var(--text)]">
              ابزار احمدی
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              فروش ابزار حرفه‌ای ساختمانی، کارگاهی و صنعتی با پشتیبانی تخصصی و
              ارسال سریع در سراسر کشور.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href="tel:02100000000"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs font-bold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                <Phone size={14} />
                <span dir="ltr">021-00000000</span>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <FooterSection title="دسترسی سریع" defaultOpen>
            <ul className="space-y-2.5">
              {footerLinks.quick.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted)] transition hover:text-[var(--primary)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* Support */}
          <FooterSection title="خدمات مشتریان">
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted)] transition hover:text-[var(--primary)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* Contact */}
          <FooterSection title="ارتباط با ما">
            <div className="space-y-3 text-sm text-[var(--muted)]">
              <a
                href="tel:02100000000"
                className="flex items-center gap-2 transition hover:text-[var(--primary)]"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--primary)]">
                  <Phone size={14} />
                </span>
                <span dir="ltr">021-00000000</span>
              </a>
              <a
                href="mailto:info@abzarahmadi.ir"
                className="flex items-center gap-2 transition hover:text-[var(--primary)]"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--primary)]">
                  <Mail size={14} />
                </span>
                <span dir="ltr">info@abzarahmadi.ir</span>
              </a>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--primary)]">
                  <MapPin size={14} />
                </span>
                <span className="leading-6">تهران، ایران</span>
              </div>
            </div>
          </FooterSection>
        </div>

        {/* Social + back to top */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[var(--muted)]">
              ما را دنبال کنید
            </span>
            <a
              href="#"
              aria-label="اینستاگرام"
              className="flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-95"
            >
              <Instagram size={18} />
            </a>
            <a
              href="mailto:info@abzarahmadi.ir"
              aria-label="ایمیل"
              className="flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-95"
            >
              <Mail size={18} />
            </a>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-xs font-bold text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-[0.98]"
          >
            <ArrowUp size={15} />
            بازگشت به بالا
          </button>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-[var(--muted)]">
            © ۱۴۰۵{" "}
            <span className="font-black text-[var(--text)]">ابزار احمدی</span> —
            تمامی حقوق محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  );
}
