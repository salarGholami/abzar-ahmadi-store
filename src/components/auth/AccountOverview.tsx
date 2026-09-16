"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import type { Session } from "@/lib/auth";

export default function AccountOverview({ session }: { session: Pick<Session, "id" | "name" | "phone" | "role"> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <div className="text-sm font-bold text-[var(--primary)]">حساب کاربری</div>
      <h1 className="mt-2 text-2xl font-black">{session.name}</h1>
      <div className="mt-1 text-sm text-[var(--muted)]">{session.phone}</div>
      <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-2 text-xs font-bold text-[var(--primary)]"><ShieldCheck size={15} />{session.role === "ADMIN" ? "مدیر سیستم" : "مشتری"}</div>
      <div className="mt-7 space-y-2">
        {session.role === "ADMIN" && <button onClick={() => router.push("/dashboard")} className="btn btn-primary w-full" type="button">ورود به پنل مدیریت</button>}
        <button onClick={logout} disabled={loading} className="btn btn-danger w-full disabled:opacity-60" type="button"><LogOut size={17} />{loading ? "در حال خروج..." : "خروج از حساب"}</button>
      </div>
    </div>
  );
}
