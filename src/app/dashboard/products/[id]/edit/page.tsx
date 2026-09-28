"use client";

import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { useParams } from "next/navigation";

import ProductForm from "@/components/dashboard/products/ProductForm";
import type { Category, Product } from "@/lib/types";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: { message?: string };
};

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch("/api/admin/products", { cache: "no-store" }),
          fetch("/api/admin/categories", { cache: "no-store" }),
        ]);

        const [productsResult, categoriesResult] = await Promise.all([
          productsResponse.json() as Promise<ApiResponse<Product[]>>,
          categoriesResponse.json() as Promise<ApiResponse<Category[]>>,
        ]);

        if (!productsResponse.ok || !productsResult.success) {
          throw new Error(
            productsResult.error?.message || "دریافت محصولات ناموفق بود.",
          );
        }

        if (!categoriesResponse.ok || !categoriesResult.success) {
          throw new Error(
            categoriesResult.error?.message ||
              "دریافت دسته‌بندی‌ها ناموفق بود.",
          );
        }

        const found = (
          Array.isArray(productsResult.data) ? productsResult.data : []
        ).find((item) => String(item.id) === String(productId));

        if (!found) {
          throw new Error("محصول موردنظر پیدا نشد.");
        }

        if (active) {
          setProduct(found);
          setCategories(
            Array.isArray(categoriesResult.data) ? categoriesResult.data : [],
          );
        }
      } catch (cause) {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "خطا در دریافت اطلاعات محصول.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (productId) void loadData();

    return () => {
      active = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-72 flex-col items-center justify-center gap-3"
        role="status"
      >
        <LoaderCircle
          size={30}
          className="animate-spin text-[var(--primary)]"
        />
        <p className="text-sm font-bold text-[var(--muted)]">
          در حال دریافت اطلاعات محصول...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div
        dir="rtl"
        role="alert"
        className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-600 dark:text-red-400"
      >
        <div className="flex items-center gap-2 font-bold">
          <AlertCircle size={18} />
          دریافت محصول ناموفق بود
        </div>
        <p className="mt-2 leading-7">{error || "محصول پیدا نشد."}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl border border-red-500/20 px-4 py-2 font-bold"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <ProductForm
      key={String(product.id)}
      mode="edit"
      product={product}
      categories={categories}
    />
  );
}
