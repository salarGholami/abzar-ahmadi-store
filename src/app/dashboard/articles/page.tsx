"use client";
import CrudTable from "@/features/admin/ui/CrudTable";
import type { StoreArticle } from "@/lib/types";

export default function ArticlesPage() {
  return (
    <CrudTable<StoreArticle>
      collection="articles"
      title="مقالات"
      searchKeys={["title", "slug"]}
      fields={[
        { key: "title", label: "عنوان", required: true },
        { key: "slug", label: "اسلاگ (انگلیسی)", required: true },
        { key: "excerpt", label: "خلاصه", type: "textarea" },
        { key: "content", label: "متن مقاله", type: "textarea" },
        { key: "image", label: "آدرس تصویر" },
        { key: "active", label: "منتشر شده", type: "boolean" },
      ]}
      columns={[
        { key: "title", label: "عنوان" },
        { key: "slug", label: "اسلاگ" },
        { key: "active", label: "وضعیت", render: (r) => (r.active ? "منتشر شده" : "پیش‌نویس") },
      ]}
    />
  );
}
