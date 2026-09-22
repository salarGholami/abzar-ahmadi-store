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
} from "lucide-react";
import { useState } from "react";

const footerLinks = {
  quick: [
    { label: "فروشگاه", href: "/products" },
    { label: "دسته‌بندی محصولات", href: "/categories" },
    {
      label: "پرفروش‌ترین‌ها",
      href: "/products?sort=popular",
    },
    {
      label: "محصولات جدید",
      href: "/products?sort=newest",
    },
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
    <div className="border-b border-[var(--border)] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-right"
      >
        <span className="text-sm font-bold text-[var(--text)]">{title}</span>

        <ChevronDown
          size={18}
          strokeWidth={2}
          className={`text-[var(--muted)] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function StoreFooter() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer
      className="
        mt-auto
        border-t
        border-[var(--border)]
        bg-[var(--surface)]
        md:hidden
      "
    >
      {/* Trust features */}
      <section className="border-b border-[var(--border)] bg-[var(--surface-2)]">
        <div className="mx-auto grid max-w-7xl grid-cols-2">
          <div className="flex flex-col items-center justify-center border-l border-[var(--border)] px-3 py-5 text-center">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)]">
              <Truck size={21} strokeWidth={1.8} />
            </div>

            <span className="mt-2 text-xs font-black text-[var(--text)]">
              ارسال سریع
            </span>

            <span className="mt-1 text-[10px] leading-4 text-[var(--muted)]">
              ارسال به سراسر کشور
            </span>
          </div>

          <div className="flex flex-col items-center justify-center px-3 py-5 text-center">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)]">
              <ShieldCheck size={21} strokeWidth={1.8} />
            </div>

            <span className="mt-2 text-xs font-black text-[var(--text)]">
              ضمانت اصالت
            </span>

            <span className="mt-1 text-[10px] leading-4 text-[var(--muted)]">
              کالای معتبر و اصل
            </span>
          </div>
        </div>
      </section>

      {/* Footer content */}
      <div className="mx-auto max-w-7xl px-4">
        {/* Brand */}
        <section className="py-7">
          <Link
            href="/"
            aria-label="ابزار احمدی"
            className="group inline-flex items-center gap-3"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-sm transition-transform duration-200 group-active:scale-95">
              <span className="text-lg font-black">ا</span>
            </div>

            <div>
              <div className="text-base font-black text-[var(--text)]">
                ابزار احمدی
              </div>

              <div className="mt-0.5 text-[10px] font-medium text-[var(--muted)]">
                فروش تخصصی ابزار و تجهیزات
              </div>
            </div>
          </Link>

          <p className="mt-4 max-w-md text-xs leading-6 text-[var(--muted)]">
            خرید انواع ابزارآلات و تجهیزات با کیفیت، قیمت مناسب و ارسال سریع به
            سراسر کشور.
          </p>
        </section>

        {/* Accordion */}
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4">
          <FooterSection title="دسترسی سریع" defaultOpen>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {footerLinks.quick.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-xs text-[var(--muted)] transition-colors duration-200 hover:text-[var(--primary)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </FooterSection>

          <FooterSection title="خدمات مشتریان">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {footerLinks.support.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-xs text-[var(--muted)] transition-colors duration-200 hover:text-[var(--primary)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </FooterSection>

          <FooterSection title="ارتباط با ما">
            <div className="space-y-3">
              <a
                href="tel:02144881234"
                className="flex items-center gap-3 text-xs text-[var(--muted)] transition-colors hover:text-[var(--primary)]"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
                  <Phone size={15} strokeWidth={1.8} />
                </span>

                <span dir="ltr">021-44881234</span>
              </a>

              <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
                  <MapPin size={15} strokeWidth={1.8} />
                </span>

                <span>تهران، ایران</span>
              </div>

              <a
                href="mailto:info@example.com"
                className="flex items-center gap-3 text-xs text-[var(--muted)] transition-colors hover:text-[var(--primary)]"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
                  <Mail size={15} strokeWidth={1.8} />
                </span>

                <span dir="ltr">info@example.com</span>
              </a>
            </div>
          </FooterSection>
        </section>

        {/* Social */}
        <section className="flex items-center justify-between py-6">
          <div>
            <p className="text-xs font-black text-[var(--text)]">
              ما را دنبال کنید
            </p>

            <p className="mt-1 text-[10px] text-[var(--muted)]">
              جدیدترین محصولات و تخفیف‌ها
            </p>
          </div>

          <div className="flex gap-2">
            <a
              href="#"
              aria-label="اینستاگرام"
              className="flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)] transition-all duration-200 hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-95"
            >
              <Instagram size={18} strokeWidth={1.8} />
            </a>

            <a
              href="mailto:info@example.com"
              aria-label="ایمیل"
              className="flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)] transition-all duration-200 hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-95"
            >
              <Mail size={18} strokeWidth={1.8} />
            </a>
          </div>
        </section>

        {/* Back to top */}
        <button
          type="button"
          onClick={scrollToTop}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] py-3.5 text-xs font-bold text-[var(--muted)] transition-all duration-200 hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-[0.99]"
        >
          <ArrowUp size={15} strokeWidth={2} />
          بازگشت به بالای صفحه
        </button>

        {/* Copyright */}
        <section className="py-6 text-center">
          <p className="text-[10px] leading-5 text-[var(--muted)]">
            تمامی حقوق این وب‌سایت متعلق به
            <span className="mx-1 font-black text-[var(--text)]">
              ابزار احمدی
            </span>
            است.
          </p>

          <p className="mt-1 text-[9px] text-[var(--muted)]">
            طراحی و توسعه با ❤️
          </p>
        </section>
      </div>
    </footer>
  );
}
