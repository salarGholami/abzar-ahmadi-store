"use client";

import { Command, Menu, Search } from "lucide-react";
import { useState } from "react";

import Sidebar from "./Sidebar";
import ThemeToggle from "../ui/ThemeToggle";
import NotificationCenter from "@/app/dashboard/NotificationCenter";

import type { Session } from "@/lib/auth";

export default function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: Pick<Session, "id" | "name" | "role" | "permissions">;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function toggleSidebar() {
    setSidebarOpen((current) => !current);
  }

  return (
    <div
      dir="rtl"
      className="
        flex
        h-dvh
        min-h-0
        overflow-hidden
        bg-[var(--bg)]
      "
    >
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="بستن منوی کناری"
          onClick={closeSidebar}
          className="
            fixed
            inset-0
            z-[90]
            cursor-default
            bg-black/45
            backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={closeSidebar} user={user} />

      {/* Main application */}
      <div
        className="
          flex
          min-h-0
          min-w-0
          flex-1
          flex-col
          overflow-hidden
          transition-[margin]
          duration-200
          lg:mr-[292px]
        "
      >
        {/* Header */}
        <header
          className="
            relative
            z-[80]
            shrink-0
            border-b
            border-[var(--border)]
            bg-[color-mix(in_srgb,var(--surface)_92%,transparent)]
            backdrop-blur-xl
          "
        >
          <div className="flex min-h-[72px] items-center gap-3 px-3 sm:px-4 lg:px-7">
            {/* Mobile menu */}
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="باز و بسته کردن منوی کناری"
              aria-expanded={sidebarOpen}
              className="
                inline-flex
                size-11
                shrink-0
                cursor-pointer
                items-center
                justify-center
                rounded-[14px]
                border
                border-[var(--border)]
                bg-[var(--surface)]
                text-[var(--text)]
                transition
                hover:border-[var(--primary)]
                hover:text-[var(--primary)]
                active:scale-95
                lg:hidden
              "
            >
              <Menu size={20} />
            </button>

            {/* Search */}
            <div
              className="
                hidden
                h-11
                max-w-xl
                flex-1
                items-center
                gap-2
                rounded-2xl
                border
                border-[var(--border)]
                bg-[var(--surface-2)]
                px-3
                text-sm
                text-[var(--muted)]
                md:flex
              "
            >
              <Search size={17} />

              <span>جستجوی سریع در محصولات، مشتریان و فاکتورها</span>

              <span
                className="
                  mr-auto
                  inline-flex
                  items-center
                  gap-1
                  rounded-lg
                  border
                  border-[var(--border)]
                  bg-[var(--surface)]
                  px-1.5
                  py-1
                  text-[10px]
                "
              >
                <Command size={10} />K
              </span>
            </div>

            {/* Header actions */}
            <div className="mr-auto flex items-center gap-2">
              <NotificationCenter />

              <ThemeToggle />

              <div
                className="
                  hidden
                  size-10
                  place-items-center
                  rounded-xl
                  bg-[var(--primary)]
                  text-sm
                  font-black
                  text-white
                  sm:grid
                "
                aria-label={user.name}
                title={user.name}
              >
                {user.name?.charAt(0) || "م"}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          className="
            min-h-0
            flex-1
            overflow-x-hidden
            overflow-y-auto
            overscroll-y-contain
            p-3
            sm:p-4
            lg:overflow-hidden
            lg:p-5
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
}
