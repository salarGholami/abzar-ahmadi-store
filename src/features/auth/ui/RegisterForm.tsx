"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/shared/ui/Input";
import { useRegister } from "../hooks";

export default function RegisterForm() {
  const router = useRouter();
  const register = useRegister();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "SUPPLIER">("CUSTOMER");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await register.mutateAsync({ name, phone, password, role });
    router.push("/account");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="نام و نام خانوادگی" required />
      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="شماره موبایل" required />
      <select className="input w-full" value={role} onChange={(e) => setRole(e.target.value as "CUSTOMER" | "SUPPLIER")}><option value="CUSTOMER">مشتری</option><option value="SUPPLIER">تأمین‌کننده</option></select>
      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="رمز عبور" required />
      {register.error ? <p className="text-sm text-red-500">{register.error.message}</p> : null}
      <button className="btn btn-primary w-full" disabled={register.isPending}>
        {register.isPending ? "در حال ساخت حساب..." : "ثبت‌نام"}
      </button>
    </form>
  );
}
