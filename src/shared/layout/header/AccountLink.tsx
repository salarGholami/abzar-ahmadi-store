"use client";

import { UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type MeResponse = { success?: boolean; data?: { name?: string | null } | null };

/** Small client island: the rest of the header stays a Server Component. */
export default function AccountLink() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/me", { cache: "no-store", signal: controller.signal })
      .then((response) => (response.ok ? (response.json() as Promise<MeResponse>) : null))
      .then((json) => setName(json?.success ? json.data?.name ?? null : null))
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  return (
    <Link
      href="/account"
      aria-label={name ? `حساب ${name}` : "ورود یا ثبت‌نام"}
      className="group flex h-11 items-center gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-2.5 transition hover:border-[var(--primary)]/30 hover:bg-[var(--surface)] active:scale-[0.98] lg:h-[52px] lg:px-3"
    >
      <span className="grid size-8 place-items-center rounded-xl bg-[var(--surface)] text-[var(--muted)] transition group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)]">
        <UserRound size={16} aria-hidden />
      </span>
      <span className="hidden xl:block">
        <span className="block max-w-[100px] truncate text-[10px] font-black text-[var(--text)]">{name ?? "حساب کاربری"}</span>
        <span className="mt-0.5 block text-[9px] text-[var(--muted)]">{name ? "مشاهده حساب" : "ورود / ثبت‌نام"}</span>
      </span>
    </Link>
  );
}
