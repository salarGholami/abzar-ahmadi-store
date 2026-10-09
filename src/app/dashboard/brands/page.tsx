"use client";

import CrudTable from "@/features/admin/ui/CrudTable";

type Brand = {
  id: string;
  name: string;
  image?: string | null;
  productsCount?: number;
};

export default function BrandsPage() {
  return (
    <CrudTable<Brand>
      collection="brands"
      title="برندها"
      searchKeys={["name"]}
      fields={[
        { key: "name", label: "نام برند", required: true },
        {
          key: "image",
          label: "لوگوی برند",
          type: "image",
          imagePurpose: "BRAND",
        },
      ]}
      columns={[
        {
          key: "image",
          label: "لوگو",
          render: (row) =>
            row.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.image}
                alt={row.name}
                className="h-10 w-10 rounded-xl border border-[var(--border)] object-contain bg-[var(--surface-2)] p-1"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[10px] font-black text-[var(--muted)]">
                —
              </span>
            ),
        },
        { key: "name", label: "برند" },
        {
          key: "productsCount",
          label: "تعداد محصول",
          render: (r) => Number(r.productsCount || 0).toLocaleString("fa-IR"),
        },
      ]}
    />
  );
}
