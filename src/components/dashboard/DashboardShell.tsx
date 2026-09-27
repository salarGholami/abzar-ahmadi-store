"use client";

import { Command, Menu, Search } from "lucide-react";
import { useState } from "react";

import Sidebar from "./Sidebar";
import ThemeToggle from "../ui/ThemeToggle";

import type { Session } from "@/lib/auth";
import NotificationCenter from "@/app/dashboard/NotificationCenter";

export default function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: Pick<Session, "id" | "name" | "role" | "permissions">;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-[var(--bg)]">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      {sidebarOpen && (
        <button
          type="button"
          aria-label="بستن منوی کناری"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-[100] cursor-default bg-black/45 backdrop-blur-sm lg:hidden"
        />
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden transition-[margin] duration-200 lg:mr-[292px]">
        <header className="shrink-0 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-xl">
          <div className="flex min-h-[72px] items-center gap-3 px-3 sm:px-4 lg:px-7">
            <button
              type="button"
              onClick={() => setSidebarOpen((value) => !value)}
              className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-95 lg:hidden"
              aria-label="باز و بسته کردن منوی کناری"
              aria-expanded={sidebarOpen}
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

            <div className="mr-auto flex items-center gap-2">
              <NotificationCenter />
              <ThemeToggle />

              <div className="hidden size-10 place-items-center rounded-xl bg-[var(--primary)] text-sm font-black text-white sm:grid">
                {user.name?.charAt(0) || "م"}
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-hidden p-3 sm:p-4 lg:p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
