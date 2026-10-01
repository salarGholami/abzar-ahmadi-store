import Link from "next/link";

type FilterOptionProps = {
  href: string;
  label: string;
  active: boolean;
  count?: number;
};

export default function FilterOption({ href, label, active, count }: FilterOptionProps) {
  return (
    <Link
      href={href}
      prefetch={false}
      rel="nofollow"
      aria-current={active ? "true" : undefined}
      className={[
        "flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-bold transition",
        active
          ? "bg-[var(--primary)]/10 text-[var(--primary)]"
          : "text-[var(--text)] hover:bg-[var(--surface-2)]",
      ].join(" ")}
    >
      <span className="min-w-0 truncate">{label}</span>
      {count !== undefined ? (
        <span className="shrink-0 text-[10px] font-medium text-[var(--muted)]">{count.toLocaleString("fa-IR")}</span>
      ) : null}
    </Link>
  );
}
