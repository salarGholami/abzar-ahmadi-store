import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import articles from "@/../data/articles.json";

export function generateStaticParams() {
  return articles.filter((article) => article.active).map((article) => ({ slug: article.slug }));
}

export default async function MagazineArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find((item) => item.active && item.slug === slug);
  if (!article) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <Link href="/magazine" className="inline-flex items-center gap-2 text-xs font-black text-[var(--primary)]">
        <ArrowRight size={15} /> بازگشت به مجله
      </Link>
      <article className="mt-5 overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)]">
        <div className="aspect-[16/7] bg-[var(--surface-2)]">
          <img src={article.image} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="p-6 sm:p-8 lg:p-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-black text-[var(--primary)]">
            <BookOpen size={14} /> مجله ابزار احمدی
          </span>
          <h1 className="mt-5 text-2xl font-black leading-[1.7] sm:text-3xl">{article.title}</h1>
          <p className="mt-5 border-r-4 border-[var(--primary)] pr-4 text-sm leading-8 text-[var(--muted)] sm:text-base">{article.excerpt}</p>
          <div className="mt-7 text-sm leading-9 text-[var(--text)]">{article.content}</div>
        </div>
      </article>
    </main>
  );
}
