"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await fetch("/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, newPassword })
      });
      const j = await r.json();
      if (!r.ok || !j.success) { setError(j.error?.message || "بازیابی رمز ناموفق بود"); return; }
      setDone(true);
      setTimeout(() => router.push("/account"), 1500);
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }

  if (done) return <div className="mt-7 rounded-xl bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-300">رمز عبور با موفقیت تغییر کرد. در حال انتقال به صفحه ورود...</div>;

  return (
    <form onSubmit={submit} className="mt-7 space-y-4">
      {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
      <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="شماره موبایل" inputMode="numeric" />
      <input required value={code} onChange={(e) => setCode(e.target.value)} className="input" placeholder="کد بازیابی (از پشتیبانی دریافت کنید)" />
      <input required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input" type="password" placeholder="رمز عبور جدید (حداقل ۸ کاراکتر)" minLength={8} />
      <button disabled={loading} className="btn btn-primary w-full disabled:opacity-60" type="submit">{loading ? "در حال ثبت..." : "تغییر رمز عبور"}</button>
    </form>
  );
}
