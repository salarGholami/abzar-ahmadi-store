"use client";
import CrudTable from "@/features/admin/ui/CrudTable";
import type { ReturnRequest } from "@/lib/types";

export default function ReturnsPage() {
  return (
    <CrudTable<ReturnRequest>
      collection="returns"
      title="مرجوعی‌ها"
      searchKeys={["saleId", "reason", "status"]}
      canCreate={false}
      fields={[
        {
          key: "status",
          label: "وضعیت",
          type: "select",
          options: [
            { value: "REQUESTED", label: "ثبت‌شده" },
            { value: "APPROVED", label: "تأیید شده" },
            { value: "REJECTED", label: "رد شده" },
            { value: "RECEIVED", label: "دریافت شده" },
            { value: "REFUNDED", label: "بازپرداخت شده" },
          ],
        },
      ]}
      columns={[
        { key: "saleId", label: "سفارش", render: (r) => String(r.saleId || "-").slice(0, 8) },
        { key: "reason", label: "دلیل" },
        { key: "status", label: "وضعیت" },
        { key: "createdAt", label: "تاریخ", render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString("fa-IR") : "-") },
      ]}
    />
  );
}
