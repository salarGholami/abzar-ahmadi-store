"use client";
import CrudTable from "@/features/admin/ui/CrudTable";
import type { Review } from "@/lib/types";

export default function ReviewsPage() {
  return (
    <CrudTable<Review>
      collection="reviews"
      title="نظرات کاربران"
      searchKeys={["title", "body", "productId", "status"]}
      canCreate={false}
      fields={[
        {
          key: "status",
          label: "وضعیت",
          type: "select",
          options: [
            { value: "PENDING", label: "در انتظار بررسی" },
            { value: "APPROVED", label: "تأیید شده" },
            { value: "REJECTED", label: "رد شده" },
          ],
        },
      ]}
      columns={[
        { key: "productId", label: "محصول", render: (r) => String(r.productId || "-").slice(0, 8) },
        { key: "rating", label: "امتیاز" },
        { key: "title", label: "عنوان" },
        { key: "body", label: "متن" },
        { key: "status", label: "وضعیت" },
      ]}
    />
  );
}
