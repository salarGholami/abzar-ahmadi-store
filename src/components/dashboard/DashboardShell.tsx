"use client";

import { Bell, Command, Menu, Search } from "lucide-react";
import { useState } from "react";
import Sidebar from "./Sidebar";
import ThemeToggle from "../ui/ThemeToggle";
import type { Session } from "@/lib/auth";

export default function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: Pick<Session, "id" | "name" | "role" | "permissions">;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      {/* اورلی فقط موبایل */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="بستن منوی کناری"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm lg:hidden"
        />
      )}

      <div className="min-w-0 transition-[margin] duration-200 lg:mr-[292px]">
        <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] backdrop-blur-xl">
          <div className="flex min-h-[72px] items-center gap-3 px-4 lg:px-7">
            {/* همبرگر فقط موبایل — روی دسکتاپ کاملاً مخفی */}
            <button
              type="button"
              onClick={() => setSidebarOpen((value) => !value)}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] lg:!hidden"
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
              <button
                className="btn btn-secondary relative !size-11 !p-0"
                type="button"
                aria-label="اعلان‌ها"
              >
                <Bell size={18} />
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[var(--danger)]" />
              </button>
              <ThemeToggle />
              <div className="hidden size-10 place-items-center rounded-xl bg-[var(--primary)] text-sm font-black text-white sm:grid">
                {user.name?.charAt(0) || "م"}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-7">{children}</main>
      </div>
    </div>
  );
}
