"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "@/shared/ui/Input";
import { useResetPassword } from "../hooks";

export default function ResetPasswordForm() {
  const router = useRouter();
  const reset = useResetPassword();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    if (newPassword.length < 8) {
      setLocalError("رمز جدید باید حداقل ۸ کاراکتر باشد");
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError("تکرار رمز با رمز جدید یکسان نیست");
      return;
    }

    try {
      await reset.mutateAsync({ phone, code, newPassword });
      // brief success state then send user to login
      setTimeout(() => {
        router.push("/account");
        router.refresh();
      }, 1200);
    } catch {
      // error surface via reset.error
    }
  }

  const errorMessage = localError || (reset.error ? reset.error.message : null);

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <Input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="شماره موبایل (۰۹xxxxxxxxx)"
        required
        autoComplete="tel"
      />
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="کد بازیابی"
        required
        autoComplete="one-time-code"
      />
      <Input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="رمز عبور جدید (حداقل ۸ کاراکتر)"
        required
        autoComplete="new-password"
      />
      <Input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="تکرار رمز عبور جدید"
        required
        autoComplete="new-password"
      />

      {reset.isSuccess ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
          رمز عبور با موفقیت تغییر کرد. در حال انتقال به صفحه ورود…
        </p>
      ) : null}

      {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}

      <button className="btn btn-primary w-full" disabled={reset.isPending || reset.isSuccess}>
        {reset.isPending ? "در حال ثبت..." : reset.isSuccess ? "انجام شد" : "ثبت رمز جدید"}
      </button>

      <div className="pt-1 text-center text-xs text-[var(--muted)]">
        <Link href="/account" className="font-bold text-[var(--primary)] hover:underline">
          بازگشت به ورود
        </Link>
      </div>
    </form>
  );
}
