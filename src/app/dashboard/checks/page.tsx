"use client";
import CrudTable from "@/components/dashboard/CrudTable";
import type { CheckRecord } from "@/lib/types";

const statusLabel: Record<string, string> = { PENDING: "در انتظار وصول", CLEARED: "وصول شد", BOUNCED: "برگشتی" };
const directionLabel: Record<string, string> = { RECEIVED: "دریافتی", ISSUED: "صادره" };

export default function ChecksPage() {
  return (
    <CrudTable<CheckRecord>
      collection="checks"
      title="چک‌ها"
      searchKeys={["number", "bank", "relatedName"]}
      fields={[
        { key: "number", label: "شماره چک", required: true },
        { key: "bank", label: "بانک", required: true },
        { key: "dueDate", label: "تاریخ سررسید", type: "date", required: true },
        { key: "amount", label: "مبلغ (تومان)", type: "number", required: true },
        { key: "direction", label: "نوع چک", type: "select", options: [{ value: "RECEIVED", label: "دریافتی" }, { value: "ISSUED", label: "صادره" }], required: true },
        { key: "status", label: "وضعیت", type: "select", options: [{ value: "PENDING", label: "در انتظار وصول" }, { value: "CLEARED", label: "وصول شد" }, { value: "BOUNCED", label: "برگشتی" }] },
        { key: "relatedName", label: "طرف حساب" },
        { key: "description", label: "توضیحات", type: "textarea" }
      ]}
      columns={[
        { key: "number", label: "شماره" },
        { key: "bank", label: "بانک" },
        { key: "relatedName", label: "طرف حساب" },
        { key: "direction", label: "نوع", render: (r) => directionLabel[r.direction] || r.direction },
        { key: "amount", label: "مبلغ", render: (r) => <b>{Number(r.amount || 0).toLocaleString("fa-IR")} تومان</b> },
        { key: "dueDate", label: "سررسید", render: (r) => (r.dueDate ? new Date(r.dueDate).toLocaleDateString("fa-IR") : "-") },
        { key: "status", label: "وضعیت", render: (r) => (
          <span className={`badge ${r.status === "CLEARED" ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300" : r.status === "BOUNCED" ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"}`}>{statusLabel[r.status] || r.status}</span>
        )}
      ]}
    />
  );
}
