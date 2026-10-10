"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpLeft,
  BookOpen,
  Clock3,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import type { StoreArticle } from "@/lib/types";

const PAGE_SIZE = 8;

const categoryOf = (article: StoreArticle) =>
  article.category?.trim() || "راهنمای خرید";

const dateOf = (article: StoreArticle) =>
  article.publishedAt || article.createdAt;

const formatDate = (value?: string) => {
  if (!value) return "مجله ابزار احمدی";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "مجله ابزار احمدی"
    : new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
};

const popularCategories = [
  "راهنمای خرید",
  "آموزش ابزار",
  "نگهداری ابزار",
  "نگهداری و ایمنی",
];

export default function MagazineBrowser({
  articles,
}: {
  articles: StoreArticle[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("همه مطالب");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);

  const categories = useMemo(
    () => [
      "همه مطالب",
      ...Array.from(new Set(articles.map(categoryOf))).sort((a, b) =>
        a.localeCompare(b, "fa"),
      ),
    ],
    [articles],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("fa");

    return [...articles]
      .filter(
        (article) =>
          category === "همه مطالب" || categoryOf(article) === category,
      )
      .filter((article) => {
        if (!term) return true;

        return [
          article.title,
          article.excerpt,
          categoryOf(article),
          ...(article.tags ?? []),
        ].some((value) =>
          value?.toLocaleLowerCase("fa").includes(term),
        );
      })
      .sort((a, b) => {
        const first = new Date(dateOf(a)).getTime();
        const second = new Date(dateOf(b)).getTime();

        return sort === "oldest" ? first - second : second - first;
      });
  }, [articles, category, query, sort]);

  const featured = filtered[0];
  const remaining = filtered.slice(1);
  const pageCount = Math.max(1, Math.ceil(remaining.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = remaining.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const totalReadingMinutes = useMemo(
    () =>
      articles.reduce(
        (total, article) => total + (article.readingMinutes || 0),
        0,
      ),
    [articles],
  );

  const resetFilters = () => {
    setQuery("");
    setCategory("همه مطالب");
    setSort("newest");
    setPage(1);
  };

  const setCategoryAndReset = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  return (
    <main dir="rtl" className="min-h-screen pb-20">
      {/* Editorial hero */}
      <section className="relative isolate overflow-hidden border-b border-[var(--border)] bg-[var(--surface)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -right-32 -top-40 size-[32rem] rounded-full bg-[var(--primary)]/10 blur-3xl" />
          <div className="absolute -left-24 bottom-0 size-80 rounded-full bg-cyan-400/5 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:48px_48px]" />
        </div>

        <div className="mx-auto grid w-full max-w-[1500px] gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:px-8 lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/25 bg-[var(--primary)]/10 px-3.5 py-2 text-xs font-black text-[var(--primary)]">
              <Sparkles size={14} aria-hidden="true" />
              مجله تخصصی ابزار احمدی
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.4] tracking-tight sm:text-5xl lg:text-6xl">
              قبل از خرید ابزار،
              <span className="mt-2 block text-[var(--primary)]">
                درست انتخاب کنید.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-8 text-[var(--muted)] sm:text-base sm:leading-9">
              راهنماهای خرید، آموزش‌های کاربردی، بررسی‌های فنی و نکات ایمنی؛
              محتوایی که کمک می‌کند ابزار مناسب پروژه‌تان را سریع‌تر و
              آگاهانه‌تر انتخاب کنید.
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              {[
                `${articles.length.toLocaleString("fa-IR")} مقاله`,
                "محتوای تخصصی",
                "مطالعه سریع",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5 text-xs font-bold text-[var(--muted)]"
                >
                  <span className="size-1.5 rounded-full bg-[var(--primary)]" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {featured ? (
            <Link
              href={`/magazine/${featured.slug}`}
              className="group relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-black shadow-2xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={featured.image || "/placeholder-product.svg"}
                  alt={featured.imageAlt || featured.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                  <div className="flex items-center gap-2 text-[11px] font-black text-cyan-300">
                    <span className="rounded-lg bg-cyan-400/15 px-2.5 py-1.5 backdrop-blur">
                      انتخاب سردبیر
                    </span>
                    <span className="text-white/65">
                      {featured.readingMinutes || 5} دقیقه مطالعه
                    </span>
                  </div>
                  <h2 className="mt-3 text-xl font-black leading-8 text-white sm:text-2xl">
                    {featured.title}
                  </h2>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-black text-white">
                    مطالعه مقاله
                    <ArrowLeft
                      size={15}
                      className="transition-transform group-hover:-translate-x-1"
                    />
                  </span>
                </div>
              </div>
            </Link>
          ) : null}
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        {/* Discovery bar */}
        <section
          aria-label="جست‌وجو و فیلتر مقالات"
          className="relative z-20 -mt-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xl sm:p-4"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative min-w-0 flex-1">
              <Search
                size={18}
                aria-hidden="true"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="دنبال چه چیزی می‌گردید؟ مثلاً دریل، فرز، ایمنی..."
                className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] pr-11 pl-10 text-sm font-medium outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                aria-label="جست‌وجوی مقاله"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setPage(1);
                  }}
                  aria-label="پاک کردن جست‌وجو"
                  className="absolute left-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                >
                  <X size={15} />
                </button>
              ) : null}
            </label>

            <label className="flex h-12 shrink-0 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-xs font-bold">
              <span className="text-[var(--muted)]">مرتب‌سازی</span>
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value as "newest" | "oldest");
                  setPage(1);
                }}
                className="max-w-28 bg-transparent font-black outline-none"
                aria-label="مرتب‌سازی مقالات"
              >
                <option value="newest">جدیدترین</option>
                <option value="oldest">قدیمی‌ترین</option>
              </select>
            </label>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategoryAndReset(item)}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-black transition ${
                  category === item
                    ? "bg-[var(--primary)] text-[#10242a] shadow-lg shadow-[var(--primary)]/20"
                    : "border border-[var(--border)] bg-[var(--bg)] text-[var(--muted)] hover:border-[var(--primary)]/40 hover:text-[var(--text)]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Trust / reading metrics */}
        <section className="mt-7 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: BookOpen,
              label: "کتابخانه تخصصی",
              value: `${articles.length.toLocaleString("fa-IR")} مقاله`,
            },
            {
              icon: Clock3,
              label: "زمان مطالعه محتوا",
              value: `${totalReadingMinutes.toLocaleString("fa-IR")} دقیقه`,
            },
            {
              icon: Sparkles,
              label: "موضوعات منتخب",
              value: `${categories.length - 1} دسته`,
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                <Icon size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[11px] font-bold text-[var(--muted)]">
                  {label}
                </p>
                <p className="mt-1 text-sm font-black">{value}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Popular topics */}
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black text-[var(--primary)]">
                مسیرهای سریع مطالعه
              </p>
              <h2 className="mt-1.5 text-xl font-black sm:text-2xl">
                از اینجا شروع کنید
              </h2>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {popularCategories
              .filter((item) => categories.includes(item))
              .map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategoryAndReset(item)}
                  className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs font-black transition hover:-translate-y-0.5 hover:border-[var(--primary)]/50 hover:text-[var(--primary)]"
                >
                  {item}
                </button>
              ))}
          </div>
        </section>

        {/* Articles */}
        <section className="mt-12" aria-labelledby="articles-heading">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black text-[var(--primary)]">
                کتابخانه دانش ابزار
              </p>
              <h2
                id="articles-heading"
                className="mt-1.5 text-2xl font-black sm:text-3xl"
              >
                مقالات و راهنماها
              </h2>
            </div>

            <div className="text-xs font-bold text-[var(--muted)]">
              {filtered.length.toLocaleString("fa-IR")} نتیجه
              {query || category !== "همه مطالب" ? " برای فیلتر فعلی" : ""}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-20 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                <Search size={25} />
              </span>
              <h3 className="mt-5 text-lg font-black">
                مقاله‌ای با این مشخصات پیدا نشد
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[var(--muted)]">
                عبارت جست‌وجو یا دسته‌بندی را تغییر دهید تا نتایج بیشتری ببینید.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-xl bg-[var(--primary)] px-5 py-3 text-xs font-black text-[#10242a]"
              >
                پاک کردن فیلترها
              </button>
            </div>
          ) : (
            <>
              {currentPage === 1 && featured ? (
                <Link
                  href={`/magazine/${featured.slug}`}
                  className="group mb-6 grid overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[var(--primary)]/40 hover:shadow-2xl lg:grid-cols-[1.02fr_0.98fr]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface-2)] lg:aspect-auto lg:min-h-[390px]">
                    <Image
                      src={featured.image || "/placeholder-product.svg"}
                      alt={featured.imageAlt || featured.title}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    <span className="absolute right-4 top-4 rounded-lg bg-black/65 px-3 py-1.5 text-[10px] font-black text-white backdrop-blur">
                      مقاله منتخب
                    </span>
                  </div>

                  <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-black">
                      <span className="rounded-lg bg-[var(--primary)]/10 px-3 py-1.5 text-[var(--primary)]">
                        {categoryOf(featured)}
                      </span>
                      <span className="text-[var(--muted)]">
                        {formatDate(dateOf(featured))}
                      </span>
                    </div>

                    <h3 className="mt-5 text-2xl font-black leading-[1.7] sm:text-3xl">
                      {featured.title}
                    </h3>

                    <p className="mt-4 line-clamp-3 text-sm leading-8 text-[var(--muted)]">
                      {featured.excerpt}
                    </p>

                    <span className="mt-7 inline-flex items-center gap-2 text-sm font-black text-[var(--primary)]">
                      مطالعه کامل
                      <ArrowLeft
                        size={17}
                        className="transition-transform group-hover:-translate-x-1"
                      />
                    </span>
                  </div>
                </Link>
              ) : null}

              {visible.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {visible.map((article) => (
                    <Link
                      key={article.id}
                      href={`/magazine/${article.slug}`}
                      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/45 hover:shadow-2xl"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface-2)]">
                        <Image
                          src={article.image || "/placeholder-product.svg"}
                          alt={article.imageAlt || article.title}
                          fill
                          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                        <span className="absolute right-3 top-3 rounded-lg border border-white/20 bg-black/65 px-2.5 py-1.5 text-[10px] font-black text-white backdrop-blur">
                          {categoryOf(article)}
                        </span>
                        {article.readingMinutes ? (
                          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-white">
                            <Clock3 size={12} />
                            {article.readingMinutes} دقیقه
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <div className="text-[10px] font-bold text-[var(--muted)]">
                          {formatDate(dateOf(article))}
                        </div>

                        <h3 className="mt-3 line-clamp-2 text-[15px] font-black leading-7 transition group-hover:text-[var(--primary)]">
                          {article.title}
                        </h3>

                        <p className="mt-2 line-clamp-3 text-xs leading-7 text-[var(--muted)]">
                          {article.excerpt}
                        </p>

                        <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-4 mt-5">
                          <span className="text-xs font-black text-[var(--primary)]">
                            ادامه مطلب
                          </span>
                          <span className="grid size-8 place-items-center rounded-full border border-[var(--border)] transition group-hover:border-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-[#10242a]">
                            <ArrowUpLeft size={15} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}

              {pageCount > 1 ? (
                <nav
                  aria-label="صفحه‌بندی مقالات"
                  className="mt-10 flex items-center justify-center gap-2"
                >
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs font-black transition hover:border-[var(--primary)]/40 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    قبلی
                  </button>

                  {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                    (number) => (
                      <button
                        key={number}
                        type="button"
                        aria-current={
                          currentPage === number ? "page" : undefined
                        }
                        onClick={() => setPage(number)}
                        className={`size-10 rounded-xl text-xs font-black transition ${
                          currentPage === number
                            ? "bg-[var(--primary)] text-[#10242a] shadow-lg shadow-[var(--primary)]/20"
                            : "border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]/40"
                        }`}
                      >
                        {number.toLocaleString("fa-IR")}
                      </button>
                    ),
                  )}

                  <button
                    type="button"
                    disabled={currentPage === pageCount}
                    onClick={() =>
                      setPage((value) => Math.min(pageCount, value + 1))
                    }
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs font-black transition hover:border-[var(--primary)]/40 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    بعدی
                  </button>
                </nav>
              ) : null}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
