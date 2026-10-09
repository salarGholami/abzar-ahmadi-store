import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Tags } from "lucide-react";
import { listActiveCategories } from "@/domains/catalog/server";

export const metadata: Metadata = {
  title: "دسته‌بندی ابزارها",
  description: "دسته‌بندی‌های ابزار احمدی را برای پیدا کردن سریع ابزار مناسب مرور کنید.",
};

export default async function CategoriesPage() {
  const categories = await listActiveCategories();

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-xs font-black text-[var(--primary)]">راهنمای خرید</p>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">دسته‌بندی ابزارها</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          دسته‌بندی مناسب را انتخاب کنید و مستقیماً به محصولات مرتبط برسید.
        </p>
      </header>

      {categories.length ? (
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/categories/${category.slug}`}
                className="group flex min-h-40 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition hover:-translate-y-0.5 hover:border-[var(--primary)]/35 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary)]/15"
              >
                <div className="relative aspect-[4/3] w-full bg-[var(--surface-2)]">
                  {category.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="grid h-full place-items-center text-[var(--primary)]">
                      <Tags size={28} />
                    </span>
                  )}
                </div>
                <span className="flex items-center justify-between gap-2 p-4 text-sm font-black">
                  <span>{category.name}</span>
                  <ArrowLeft
                    size={15}
                    className="text-[var(--muted)] transition group-hover:-translate-x-0.5 group-hover:text-[var(--primary)]"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm font-bold text-[var(--muted)]">
          در حال حاضر دسته‌بندی فعالی ثبت نشده است.
        </div>
      )}
    </main>
  );
}
