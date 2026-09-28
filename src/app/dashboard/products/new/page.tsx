"use client";

import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";

import ProductForm from "@/components/dashboard/products/ProductForm";
import type { Category } from "@/lib/types";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: { message?: string };
};

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const response = await fetch("/api/admin/categories", {
          cache: "no-store",
        });
        const result = (await response.json()) as ApiResponse<Category[]>;

        if (!response.ok || !result.success) {
          throw new Error(
            result.error?.message || "دریافت دسته‌بندی‌ها ناموفق بود.",
          );
        }

        if (active) {
          setCategories(Array.isArray(result.data) ? result.data : []);
        }
      } catch (cause) {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "خطا در دریافت دسته‌بندی‌ها.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCategories();
    return () => {
      active = false;
    };
  }, []);

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
          در حال آماده‌سازی فرم محصول...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        dir="rtl"
        role="alert"
        className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-600 dark:text-red-400"
      >
        <div className="flex items-center gap-2 font-bold">
          <AlertCircle size={18} />
          دریافت اطلاعات ناموفق بود
        </div>
        <p className="mt-2 leading-7">{error}</p>
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

  return <ProductForm mode="create" categories={categories} />;
}
