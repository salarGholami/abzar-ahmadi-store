"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "@/shared/ui/Input";
import { useLogin } from "../hooks";

function destinationForRole(role?: string) {
  if (role === "ADMIN") return "/dashboard";
  if (role === "SUPPLIER") return "/supplier";
  if (role === "CUSTOMER") return "/customer";
  return "/account";
}

export default function LoginForm() {
  const router = useRouter();
  const login = useLogin();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const result = await login.mutateAsync({ phone, password });
      const role = (result as { user?: { role?: string } })?.user?.role;
      router.push(destinationForRole(role));
      router.refresh();
    } catch {
      // Domain error is exposed via login.error; avoid unhandled rejection.
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="شماره موبایل" required />
      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="رمز عبور" required />
      <div className="flex items-center justify-between gap-3 text-xs">
        <Link href="/account/reset" className="font-bold text-[var(--primary)] hover:underline">رمز عبور را فراموش کرده‌اید؟</Link>
        <span className="text-[var(--muted)]">بازیابی برای هر سه نقش</span>
      </div>
      {login.error ? <p className="text-sm text-red-500">{login.error.message}</p> : null}
      <button className="btn btn-primary w-full" disabled={login.isPending}>
        {login.isPending ? "در حال ورود..." : "ورود"}
      </button>
    </form>
  );
}
