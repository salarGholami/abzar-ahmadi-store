"use client";
import { Menu, Bell, Search } from "lucide-react";
import { useState } from "react";
import Sidebar from "./Sidebar";
import ThemeToggle from "../ui/ThemeToggle";
import type { Session } from "@/lib/auth";

export default function DashboardShell({ children, user }: { children: React.ReactNode; user: Pick<Session, "id" | "name" | "role" | "permissions"> }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar open={open} onClose={() => setOpen(false)} user={user} />
      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/30 lg:hidden" />}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_90%,transparent)] px-4 backdrop-blur-xl lg:px-7">
          <button onClick={() => setOpen(true)} className="btn btn-secondary !p-2 lg:hidden" type="button"><Menu /></button>
          <div className="hidden items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted)] md:flex md:w-80"><Search size={17} />جستجو <kbd className="mr-auto rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px]">Ctrl K</kbd></div>
          <div className="mr-auto flex gap-2">
            <button className="btn btn-secondary !p-2.5" type="button"><Bell size={18} /></button>
            <ThemeToggle />
          </div>
        </header>
        <main className="p-4 lg:p-7">{children}</main>
      </div>
    </div>
  );
}
