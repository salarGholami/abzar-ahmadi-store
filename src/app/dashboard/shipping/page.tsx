"use client";
import CrudTable from "@/features/admin/ui/CrudTable";
import type { ShippingOption } from "@/lib/types";

export default function ShippingMethodsPage() {
  return (
    <CrudTable<ShippingOption>
      collection="shipping-methods"
      title="روش‌های ارسال"
      searchKeys={["name", "code"]}
      fields={[
        { key: "name", label: "نام روش ارسال", required: true },
        { key: "code", label: "کد (انگلیسی)", required: true },
        { key: "price", label: "هزینه ارسال (تومان)", type: "number" },
        { key: "freeThreshold", label: "ارسال رایگان از مبلغ (تومان، ۰ = غیرفعال)", type: "number" },
        { key: "estimatedDays", label: "زمان تحویل تخمینی" },
        { key: "active", label: "فعال", type: "boolean" },
      ]}
      columns={[
        { key: "name", label: "نام" },
        { key: "code", label: "کد" },
        { key: "price", label: "هزینه", render: (r) => Number(r.price || 0).toLocaleString("fa-IR") },
        { key: "estimatedDays", label: "زمان تحویل" },
        { key: "active", label: "وضعیت", render: (r) => (r.active ? "فعال" : "غیرفعال") },
      ]}
    />
  );
}
