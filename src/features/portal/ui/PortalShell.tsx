"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "@/shared/ui/ThemeToggle";
import PortalSidebar, { type PortalNavGroup } from "./PortalSidebar";

export default function PortalShell({
  children,
  userName,
  roleLabel,
  brandTitle,
  brandSubtitle,
  groups,
  homeHref,
}: {
  children: React.ReactNode;
  userName: string;
  roleLabel: string;
  brandTitle: string;
  brandSubtitle: string;
  groups: PortalNavGroup[];
  homeHref: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div dir="rtl" className="flex min-h-dvh bg-[var(--bg)]">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="بستن منوی کناری"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-[90] cursor-default bg-black/45 backdrop-blur-sm lg:hidden"
        />
      )}

      <PortalSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={userName}
        roleLabel={roleLabel}
        brandTitle={brandTitle}
        brandSubtitle={brandSubtitle}
        groups={groups}
        homeHref={homeHref}
      />

      <div className="min-w-0 flex-1 lg:mr-[292px]">
        <header className="sticky top-0 z-[80] border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-xl">
          <div className="flex min-h-[72px] items-center gap-3 px-3 sm:px-4 lg:px-7">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="منوی کناری"
              className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-95 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div className="hidden h-11 max-w-xl flex-1 items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm text-[var(--muted)] md:flex">
              <span className="font-semibold text-[var(--text)]">{roleLabel}</span>
              <span className="text-[var(--muted)]">·</span>
              <span>{userName}</span>
            </div>

            <div className="mr-auto flex items-center gap-2">
              <ThemeToggle />
              <div
                className="hidden size-10 place-items-center rounded-xl bg-[var(--primary)] text-sm font-black text-white sm:grid"
                title={userName}
              >
                {(userName || "ک").charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="w-full min-w-0 px-3 py-4 sm:px-4 sm:py-5 lg:px-5 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
