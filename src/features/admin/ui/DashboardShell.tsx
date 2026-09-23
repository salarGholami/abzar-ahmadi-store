"use client";

import { Command, Menu, Search } from "lucide-react";
import { useState } from "react";

import Sidebar from "./Sidebar";
import ThemeToggle from "@/shared/ui/ThemeToggle";
import NotificationCenter from "@/app/dashboard/NotificationCenter";
import type { Session } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/roles";

export default function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: Pick<
    Session,
    "id" | "name" | "phone" | "role" | "permissions" | "supplierId" | "isOwner"
  >;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const roleLabel = user.role === "ADMIN" && user.isOwner
    ? "مدیر اصلی فروشگاه"
    : ROLE_LABEL[user.role];

  return (
    <div
      dir="rtl"
      data-dashboard="true" className="flex min-h-dvh w-full max-w-full overflow-x-clip bg-[var(--bg)]"
    >
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="بستن منوی کناری"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-[90] cursor-default bg-black/45 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <div className="min-w-0 w-full flex-1 lg:mr-[292px]">
        <header className="sticky top-0 z-[80] border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-xl">
          <div className="flex min-h-[72px] w-full items-center gap-3 px-3 sm:px-4 lg:px-7">
            <button
              type="button"
              onClick={() => setSidebarOpen((value) => !value)}
              aria-label="باز و بسته کردن منوی کناری"
              aria-expanded={sidebarOpen}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-95 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div className="hidden h-11 max-w-xl flex-1 items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm text-[var(--muted)] md:flex">
              <Search size={17} />
              <span>جستجوی سریع در محصولات، مشتریان و فاکتورها</span>
              <span className="mr-auto inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-1.5 py-1 text-[10px]">
                <Command size={10} />K
              </span>
            </div>

            <div className="mr-auto flex min-w-0 items-center gap-2">
              <span className="hidden max-w-44 truncate rounded-full bg-[var(--primary)]/10 px-3 py-2 text-[10px] font-black text-[var(--primary)] sm:inline-flex">
                {roleLabel}
              </span>

              {user.role === "ADMIN" ? <NotificationCenter /> : null}
              <ThemeToggle />

              <div
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--primary)] text-sm font-black text-white"
                title={user.name}
              >
                {user.name?.charAt(0) || "م"}
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
