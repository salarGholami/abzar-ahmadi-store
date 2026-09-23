"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  Store,
  X,
  type LucideIcon,
} from "lucide-react";

export type PortalNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type PortalNavGroup = {
  label: string;
  items: PortalNavItem[];
};

export default function PortalSidebar({
  open,
  onClose,
  userName,
  roleLabel,
  brandTitle,
  brandSubtitle,
  groups,
  homeHref,
}: {
  open: boolean;
  onClose: () => void;
  userName: string;
  roleLabel: string;
  brandTitle: string;
  brandSubtitle: string;
  groups: PortalNavGroup[];
  homeHref: string;
}) {
  const pathname = usePathname();

  function active(href: string) {
    if (href === homeHref) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside
      className={`
        fixed inset-y-0 right-0 z-[100] flex w-[292px] flex-col border-l border-[var(--border)]
        bg-[var(--surface)] transition-transform duration-200
        lg:translate-x-0
        ${open ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
      `}
    >
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-4">
        <Link href={homeHref} onClick={onClose} className="flex min-w-0 flex-1 items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-[var(--primary)] text-white">
            <Store size={22} />
          </span>
          <span className="min-w-0">
            <strong className="block truncate text-sm font-black">{brandTitle}</strong>
            <small className="block text-xs text-[var(--muted)]">{brandSubtitle}</small>
          </span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-10 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] lg:hidden"
          aria-label="بستن"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mx-3 mt-4 shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
        <div className="text-[10px] font-bold text-[var(--muted)]">{roleLabel}</div>
        <div className="mt-1 truncate text-sm font-black">{userName}</div>
      </div>

      <nav className="mt-4 flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="mb-2 px-2 text-[10px] font-bold tracking-wide text-[var(--muted)]">
              {group.label}
            </div>
            <div className="space-y-1">
              {group.items.map(({ href, label, icon: Icon }) => {
                const isActive = active(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition
                      ${
                        isActive
                          ? "bg-[var(--primary)] text-white shadow-sm"
                          : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                      }
                    `}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--border)] p-3">
        <Link
          href="/"
          className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
        >
          <Store size={18} />
          بازگشت به فروشگاه
        </Link>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} />
            خروج از حساب
          </button>
        </form>
      </div>
    </aside>
  );
}
