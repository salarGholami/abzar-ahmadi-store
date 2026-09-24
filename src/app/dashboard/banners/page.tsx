"use client";
import CrudTable from "@/features/admin/ui/CrudTable";
import type { StoreBanner } from "@/lib/types";

export default function BannersPage() {
  return (
    <CrudTable<StoreBanner>
      collection="banners"
      title="بنرهای فروشگاه"
      searchKeys={["title", "subtitle"]}
      fields={[
        { key: "title", label: "عنوان", required: true },
        { key: "subtitle", label: "زیرعنوان" },
        { key: "image", label: "آدرس تصویر", required: true },
        { key: "buttonText", label: "متن دکمه" },
        { key: "buttonUrl", label: "لینک دکمه" },
        { key: "position", label: "ترتیب نمایش", type: "number" },
        { key: "active", label: "فعال", type: "boolean" },
      ]}
      columns={[
        { key: "title", label: "عنوان" },
        { key: "position", label: "ترتیب" },
        { key: "active", label: "وضعیت", render: (r) => (r.active ? "فعال" : "غیرفعال") },
      ]}
    />
  );
}
