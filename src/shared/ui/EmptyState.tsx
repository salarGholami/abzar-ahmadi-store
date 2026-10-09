import Link from "next/link";
import type { ReactNode } from "react";
import { PackageSearch } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
};

export default function EmptyState({
  title,
  description,
  icon,
  actionHref,
  actionLabel,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`grid place-items-center rounded-[22px] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center sm:py-16 ${className}`}
      role="status"
    >
      <span className="grid size-16 place-items-center rounded-2xl bg-[var(--surface-2)] text-[var(--muted)]">
        {icon ?? <PackageSearch size={28} aria-hidden />}
      </span>
      <h2 className="mt-5 text-lg font-extrabold text-[var(--text)]">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-7 text-[var(--muted)]">
          {description}
        </p>
      ) : null}
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="btn btn-primary mt-6 px-5 py-3 text-sm font-extrabold"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
