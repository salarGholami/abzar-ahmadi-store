import Link from "next/link";
import { ArrowLeft, PackageSearch } from "lucide-react";
import EmptyState from "@/shared/ui/EmptyState";

export default function CatalogEmpty({ resetHref }: { resetHref: string }) {
  const suggestions = [
    ["دریل", "دریل"],
    ["ابزار دستی", "ابزار دستی"],
    ["جوشکاری", "جوش"],
  ] as const;

  return (
    <div className="space-y-4">
      <EmptyState
        icon={<PackageSearch size={28} aria-hidden />}
        title="محصولی با این شرایط پیدا نشد"
        description="عبارت جستجو را کوتاه‌تر کنید، یک فیلتر را بردارید یا از یکی از مسیرهای پیشنهادی زیر استفاده کنید."
        actionHref={resetHref}
        actionLabel="نمایش همه کالاها"
      />
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="text-xs font-black">پیشنهادهای سریع</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map(([label, query]) => (
            <Link key={query} href={`/products?q=${encodeURIComponent(query)}`} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-2)] px-3 py-2 text-xs font-bold text-[var(--text)] transition hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]">
              {label}<ArrowLeft size={12} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
