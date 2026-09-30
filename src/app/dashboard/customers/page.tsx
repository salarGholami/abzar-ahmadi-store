"use client";

import CrudTable from "@/features/admin/ui/CrudTable";
import AccountAction from "@/features/admin/ui/accounts/AccountAction";
import AccountBadge from "@/features/admin/ui/accounts/AccountBadge";
import { useLoginAccounts } from "@/features/admin/ui/accounts/useLoginAccounts";
import type { Customer } from "@/lib/types";

export default function CustomersPage() {
  const { findAccount, reload } = useLoginAccounts("CUSTOMER");

  return (
    <CrudTable<Customer>
      collection="customers"
      title="مشتریان"
      searchKeys={["name", "phone", "address"]}
      fields={[
        { key: "name", label: "نام مشتری", required: true },
        { key: "phone", label: "شماره موبایل", required: true },
        { key: "address", label: "آدرس" },
        { key: "balance", label: "مانده حساب (تومان)", type: "number" },
      ]}
      columns={[
        { key: "name", label: "نام" },
        { key: "phone", label: "موبایل" },
        { key: "address", label: "آدرس" },
        { key: "balance", label: "مانده حساب", render: (r) => <b>{Number(r.balance || 0).toLocaleString("fa-IR")} تومان</b> },
        { key: "account", label: "حساب ورود", render: (r) => <AccountBadge active={Boolean(findAccount(r))} /> },
        { key: "createdAt", label: "تاریخ", render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString("fa-IR") : "-") },
      ]}
      extraAction={(row) => (
        <AccountAction role="CUSTOMER" row={row} account={findAccount(row)} onChanged={() => void reload()} />
      )}
    />
  );
}
