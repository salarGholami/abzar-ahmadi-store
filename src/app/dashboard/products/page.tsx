"use client";
import CrudTable from "@/components/dashboard/CrudTable";
import type { Product } from "@/lib/types";

export default function ProductsPage() {
  return (
    <CrudTable<Product>
      collection="products"
      title="محصولات"
      searchKeys={["title", "sku", "brand", "category"]}
      fields={[
        { key: "title", label: "نام محصول", required: true },
        { key: "brand", label: "برند" },
        { key: "sku", label: "کد کالا (SKU)", required: true },
        { key: "category", label: "دسته‌بندی" },
        { key: "price", label: "قیمت فروش (تومان)", type: "number", required: true },
        { key: "discount", label: "درصد تخفیف", type: "number" },
        { key: "purchaseCost", label: "بهای تمام‌شده (تومان)", type: "number" },
        { key: "stock", label: "موجودی اولیه", type: "number" },
        { key: "image", label: "آدرس تصویر (URL)", placeholder: "https://..." }
      ]}
      columns={[
        { key: "title", label: "محصول", render: (p) => <div><div className="font-black">{p.title}</div><div className="mt-1 text-xs text-[var(--muted)]">{p.brand}</div></div> },
        { key: "sku", label: "SKU" },
        { key: "price", label: "قیمت", render: (p) => <b>{Number(p.price || 0).toLocaleString("fa-IR")} تومان</b> },
        { key: "stock", label: "موجودی", render: (p) => <span className={Number(p.stock) <= 5 ? "font-black text-red-500" : ""}>{p.stock}</span> }
      ]}
    />
  );
}
