"use client";

import { useMemo, useState } from "react";
import {
  KeyRound,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserRoundCog,
  Users,
  X,
} from "lucide-react";
import { useAdminUsers, useUserAccountMutation } from "@/features/admin/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/features/admin/hooks";

type Permission =
  | "settings"
  | "products"
  | "sales"
  | "purchases"
  | "customers"
  | "suppliers"
  | "finance"
  | "reports"
  | "inventory"
  | "dashboard.read";

type UserRow = {
  id: string;
  name: string;
  phone: string;
  role: "ADMIN" | "SUPPLIER" | "CUSTOMER";
  isOwner?: boolean;
  supplierId?: string;
  permissions?: Permission[];
};

const permissionOptions: readonly (readonly [Permission, string])[] = [
  ["dashboard.read", "داشبورد"],
  ["products", "محصولات و کاتالوگ"],
  ["customers", "مشتریان"],
  ["suppliers", "تأمین‌کنندگان"],
  ["sales", "فروش و سفارشات"],
  ["purchases", "خریدها"],
  ["inventory", "انبار"],
  ["finance", "مالی"],
  ["reports", "گزارش‌ها"],
  ["settings", "تنظیمات فروشگاه"],
] as const;

const roleLabels: Record<UserRow["role"], string> = {
  ADMIN: "مدیر فروشگاه",
  SUPPLIER: "تأمین‌کننده",
  CUSTOMER: "مشتری",
};

export default function UsersPage() {
  const query = useAdminUsers();
  const mutation = useUserAccountMutation();
  const client = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [form, setForm] = useState<{
    name: string;
    phone: string;
    password: string;
    role: UserRow["role"];
    permissions: Permission[];
  }>({
    name: "",
    phone: "",
    password: "",
    role: "ADMIN",
    permissions: permissionOptions.map(([key]) => key),
  });

  const users = useMemo(() => (query.data ?? []) as UserRow[], [query.data]);

  function resetForm() {
    setForm({
      name: "",
      phone: "",
      password: "",
      role: "ADMIN",
      permissions: permissionOptions.map(([key]) => key),
    });
    setEditing(null);
  }

  function edit(user: UserRow) {
    setEditing(user);
    setForm({
      name: user.name,
      phone: user.phone,
      password: "",
      role: user.role,
      permissions:
        user.role === "ADMIN"
          ? user.permissions ?? []
          : [],
    });
    setOpen(true);
  }

  async function save() {
    await mutation.mutateAsync({
      action: editing ? "update" : "create",
      id: editing?.id,
      payload: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.role,
        permissions: form.permissions,
      },
    });

    setOpen(false);
    resetForm();
    await client.invalidateQueries({ queryKey: adminKeys.users });
  }

  async function remove(user: UserRow) {
    if (!window.confirm(`حذف حساب «${user.name}» انجام شود؟`)) return;

    await mutation.mutateAsync({
      action: "delete",
      id: user.id,
    });
  }

  function togglePermission(permission: Permission) {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission],
    }));
  }

  return (
    <main dir="rtl" className="mx-auto w-full max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <UserRoundCog size={15} />
          <span>مدیریت فروشگاه</span>
          <span>/</span>
          <strong className="text-[var(--text)]">کاربران و دسترسی‌ها</strong>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="btn btn-secondary"
            disabled={query.isFetching}
          >
            <RefreshCw size={15} className={query.isFetching ? "animate-spin" : ""} />
            بروزرسانی
          </button>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={15} />
            افزودن مدیر
          </button>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-2xl bg-[#18232d] p-5 text-white sm:p-6">
        <div className="absolute -left-20 -top-28 size-80 rounded-full bg-[#00adb5]/15 blur-3xl" />
        <div className="relative">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold text-[#8adfe1]">
            <ShieldCheck size={15} />
            مرکز دسترسی
          </div>
          <h1 className="text-2xl font-black sm:text-3xl">کاربران و دسترسی‌های فروشگاه</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            فقط مدیر اصلی می‌تواند حساب مدیر ایجاد کند، سطح دسترسی آن را تغییر دهد یا حساب مدیریتی را حذف کند.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs text-[var(--muted)]">کل حساب‌ها</p>
          <p className="mt-2 text-2xl font-black">{users.length.toLocaleString("fa-IR")}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs text-[var(--muted)]">مدیران</p>
          <p className="mt-2 text-2xl font-black">{users.filter((u) => u.role === "ADMIN").length.toLocaleString("fa-IR")}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs text-[var(--muted)]">تأمین‌کنندگان</p>
          <p className="mt-2 text-2xl font-black">{users.filter((u) => u.role === "SUPPLIER").length.toLocaleString("fa-IR")}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-extrabold">
            <Users size={16} className="text-[var(--primary)]" />
            حساب‌های ثبت‌شده
          </div>
        </div>

        {query.isLoading ? (
          <div className="p-12 text-center text-sm text-[var(--muted)]">در حال دریافت اطلاعات...</div>
        ) : query.error ? (
          <div className="p-12 text-center text-sm text-red-600">دریافت کاربران ناموفق بود.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-right text-sm">
              <thead className="text-xs text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">کاربر</th>
                  <th className="px-4 py-3">شماره</th>
                  <th className="px-4 py-3">نقش</th>
                  <th className="px-4 py-3">دسترسی</th>
                  <th className="px-4 py-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3.5">
                      <div className="font-bold">{user.name}</div>
                      {user.isOwner ? (
                        <span className="mt-1 inline-flex rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-600">
                          مالک اصلی
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs">{user.phone}</td>
                    <td className="px-4 py-3.5">{roleLabels[user.role]}</td>
                    <td className="px-4 py-3.5 text-xs text-[var(--muted)]">
                      {user.role === "ADMIN"
                        ? `${(user.permissions?.length ?? 0).toLocaleString("fa-IR")} دسترسی`
                        : user.role === "SUPPLIER"
                          ? "پنل اختصاصی تأمین‌کننده"
                          : "حساب مشتری"}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-center gap-2">
                        {!user.isOwner ? (
                          <>
                            <button type="button" onClick={() => edit(user)} className="btn btn-secondary !p-2">
                              <KeyRound size={15} />
                            </button>
                            <button type="button" onClick={() => void remove(user)} className="btn btn-danger !p-2" disabled={mutation.isPending}>
                              <Trash2 size={15} />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-[var(--muted)]">محافظت‌شده</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {open ? (
        <div className="fixed inset-0 z-[200] grid place-items-center bg-black/50 p-3 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <div>
                <h2 className="font-black">{editing ? "ویرایش حساب" : "افزودن حساب مدیر"}</h2>
                <p className="mt-1 text-[10px] text-[var(--muted)]">حساب مالک اصلی قابل ویرایش نیست.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)}><X size={18} /></button>
            </div>

            <div className="max-h-[75dvh] space-y-4 overflow-y-auto p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-xs font-bold text-[var(--muted)]">نام</span>
                  <input className="input w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-bold text-[var(--muted)]">شماره موبایل</span>
                  <input className="input w-full" inputMode="tel" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </label>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5">
                <div className="text-[10px] font-bold text-[var(--muted)]">نوع حساب</div>
                <div className="mt-1 text-sm font-black">مدیر فروشگاه</div>
                <div className="mt-1 text-[10px] text-[var(--muted)]">
                  حساب‌های مشتری و تأمین‌کننده از مسیرهای اختصاصی خودشان مدیریت می‌شوند.
                </div>
              </div>

              <label className="space-y-1.5">
                <span className="text-xs font-bold text-[var(--muted)]">رمز عبور {editing ? "(اختیاری)" : ""}</span>
                <input className="input w-full" type="password" dir="ltr" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </label>

              {form.role === "ADMIN" ? (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                  <div className="mb-3 text-xs font-black">سطح دسترسی مدیر</div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {permissionOptions.map(([key, label]) => (
                      <label key={key} className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-bold">
                        <input type="checkbox" checked={form.permissions.includes(key)} onChange={() => togglePermission(key)} />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                disabled={mutation.isPending || !form.name.trim() || !form.phone.trim() || (!editing && form.password.length < 8)}
                onClick={() => void save()}
                className="btn btn-primary w-full disabled:opacity-50"
              >
                {mutation.isPending ? "در حال ذخیره..." : editing ? "ذخیره تغییرات" : "ایجاد حساب"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
