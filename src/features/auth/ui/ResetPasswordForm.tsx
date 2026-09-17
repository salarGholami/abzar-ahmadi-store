"use client";

import { FormEvent, useState } from "react";
import Input from "@/shared/ui/Input";
import { useResetPassword } from "../hooks";

export default function ResetPasswordForm() {
  const reset = useResetPassword();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await reset.mutateAsync({ phone, password });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="شماره موبایل" required />
      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="رمز عبور جدید" required />
      {reset.isSuccess ? <p className="text-sm text-emerald-600">رمز عبور تغییر کرد.</p> : null}
      {reset.error ? <p className="text-sm text-red-500">{reset.error.message}</p> : null}
      <button className="btn btn-primary w-full" disabled={reset.isPending}>
        {reset.isPending ? "در حال ثبت..." : "تغییر رمز"}
      </button>
    </form>
  );
}
