import Link from "next/link";
import { ArrowLeft, Drill, Flame, HardHat, Hammer, Scissors, Wrench } from "lucide-react";

const intents = [
  { label: "سوراخ‌کاری", icon: Drill, query: "دریل" },
  { label: "پیچ‌بندی", icon: Wrench, query: "پیچ" },
  { label: "برش و فرز", icon: Scissors, query: "فرز" },
  { label: "جوشکاری", icon: Flame, query: "جوش" },
  { label: "ابزار دستی", icon: Hammer, query: "ابزار دستی" },
  { label: "ایمنی کار", icon: HardHat, query: "ایمنی" },
] as const;

export default function ToolFinder() {
  return (
    <section className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] sm:rounded-[28px]">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:p-9">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1.5 text-[10px] font-black text-[var(--primary)]">
              <Wrench size={13} />
              راهنمای انتخاب ابزار
            </div>
            <h2 className="text-xl font-black leading-8 sm:text-2xl">ابزار را بر اساس کاری که انجام می‌دهی پیدا کن</h2>
            <p className="mt-2 max-w-xl text-xs leading-6 text-[var(--muted)] sm:text-sm">
              به‌جای مرور ده‌ها صفحه، کاربردت را انتخاب کن تا مستقیم به محصولات مرتبط برسید.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {intents.map(({ label, icon: Icon, query }) => (
              <Link
                key={label}
                href={`/products?q=${encodeURIComponent(query)}`}
                className="group flex min-h-20 items-center justify-between gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3 transition hover:-translate-y-0.5 hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary)]/15"
              >
                <span className="flex items-center gap-2">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                    <Icon size={17} />
                  </span>
                  <span className="text-[11px] font-black">{label}</span>
                </span>
                <ArrowLeft size={14} className="shrink-0 text-[var(--muted)] transition group-hover:-translate-x-0.5 group-hover:text-[var(--primary)]" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
