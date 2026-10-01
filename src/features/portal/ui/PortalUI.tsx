import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[var(--text)]">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-7 text-[var(--muted)]">{description}</p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}

export function StatCard({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string;
  note?: string;
  icon: LucideIcon;
}) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-[var(--muted)]">{label}</span>
        <span className="rounded-xl bg-[var(--surface-2)] p-2.5 text-[var(--primary)]">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-black tabular-nums text-[var(--text)] sm:text-3xl">{value}</p>
      {note ? <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{note}</p> : null}
    </article>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3 sm:px-5">
          {title ? <h2 className="font-black text-[var(--text)]">{title}</h2> : <span />}
          {action}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-[var(--surface-2)] px-4 py-10 text-center text-sm text-[var(--muted)]">
      {message}
    </div>
  );
}

export function QuickLink({
  href,
  title,
  desc,
  icon: Icon,
}: {
  href: string;
  title: string;
  desc: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--primary)]"
    >
      <span className="rounded-xl bg-[var(--surface-2)] p-3 text-[var(--primary)]">
        <Icon size={18} />
      </span>
      <span>
        <strong className="block text-sm text-[var(--text)]">{title}</strong>
        <small className="mt-1 block leading-5 text-[var(--muted)]">{desc}</small>
      </span>
    </Link>
  );
}

export function money(n: number) {
  return Number(n || 0).toLocaleString("fa-IR");
}

export function faDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fa-IR", { day: "numeric", month: "long", year: "numeric" });
}
