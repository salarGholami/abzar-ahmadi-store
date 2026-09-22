"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../ui/Input";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, password }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error?.message || "ثبت‌نام ناموفق بود");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4 sm:mt-7">
      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <Input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="نام و نام خانوادگی"
        className="text-xs"
      />

      <Input
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="شماره موبایل (مثال: 0912xxxxxxx)"
        inputMode="numeric"
        className="text-xs"
      />

      <Input
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="رمز عبور (حداقل ۸ کاراکتر)"
        minLength={8}
        className="text-xs"
      />

      <button
        disabled={loading}
        className="btn btn-primary w-full disabled:opacity-60"
        type="submit"
      >
        {loading ? "در حال ثبت‌نام..." : "ایجاد حساب"}
      </button>
    </form>
  );
}
