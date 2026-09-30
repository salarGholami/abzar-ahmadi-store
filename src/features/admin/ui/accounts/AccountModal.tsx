"use client";

import { useState } from "react";
import Modal from "@/shared/ui/Modal";
import type { PublicRole } from "@/lib/roles";
import type { LoginAccount, ProfileRow } from "./account.types";
import { useUserAccountMutation } from "@/features/admin/hooks";

type Props = {
  role: PublicRole;
  row: ProfileRow;
  account: LoginAccount | null;
  onClose: () => void;
  onDone: () => void;
};


export default function AccountModal({ role, row, account, onClose, onDone }: Props) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const crud = useUserAccountMutation();

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await action();
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "عملیات انجام نشد");
    } finally {
      setBusy(false);
    }
  }

  function save() {
    if (password.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }
    void run(() =>
      crud.mutateAsync({
        id: account?.id,
        action: account ? "update" : "create",
        payload: account
          ? { password }
          : { name: row.name, phone: row.phone, password, role, profileId: row.id },
      }),
    );
  }

  function removeLogin() {
    if (!account || !confirm("دسترسی ورود این کاربر حذف شود؟ اطلاعات مالی و سفارش‌ها باقی می‌ماند.")) return;
    void run(() => crud.mutateAsync({ id: account.id, action: "delete" }));
  }

  return (
    <Modal title={`حساب ورود: ${row.name}`} onClose={() => !busy && onClose()}>
      <div className="space-y-3">
        {error && <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <p className="text-sm text-[var(--muted)]">
          {account ? "این کاربر حساب ورود فعال دارد." : "این مورد هنوز حساب ورود ندارد."}
        </p>
        <div>
          <label className="field-label">{account ? "رمز عبور جدید" : "رمز عبور اولیه"}</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button disabled={busy} className="btn btn-primary w-full" onClick={save}>
          {account ? "تغییر رمز عبور" : "ایجاد حساب ورود"}
        </button>
        {account && (
          <button disabled={busy} className="btn btn-danger w-full" onClick={removeLogin}>
            حذف دسترسی ورود
          </button>
        )}
      </div>
    </Modal>
  );
}
