"use client";
import CrudTable from "@/components/dashboard/CrudTable";
import type { Customer } from "@/lib/types";

export default function CustomersPage() {
  return (
    <CrudTable<Customer>
      collection="customers"
      title="مشتریان"
      searchKeys={["name", "phone", "address"]}
      fields={[
        { key: "name", label: "نام مشتری", required: true },
        { key: "phone", label: "شماره موبایل", required: true },
        { key: "address", label: "آدرس" },
        { key: "balance", label: "مانده حساب (تومان)", type: "number" }
      ]}
      columns={[
        { key: "name", label: "نام" },
        { key: "phone", label: "موبایل" },
        { key: "address", label: "آدرس" },
        { key: "balance", label: "مانده حساب", render: (r) => <b>{Number(r.balance || 0).toLocaleString("fa-IR")} تومان</b> },
        { key: "createdAt", label: "تاریخ", render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString("fa-IR") : "-") }
      ]}
    />
  );
}
