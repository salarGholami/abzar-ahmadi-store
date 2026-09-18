"use client";
import CrudTable from "@/components/dashboard/CrudTable";
import type { Supplier } from "@/lib/types";

export default function SuppliersPage() {
  return (
    <CrudTable<Supplier>
      collection="suppliers"
      title="تأمین‌کنندگان"
      searchKeys={["name", "phone", "address"]}
      fields={[
        { key: "name", label: "نام تأمین‌کننده", required: true },
        { key: "phone", label: "شماره تماس", required: true },
        { key: "address", label: "آدرس" }
      ]}
      columns={[
        { key: "name", label: "نام" },
        { key: "phone", label: "تماس" },
        { key: "address", label: "آدرس" },
        { key: "createdAt", label: "تاریخ", render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString("fa-IR") : "-") }
      ]}
    />
  );
}
