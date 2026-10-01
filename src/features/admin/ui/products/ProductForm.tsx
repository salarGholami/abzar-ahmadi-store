"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  ChevronDown,
  CircleDollarSign,
  Layers3,
  LoaderCircle,
  Package,
  Plus,
  ShoppingBag,
} from "lucide-react";

import ProductImageManager from "@/features/admin/ui/ProductImageManager";
import type { Category, Product, ProductImage } from "@/lib/types";

type ProductFormValues = {
  title: string;
  brand: string;
  sku: string;
  category: string;
  price: number;
  discount: number;
  purchaseCost: number;
  stock: number;
  description: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: { message?: string };
};

type Props = {
  mode: "create" | "edit";
  categories: Category[];
  product?: Product;
};

const EMPTY_FORM: ProductFormValues = {
  title: "",
  brand: "",
  sku: "",
  category: "",
  price: 0,
  discount: 0,
  purchaseCost: 0,
  stock: 0,
  description: "",
};

function getErrorMessage(data: unknown, fallback: string) {
  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof data.error === "object" &&
    data.error !== null &&
    "message" in data.error &&
    typeof data.error.message === "string"
  ) {
    return data.error.message;
  }

  return fallback;
}

async function readJson<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    throw new Error("پاسخ سرور قابل پردازش نیست.");
  }
}

function formatNumber(value: number | string | null | undefined) {
  return Number(value || 0).toLocaleString("fa-IR");
}

function getInitialImages(product?: Product): ProductImage[] {
  if (product?.images?.length) return [...product.images];

  if (product?.image) {
    return [
      {
        id: `legacy-${product.id}`,
        url: product.image,
        alt: product.title,
        position: 0,
        createdAt: product.createdAt || "",
      },
    ];
  }

  return [];
}

export default function ProductForm({ mode, categories, product }: Props) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState<ProductFormValues>(() =>
    product
      ? {
          title: product.title || "",
          brand: product.brand || "",
          sku: product.sku || "",
          category: product.category || "",
          price: Number(product.price) || 0,
          discount: Number(product.discount) || 0,
          purchaseCost: Number(product.purchaseCost) || 0,
          stock: Number(product.stock) || 0,
          description: product.description || "",
        }
      : { ...EMPTY_FORM },
  );

  const [images, setImages] = useState<ProductImage[]>(() =>
    getInitialImages(product),
  );
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function updateForm<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function uploadPending(productId: string) {
    if (!pendingFiles.length) return;

    const formData = new FormData();
    pendingFiles.forEach((file) => formData.append("files", file));

    const response = await fetch(
      `/api/admin/products/${encodeURIComponent(productId)}/images`,
      {
        method: "POST",
        body: formData,
      },
    );

    const result = await readJson<unknown>(response);

    if (!response.ok || !result.success) {
      throw new Error(
        getErrorMessage(
          result,
          "اطلاعات محصول ذخیره شد، اما آپلود تصاویر ناموفق بود.",
        ),
      );
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const title = form.title.trim();
    const sku = form.sku.trim();
    const category = form.category.trim();

    if (!title || !sku || !category) {
      setError("نام محصول، کد SKU و دسته‌بندی الزامی هستند.");
      return;
    }

    if (
      !Number.isFinite(form.price) ||
      !Number.isFinite(form.purchaseCost) ||
      !Number.isFinite(form.discount) ||
      !Number.isFinite(form.stock) ||
      form.price < 0 ||
      form.purchaseCost < 0 ||
      form.stock < 0 ||
      form.discount < 0 ||
      form.discount > 100
    ) {
      setError("مقادیر قیمت، موجودی و تخفیف را بررسی کنید.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    let savedProductId = product?.id ? String(product.id) : "";

    try {
      const endpoint = isEdit
        ? `/api/admin/products/${encodeURIComponent(savedProductId)}`
        : "/api/admin/products";

      const response = await fetch(endpoint, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          title,
          sku,
          category,
          brand: form.brand.trim(),
          description: form.description.trim(),
          image: images[0]?.url || "",
          images,
        }),
      });

      const result = await readJson<Product>(response);

      if (!response.ok || !result.success) {
        throw new Error(getErrorMessage(result, "ذخیره محصول انجام نشد."));
      }

      savedProductId ||= String(result.data?.id || "");

      if (!savedProductId) {
        throw new Error("شناسه محصول ذخیره‌شده از سرور دریافت نشد.");
      }

      try {
        await uploadPending(savedProductId);
      } catch (uploadError) {
        setNotice(
          uploadError instanceof Error
            ? uploadError.message
            : "محصول ذخیره شد، اما آپلود تصاویر ناموفق بود.",
        );
        return;
      }

      window.location.assign("/dashboard/products");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "خطا در ذخیره محصول.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none transition placeholder:text-[var(--muted)]/60 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15";

  const activeCategories = categories.filter((item) => item.active !== false);

  return (
    <div dir="rtl" className="mx-auto w-full max-w-5xl space-y-5 pb-10">
      <header className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-extrabold text-[var(--primary)]">
              <ShoppingBag size={14} />
              مدیریت کاتالوگ فروشگاه
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              {isEdit ? "ویرایش محصول" : "افزودن محصول جدید"}
            </h1>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              {isEdit
                ? "اطلاعات، قیمت‌گذاری، موجودی و تصاویر محصول را به‌روزرسانی کنید."
                : "اطلاعات محصول را وارد کنید تا به کاتالوگ فروشگاه اضافه شود."}
            </p>
          </div>

          <Link
            href="/dashboard/products"
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-bold transition hover:bg-[var(--surface-2)]"
          >
            بازگشت به محصولات
          </Link>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-600 dark:text-red-400"
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span className="leading-6">{error}</span>
        </div>
      )}

      {notice && (
        <div
          role="alert"
          className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-7 text-amber-700 dark:text-amber-400"
        >
          {notice}
          <div className="mt-2">
            <Link
              href="/dashboard/products"
              className="font-extrabold underline underline-offset-4"
            >
              بازگشت به فهرست محصولات
            </Link>
          </div>
        </div>
      )}

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="space-y-5"
      >
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2 border-b border-[var(--border)] pb-3">
            <Package size={18} className="text-[var(--primary)]" />
            <h2 className="text-base font-black">اطلاعات اصلی</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="product-title"
                className="mb-2 block text-xs font-bold"
              >
                نام محصول <span className="text-red-500">*</span>
              </label>
              <input
                id="product-title"
                required
                maxLength={200}
                autoFocus
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
                placeholder="مثلاً دریل چکشی ۱۳ میلی‌متری"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="product-brand"
                className="mb-2 block text-xs font-bold"
              >
                برند
              </label>
              <input
                id="product-brand"
                maxLength={100}
                value={form.brand}
                onChange={(event) => updateForm("brand", event.target.value)}
                placeholder="مثلاً رونیکس"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="product-sku"
                className="mb-2 block text-xs font-bold"
              >
                کد SKU <span className="text-red-500">*</span>
              </label>
              <input
                id="product-sku"
                required
                maxLength={100}
                dir="ltr"
                value={form.sku}
                onChange={(event) => updateForm("sku", event.target.value)}
                placeholder="TOOL-001"
                className={`${inputClass} text-left font-mono`}
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="product-category"
                className="mb-2 block text-xs font-bold"
              >
                دسته‌بندی <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="product-category"
                  required
                  value={form.category}
                  onChange={(event) =>
                    updateForm("category", event.target.value)
                  }
                  className={`${inputClass} appearance-none pl-10`}
                >
                  <option value="">انتخاب دسته‌بندی</option>
                  {activeCategories.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute left-3 top-3.5 text-[var(--muted)]"
                />
              </div>
              {activeCategories.length === 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  دسته‌بندی فعالی وجود ندارد؛ ابتدا از بخش دسته‌بندی‌ها، یک دسته
                  ایجاد کنید.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2 border-b border-[var(--border)] pb-3">
            <CircleDollarSign size={18} className="text-[var(--primary)]" />
            <h2 className="text-base font-black">قیمت‌گذاری و موجودی</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["product-price", "قیمت فروش (تومان)", "price"],
                ["product-cost", "قیمت خرید (تومان)", "purchaseCost"],
                ["product-discount", "تخفیف (درصد)", "discount"],
                ["product-stock", "تعداد موجودی", "stock"],
              ] as const
            ).map(([id, label, key]) => (
              <div key={id}>
                <label htmlFor={id} className="mb-2 block text-xs font-bold">
                  {label}
                </label>
                <input
                  id={id}
                  type="number"
                  min={0}
                  max={key === "discount" ? 100 : undefined}
                  step={1}
                  value={form[key]}
                  onChange={(event) => {
                    const raw = Number(event.target.value);
                    const value = Number.isFinite(raw) ? Math.max(0, raw) : 0;
                    updateForm(
                      key,
                      key === "discount" ? Math.min(100, value) : value,
                    );
                  }}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
            ))}
          </div>

          {form.price > 0 && form.discount > 0 && (
            <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-xs font-bold text-[var(--muted)]">
                قیمت پس از تخفیف
              </p>
              <p className="mt-1 text-xl font-black text-emerald-600 dark:text-emerald-400">
                {formatNumber(
                  Math.round(form.price * (1 - form.discount / 100)),
                )}{" "}
                <span className="text-xs">تومان</span>
              </p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2 border-b border-[var(--border)] pb-3">
            <Layers3 size={18} className="text-[var(--primary)]" />
            <h2 className="text-base font-black">توضیحات محصول</h2>
          </div>
          <textarea
            id="product-description"
            maxLength={10000}
            rows={5}
            value={form.description}
            onChange={(event) => updateForm("description", event.target.value)}
            placeholder="مشخصات فنی، ویژگی‌ها و توضیحات محصول..."
            className={`${inputClass} min-h-32 resize-y py-3 leading-7`}
          />
          <p className="mt-2 text-left text-[10px] text-[var(--muted)]">
            {formatNumber(form.description.length)} / ۱۰٬۰۰۰
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2 border-b border-[var(--border)] pb-3">
            <ShoppingBag size={18} className="text-[var(--primary)]" />
            <h2 className="text-base font-black">تصاویر محصول</h2>
          </div>
          <ProductImageManager
            productId={product?.id}
            images={images}
            onChange={setImages}
            onPendingFiles={setPendingFiles}
          />
          <p className="mt-3 text-xs leading-6 text-[var(--muted)]">
            تصویر اول به‌عنوان تصویر اصلی محصول در نظر گرفته می‌شود. تصاویر جدید
            پس از ذخیره اطلاعات محصول آپلود خواهند شد.
          </p>
        </section>

        <div className="sticky bottom-3 z-10 flex flex-col-reverse gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-3 shadow-xl backdrop-blur sm:flex-row sm:justify-end">
          <Link
            href="/dashboard/products"
            aria-disabled={saving}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] px-5 text-sm font-bold transition hover:bg-[var(--surface-2)]"
          >
            انصراف
          </Link>
          <button
            type="submit"
            disabled={saving || activeCategories.length === 0}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 text-sm font-extrabold text-white shadow-md shadow-[var(--primary)]/15 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                در حال ذخیره...
              </>
            ) : (
              <>
                {isEdit ? <Check size={17} /> : <Plus size={17} />}
                {isEdit ? "ذخیره تغییرات" : "ثبت محصول"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
