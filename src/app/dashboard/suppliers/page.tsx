"use client";

import CrudTable from "@/features/admin/ui/CrudTable";
import AccountAction from "@/features/admin/ui/accounts/AccountAction";
import AccountBadge from "@/features/admin/ui/accounts/AccountBadge";
import { useLoginAccounts } from "@/features/admin/ui/accounts/useLoginAccounts";
import type { Supplier } from "@/lib/types";

export default function SuppliersPage() {
  const { findAccount, reload } = useLoginAccounts("SUPPLIER");

  return (
    <CrudTable<Supplier>
      collection="suppliers"
      title="تأمین‌کنندگان"
      searchKeys={["name", "phone", "address"]}
      fields={[
        { key: "name", label: "نام تأمین‌کننده / برند", required: true },
        { key: "phone", label: "شماره تماس", required: true },
        { key: "address", label: "آدرس" },
      ]}
      columns={[
        { key: "name", label: "نام / برند" },
        { key: "phone", label: "تماس" },
        { key: "address", label: "آدرس" },
        { key: "account", label: "حساب ورود", render: (r) => <AccountBadge active={Boolean(findAccount(r))} /> },
        { key: "createdAt", label: "تاریخ", render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString("fa-IR") : "-") },
      ]}
      extraAction={(row) => (
        <AccountAction role="SUPPLIER" row={row} account={findAccount(row)} onChanged={() => void reload()} />
      )}
    />
  );
}
