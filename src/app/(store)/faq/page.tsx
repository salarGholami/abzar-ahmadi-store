import type { Metadata } from "next";
import StaticPage from "@/shared/layout/StaticPage";
import JsonLd from "@/shared/seo/JsonLd";

export const metadata: Metadata = {
  title: "سوالات متداول",
  description: "پاسخ سوالات رایج درباره خرید، پرداخت، ارسال و پیگیری سفارش در فروشگاه ابزار احمدی.",
  alternates: { canonical: "/faq" },
};

const faqs = [
  { q: "چگونه سفارش خود را پیگیری کنم؟", a: "پس از ورود به حساب کاربری، در بخش سفارش‌ها وضعیت پرداخت، ارسال و کد رهگیری هر سفارش نمایش داده می‌شود." },
  { q: "روش پرداخت چیست؟", a: "در حال حاضر پرداخت به‌صورت کارت‌به‌کارت انجام می‌شود؛ پس از واریز، تصویر فیش را هنگام ثبت سفارش بارگذاری کنید تا مدیر فروشگاه آن را تأیید کند." },
  { q: "سفارش من چه زمانی ارسال می‌شود؟", a: "پس از تأیید پرداخت، سفارش آماده‌سازی و با پست، تیپاکس یا پیک ارسال می‌شود و کد رهگیری در حساب شما ثبت می‌گردد." },
  { q: "آیا امکان خرید عمده و پیش‌فاکتور وجود دارد؟", a: "بله. برای خرید عمده از صفحه‌ی تماس با ما با تیم فروش هماهنگ کنید." },
];

export default function FaqPage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  return (
    <StaticPage title="سوالات متداول">
      <JsonLd data={ld} />
      {faqs.map((item) => (
        <section key={item.q}>
          <h2 className="font-black">{item.q}</h2>
          <p className="mt-1 text-[var(--muted)]">{item.a}</p>
        </section>
      ))}
    </StaticPage>
  );
}
