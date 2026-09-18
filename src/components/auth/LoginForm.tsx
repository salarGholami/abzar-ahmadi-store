"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password })
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error?.message || "ورود ناموفق بود");
        return;
      }

      router.push(params.get("next") || (result.data.role === "ADMIN" ? "/dashboard" : "/"));
      router.refresh();
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-7 space-y-4">
      {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
      <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="شماره موبایل" inputMode="numeric" />
      <input required value={password} onChange={(e) => setPassword(e.target.value)} className="input" type="password" placeholder="رمز عبور" />
      <button disabled={loading} className="btn btn-primary w-full disabled:opacity-60" type="submit">{loading ? "در حال ورود..." : "ورود"}</button>
      <Link href="/account/reset" className="block text-center text-xs font-bold text-[var(--muted)] hover:text-[var(--primary)]">رمز عبور را فراموش کرده‌اید؟</Link>
    </form>
  );
}
