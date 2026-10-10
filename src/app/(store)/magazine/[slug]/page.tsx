import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Clock3, Share2 } from "lucide-react";
import sanitizeHtml from "sanitize-html";
import { getJson } from "@/lib/github";
import type { StoreArticle } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

async function findArticle(slug: string) {
  const result = await getJson<StoreArticle[]>("articles.json", [], { cache: false });
  return result.data.find((item) => item.active && item.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await findArticle(slug);
  if (!article) return { title: "مقاله پیدا نشد | مجله ابزار احمدی", robots: { index: false, follow: false } };

  const title = article.metaTitle || `${article.title} | مجله ابزار احمدی`;
  const description = (article.metaDescription || article.excerpt || article.title).slice(0, 160);
  const canonical = `/magazine/${article.slug}`;
  return {
    title,
    description,
    alternates: { canonical: article.canonicalUrl?.trim() || canonical },
    robots: { index: article.noIndex !== true, follow: true },
    openGraph: {
      type: "article",
      locale: "fa_IR",
      title,
      description,
      url: canonical,
      publishedTime: article.publishedAt || article.createdAt,
      modifiedTime: article.updatedAt,
      images: article.image ? [{ url: article.image, alt: article.imageAlt || article.title }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: article.image ? [article.image] : undefined },
  };
}

export default async function MagazineArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await findArticle(slug);
  if (!article) notFound();

  const legacyContent = (article.content || "")
    .split(/\\n{2,}|\\r?\\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
    .join("");
  const contentHtml = sanitizeHtml(article.contentHtml || legacyContent, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "h1", "h2", "h3", "figure", "figcaption", "span", "u", "s", "hr"],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["style", "class"],
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
    },
  });

  const date = article.publishedAt || article.createdAt;
  const dateLabel = date && !Number.isNaN(new Date(date).getTime())
    ? new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(date))
    : "مجله ابزار احمدی";
  const readingMinutes = article.readingMinutes || Math.max(1, Math.ceil((article.content || "").replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length / 200));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription || article.excerpt,
    image: article.image ? [article.image] : undefined,
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt || article.publishedAt || article.createdAt,
    author: { "@type": "Organization", name: article.author || "تحریریه ابزار احمدی" },
    publisher: { "@type": "Organization", name: "ابزار احمدی" },
    mainEntityOfPage: { "@type": "WebPage", "@id": `/magazine/${article.slug}` },
  };

  return (
    <main dir="rtl" className="mx-auto w-full max-w-[1200px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <nav aria-label="مسیر صفحه" className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--muted)]">
        <Link href="/" className="transition hover:text-[var(--primary)]">خانه</Link><span>/</span>
        <Link href="/magazine" className="transition hover:text-[var(--primary)]">مجله</Link><span>/</span>
        <span className="max-w-[55vw] truncate text-[var(--text)]">{article.title}</span>
      </nav>
      <article className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)]">
        <header className="mx-auto max-w-4xl px-5 pb-8 pt-8 sm:px-10 sm:pt-12 lg:px-14">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold">
            <Link href="/magazine" className="rounded-lg bg-[var(--primary)]/10 px-3 py-1.5 text-[var(--primary)]">{article.category || "راهنمای خرید"}</Link>
            <span className="inline-flex items-center gap-1.5 text-[var(--muted)]"><CalendarDays size={14}/>{dateLabel}</span>
            <span className="inline-flex items-center gap-1.5 text-[var(--muted)]"><Clock3 size={14}/>{readingMinutes.toLocaleString("fa-IR")} دقیقه مطالعه</span>
          </div>
          <h1 className="mt-6 text-3xl font-black leading-[1.6] tracking-tight sm:text-4xl lg:text-[2.7rem]">{article.title}</h1>
          {article.excerpt && <p className="mt-5 border-r-[3px] border-[var(--primary)] pr-4 text-base leading-9 text-[var(--muted)] sm:text-lg">{article.excerpt}</p>}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5 text-xs text-[var(--muted)]">
            <span>نویسنده: <strong className="text-[var(--text)]">{article.author || "تحریریه ابزار احمدی"}</strong></span>
            <Link href="/magazine" className="inline-flex items-center gap-2 font-extrabold text-[var(--primary)]"><ArrowRight size={15}/> بازگشت به مجله</Link>
          </div>
        </header>
        {article.image && <figure className="mx-auto w-full max-w-5xl px-3 sm:px-8"><img src={article.image} alt={article.imageAlt || article.title} fetchPriority="high" className="max-h-[560px] w-full rounded-2xl object-cover" />{article.imageCaption && <figcaption className="mt-2 text-center text-xs text-[var(--muted)]">{article.imageCaption}</figcaption>}</figure>}
        <div className="mx-auto max-w-3xl px-5 py-9 sm:px-10 sm:py-12">
          <div className="article-content text-[var(--text)]" dangerouslySetInnerHTML={{ __html: contentHtml }} />
          {article.tags?.length ? <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-6"><span className="ml-1 text-xs font-black">برچسب‌ها:</span>{article.tags.map((tag) => <span key={tag} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)]">#{tag}</span>)}</div> : null}
        </div>
      </article>
      <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center sm:p-7">
        <div><p className="text-xs font-extrabold text-[var(--primary)]">مطالب بیشتر</p><h2 className="mt-2 text-lg font-black">دانش ابزار خود را گسترش دهید</h2><p className="mt-1 text-sm text-[var(--muted)]">راهنماها و مقاله‌های دیگر مجله را ببینید.</p></div>
        <Link href="/magazine" className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-black text-[#10242a]">مشاهده همه مقالات <ArrowRight size={16}/></Link>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </main>
  );
}
