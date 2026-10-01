import type { ReactNode } from "react";

type FilterGroupProps = { title: string; children: ReactNode; defaultOpen?: boolean };

/** Native <details>: collapsible with zero client JS. */
export default function FilterGroup({ title, children, defaultOpen = true }: FilterGroupProps) {
  return (
    <details open={defaultOpen} className="group border-b border-[var(--border)] py-4 first:pt-0 last:border-0">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-black text-[var(--text)] [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden className="text-xs text-[var(--muted)] transition-transform group-open:rotate-180">▾</span>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}
