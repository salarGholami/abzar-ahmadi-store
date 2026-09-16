"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import type { Session } from "@/lib/auth";

const roleLabel: Record<string, string> = {
  ADMIN: "مدیر سیستم", SELLER: "فروشنده", ACCOUNTANT: "حسابدار", WAREHOUSE: "انباردار", CUSTOMER: "مشتری"
};

export default function AccountOverview({ session }: { session: Pick<Session, "id" | "name" | "phone" | "role"> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const staffRoles = ["ADMIN", "SELLER", "ACCOUNTANT", "WAREHOUSE"];

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
      <div className="mt-1 text-sm text-[var(--muted)]">{session.phone} · {roleLabel[session.role] || session.role}</div>
      <div className="mt-7 space-y-2">
        {staffRoles.includes(session.role) && (
          <button onClick={() => router.push("/dashboard")} className="btn btn-secondary w-full" type="button">ورود به پنل مدیریت</button>
        )}
        <button onClick={logout} disabled={loading} className="btn btn-danger w-full disabled:opacity-60" type="button"><LogOut size={17} />{loading ? "در حال خروج..." : "خروج از حساب"}</button>
      </div>
    </div>
  );
}
