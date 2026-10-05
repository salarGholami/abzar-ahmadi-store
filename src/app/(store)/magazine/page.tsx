import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import articles from "@/../data/articles.json";

export default function MagazinePage() {
  const activeArticles = articles.filter((article) => article.active);

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 lg:p-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-black text-[var(--primary)]">
          <BookOpen size={15} /> مجله ابزار احمدی
        </span>
        <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">راهنمای خرید و استفاده از ابزار</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          مطالب کاربردی برای انتخاب ابزار، شناخت مشخصات فنی و تصمیم‌گیری بهتر برای پروژه‌های ساختمانی و کارگاهی.
        </p>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2">
        {activeArticles.map((article) => (
          <Link
            key={article.id}
            href={`/magazine/${article.slug}`}
            className="group overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] transition hover:-translate-y-0.5 hover:border-[var(--primary)]/40 hover:shadow-xl"
          >
            <div className="aspect-[16/8] overflow-hidden bg-[var(--surface-2)]">
              <img src={article.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            </div>
            <div className="p-6">
              <h2 className="text-lg font-black leading-8">{article.title}</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{article.excerpt}</p>
              <span className="mt-5 flex items-center gap-1 text-xs font-black text-[var(--primary)]">
                مطالعه مطلب <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
