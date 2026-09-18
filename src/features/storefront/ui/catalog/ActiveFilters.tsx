import Link from "next/link";
import { X } from "lucide-react";
import {
  buildCatalogHref,
  type CatalogChanges,
  type CatalogQuery,
} from "@/domains/catalog/model/catalog-query";

type Chip = { key: string; label: string; changes: CatalogChanges };

type Props = { basePath: string; query: CatalogQuery; hideCategory?: boolean };

export default function ActiveFilters({ basePath, query, hideCategory = false }: Props) {
  const chips: Chip[] = [];
  if (query.q) chips.push({ key: "q", label: `جستجو: ${query.q}`, changes: { q: null } });
  if (query.category && !hideCategory) chips.push({ key: "category", label: query.category, changes: { category: null } });
  if (query.brand) chips.push({ key: "brand", label: query.brand, changes: { brand: null } });
  if (query.availableOnly) chips.push({ key: "stock", label: "فقط موجود", changes: { stock: null } });
  if (query.maxPrice !== null) {
    chips.push({ key: "maxPrice", label: `تا ${query.maxPrice.toLocaleString("fa-IR")} تومان`, changes: { maxPrice: null } });
  }

  if (chips.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="فیلترهای فعال">
      {chips.map((chip) => (
        <li key={chip.key}>
          <Link
            href={buildCatalogHref(basePath, query, chip.changes)}
            prefetch={false}
            rel="nofollow"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-3 py-1.5 text-[11px] font-black text-[var(--primary)]"
          >
            {chip.label}
            <X size={12} aria-hidden />
            <span className="sr-only">حذف فیلتر</span>
          </Link>
        </li>
      ))}
      <li>
        <Link href={basePath} prefetch={false} rel="nofollow" className="text-[11px] font-bold text-[var(--muted)] underline-offset-4 hover:underline">
          پاک کردن همه
        </Link>
      </li>
    </ul>
  );
}
