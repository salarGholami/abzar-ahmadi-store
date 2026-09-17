"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/shared/ui/Input";
import { useLogin } from "../hooks";

export default function LoginForm() {
  const router = useRouter();
  const login = useLogin();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await login.mutateAsync({ phone, password });
    router.push("/account");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="شماره موبایل" required />
      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="رمز عبور" required />
      {login.error ? <p className="text-sm text-red-500">{login.error.message}</p> : null}
      <button className="btn btn-primary w-full" disabled={login.isPending}>
        {login.isPending ? "در حال ورود..." : "ورود"}
      </button>
    </form>
  );
}
