"use client";
import CrudTable from "@/features/admin/ui/CrudTable";
import type { Coupon } from "@/lib/types";

export default function CouponsPage() {
  return (
    <CrudTable<Coupon>
      collection="coupons"
      title="کدهای تخفیف"
      searchKeys={["code"]}
      fields={[
        { key: "code", label: "کد تخفیف", required: true },
        { key: "type", label: "نوع", type: "select", options: [{ value: "PERCENT", label: "درصدی" }, { value: "FIXED", label: "مبلغ ثابت" }] },
        { key: "value", label: "مقدار (درصد یا تومان)", type: "number" },
        { key: "maxDiscount", label: "سقف تخفیف (تومان، ۰ = بدون سقف)", type: "number" },
        { key: "minOrderAmount", label: "حداقل مبلغ سفارش (تومان)", type: "number" },
        { key: "usageLimit", label: "سقف تعداد استفاده (۰ = نامحدود)", type: "number" },
        { key: "startsAt", label: "شروع", type: "date" },
        { key: "expiresAt", label: "انقضا", type: "date" },
        { key: "active", label: "فعال", type: "boolean" },
      ]}
      columns={[
        { key: "code", label: "کد" },
        { key: "type", label: "نوع", render: (r) => (r.type === "PERCENT" ? "درصدی" : "مبلغ ثابت") },
        { key: "value", label: "مقدار", render: (r) => Number(r.value || 0).toLocaleString("fa-IR") },
        { key: "usedCount", label: "استفاده‌شده", render: (r) => Number(r.usedCount || 0).toLocaleString("fa-IR") },
        { key: "active", label: "وضعیت", render: (r) => (r.active ? "فعال" : "غیرفعال") },
      ]}
    />
  );
}
