import type { ReactNode } from "react";

export default function StaticPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <main dir="rtl" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-black">{title}</h1>
      {intro && <p className="mt-3 text-sm leading-8 text-[var(--muted)]">{intro}</p>}
      <div className="mt-8 space-y-5 text-sm leading-8">{children}</div>
    </main>
  );
}
