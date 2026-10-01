import Link from "next/link";
import { PackageSearch } from "lucide-react";

export default function CatalogEmpty({ resetHref }: { resetHref: string }) {
  return (
    <div className="grid place-items-center rounded-[22px] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-[var(--surface-2)] text-[var(--muted)]">
        <PackageSearch size={28} />
      </span>
      <h2 className="mt-5 text-lg font-black">کالایی پیدا نشد</h2>
      <p className="mt-2 max-w-sm text-sm leading-7 text-[var(--muted)]">
        فیلترها را تغییر بدهید یا عبارت جستجو را ساده‌تر کنید.
      </p>
      <Link href={resetHref} className="mt-6 rounded-xl bg-[var(--primary)] px-5 py-3 text-xs font-black text-white transition hover:bg-[var(--primary-2)]">
        نمایش همه کالاها
      </Link>
    </div>
  );
}
