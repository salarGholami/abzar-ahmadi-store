"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Boxes,
  Check,
  ChevronLeft,
  Clock3,
  Edit3,
  ExternalLink,
  FolderOpen,
  Hash,
  Layers3,
  Package,
  PackageCheck,
  RefreshCw,
  Search,
  Settings2,
  ShoppingBag,
  Tag,
  Trash2,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

import Modal from "@/shared/ui/Modal";
import Pagination from "@/shared/ui/Pagination";
import type { Category, Product } from "@/lib/types";
import CategoryImageField from "@/features/admin/ui/CategoryImageField";

const PAGE_SIZE = 8;

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  image: string;
  active: boolean;
};

const EMPTY_FORM: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  image: "",
  active: true,
};

function parseList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: T[] }).data;
  }

  return [];
}

function parseData<T>(payload: unknown): T | null {
  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data?: unknown }).data;

    if (data && typeof data === "object") {
      return data as T;
    }
  }

  if (payload && typeof payload === "object") {
    return payload as T;
  }

  return null;
}

function formatNumber(value: number) {
  return value.toLocaleString("fa-IR");
}

function formatPrice(value?: number) {
  const price = Number(value || 0);

  return `${price.toLocaleString("fa-IR")} تومان`;
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function makeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06ff\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${
        active
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-red-500"
        }`}
      />

      {active ? "فعال" : "غیرفعال"}
    </span>
  );
}

function ProductStatus({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-600 dark:text-red-400">
        ناموجود
      </span>
    );
  }

  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
        موجودی کم
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
      موجود
    </span>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center gap-2 text-[var(--muted)]">
        <Icon className="h-4 w-4 text-[var(--primary)]" />

        <span className="text-xs font-medium">{label}</span>
      </div>

      <p className="mt-2 text-xl font-black text-[var(--text)]">
        {typeof value === "number" ? formatNumber(value) : value}
      </p>
    </div>
  );
}

export default function CategoryManagementPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const categoryId = params?.id;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadData(showRefresh = false) {
    if (!categoryId) return;

    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [categoriesResponse, productsResponse] = await Promise.all([
        fetch("/api/admin/categories", {
          cache: "no-store",
        }),
        fetch("/api/admin/products", {
          cache: "no-store",
        }),
      ]);

      if (!categoriesResponse.ok) {
        throw new Error("Failed to load categories");
      }

      if (!productsResponse.ok) {
        throw new Error("Failed to load products");
      }

      const categoriesPayload = await categoriesResponse.json();

      const productsPayload = await productsResponse.json();

      const categoryList = parseList<Category>(categoriesPayload);

      const productList = parseList<Product>(productsPayload);

      const currentCategory =
        categoryList.find((item) => String(item.id) === String(categoryId)) ||
        null;

      setCategory(currentCategory);
      setProducts(productList);
    } catch (error) {
      console.error("Failed to load category management data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [categoryId]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const categoryProducts = useMemo(() => {
    if (!category) return [];

    return products.filter(
      (product) => product.category?.trim() === category.name?.trim(),
    );
  }, [products, category]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categoryProducts;
    }

    return categoryProducts.filter((product) => {
      return (
        product.title?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query)
      );
    });
  }, [categoryProducts, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE),
  );

  const visibleProducts = filteredProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const inStockCount = categoryProducts.filter(
    (product) => Number(product.stock || 0) > 0,
  ).length;

  const outOfStockCount = categoryProducts.filter(
    (product) => Number(product.stock || 0) <= 0,
  ).length;

  const lowStockCount = categoryProducts.filter(
    (product) =>
      Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 5,
  ).length;

  const totalInventory = categoryProducts.reduce(
    (sum, product) => sum + Number(product.stock || 0),
    0,
  );

  const averagePrice =
    categoryProducts.length > 0
      ? Math.round(
          categoryProducts.reduce(
            (sum, product) => sum + Number(product.price || 0),
            0,
          ) / categoryProducts.length,
        )
      : 0;

  function openEditModal() {
    if (!category) return;

    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      image: category.image || "",
      active: category.active !== false,
    });

    setEditModalOpen(true);
  }

  function closeEditModal() {
    if (saving) return;

    setEditModalOpen(false);
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug:
        current.slug === "" || current.slug === makeSlug(current.name)
          ? makeSlug(value)
          : current.slug,
    }));
  }

  async function handleSave() {
    if (!category || !form.name.trim()) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim() || makeSlug(form.name),
          description: form.description.trim(),
          image: form.image.trim() || null,
          active: form.active,
        }),
      });

      if (!response.ok) {
        throw new Error("Category update failed");
      }

      setEditModalOpen(false);
      await loadData(true);
    } catch (error) {
      console.error("Failed to update category:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!category) return;

    const confirmed = window.confirm(
      `آیا از حذف دسته «${category.name}» مطمئن هستید؟\n\nتعداد محصولات این دسته: ${formatNumber(
        categoryProducts.length,
      )}`,
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Category deletion failed");
      }

      router.push("/dashboard/categories");
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-full pb-10" dir="rtl">
        <div className="space-y-6">
          <div className="h-16 w-56 animate-pulse rounded-2xl bg-[var(--bg-secondary)]" />

          <div className="h-56 animate-pulse rounded-[28px] border border-[var(--border)] bg-[var(--surface)]" />

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl bg-[var(--bg-secondary)]"
              />
            ))}
          </div>

          <div className="h-96 animate-pulse rounded-[26px] bg-[var(--bg-secondary)]" />
        </div>
      </main>
    );
  }

  if (!category) {
    return (
      <main className="min-h-full pb-10" dir="rtl">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="w-full max-w-md rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <FolderOpen className="h-7 w-7" />
            </div>

            <h1 className="mt-5 text-xl font-black text-[var(--text)]">
              دسته پیدا نشد
            </h1>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              دسته‌بندی موردنظر وجود ندارد یا حذف شده است.
            </p>

            <Link href="/dashboard/categories" className="btn btn-primary mt-6">
              <ArrowRight className="h-4 w-4" />
              بازگشت به دسته‌بندی‌ها
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full pb-10" dir="rtl">
      <div className="space-y-6">
        {/* BREADCRUMB */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/dashboard/categories"
            className="font-bold text-[var(--muted)] transition hover:text-[var(--primary)]"
          >
            دسته‌بندی‌ها
          </Link>

          <ChevronLeft className="h-4 w-4 text-[var(--muted)]" />

          <span className="font-black text-[var(--text)]">{category.name}</span>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(0,173,181,0.18),transparent_35%),radial-gradient(circle_at_15%_90%,rgba(0,173,181,0.06),transparent_30%)]" />

          <div className="relative p-5 sm:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border border-[var(--primary)]/15 bg-[var(--primary-light)] text-[var(--primary)] shadow-sm sm:h-20 sm:w-20">
                  <Layers3 className="h-8 w-8 sm:h-9 sm:w-9" />
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusBadge active={category.active !== false} />

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-xs font-bold text-[var(--muted)]">
                      <Hash className="h-3 w-3" />

                      <span dir="ltr">{category.id}</span>
                    </span>
                  </div>

                  <h1 className="truncate text-2xl font-black tracking-tight text-[var(--text)] sm:text-3xl">
                    {category.name}
                  </h1>

                  <p
                    dir="ltr"
                    className="mt-2 truncate text-sm text-[var(--muted)]"
                  >
                    /{category.slug || "—"}
                  </p>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                    {category.description ||
                      "برای این دسته توضیحی ثبت نشده است."}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={refreshing}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-bold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                  بروزرسانی
                </button>

                <button
                  type="button"
                  onClick={openEditModal}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-5 text-sm font-black text-white shadow-lg shadow-[var(--primary)]/20 transition hover:-translate-y-0.5"
                >
                  <Edit3 className="h-4 w-4" />
                  ویرایش دسته
                </button>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-5 sm:grid-cols-4">
              <div>
                <p className="text-xs text-[var(--muted)]">ایجاد شده</p>

                <p className="mt-1 text-sm font-black text-[var(--text)]">
                  {formatDate(category.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--muted)]">بروزرسانی</p>

                <p className="mt-1 text-sm font-black text-[var(--text)]">
                  {formatDate(category.updatedAt)}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--muted)]">وضعیت</p>

                <p className="mt-1 text-sm font-black text-[var(--text)]">
                  {category.active !== false ? "قابل استفاده" : "غیرفعال"}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--muted)]">شناسه</p>

                <p
                  dir="ltr"
                  className="mt-1 truncate text-sm font-black text-[var(--text)]"
                >
                  {category.id}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MiniStat
            icon={Package}
            label="کل محصولات"
            value={categoryProducts.length}
          />

          <MiniStat icon={PackageCheck} label="موجود" value={inStockCount} />

          <MiniStat icon={Zap} label="موجودی کم" value={lowStockCount} />

          <MiniStat icon={Boxes} label="کل موجودی" value={totalInventory} />
        </section>

        {/* OVERVIEW */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
          <div className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[var(--primary)]" />

                  <h2 className="font-black text-[var(--text)]">
                    نمای کلی دسته
                  </h2>
                </div>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  وضعیت محصولات این دسته
                </p>
              </div>

              <span className="rounded-xl bg-[var(--primary-light)] px-3 py-2 text-xs font-black text-[var(--primary)]">
                {formatNumber(categoryProducts.length)} محصول
              </span>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-[var(--muted)]">
                    محصولات دارای موجودی
                  </span>

                  <span className="font-black text-[var(--text)]">
                    {categoryProducts.length > 0
                      ? formatNumber(
                          Math.round(
                            (inStockCount / categoryProducts.length) * 100,
                          ),
                        )
                      : "۰"}
                    ٪
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{
                      width: `${
                        categoryProducts.length > 0
                          ? (inStockCount / categoryProducts.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
                  <p className="text-xs text-[var(--muted)]">موجود</p>

                  <p className="mt-2 text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {formatNumber(inStockCount)}
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
                  <p className="text-xs text-[var(--muted)]">ناموجود</p>

                  <p className="mt-2 text-xl font-black text-red-500">
                    {formatNumber(outOfStockCount)}
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
                  <p className="text-xs text-[var(--muted)]">میانگین قیمت</p>

                  <p className="mt-2 truncate text-sm font-black text-[var(--text)]">
                    {formatPrice(averagePrice)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-[var(--primary)]" />

              <h2 className="font-black text-[var(--text)]">عملیات سریع</h2>
            </div>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={openEditModal}
                className="flex w-full items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3 text-right transition hover:border-[var(--primary)] hover:bg-[var(--primary-light)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
                  <Edit3 className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-black text-[var(--text)]">
                    ویرایش اطلاعات
                  </p>

                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    نام، slug و وضعیت
                  </p>
                </div>
              </button>

              <Link
                href="/dashboard/products"
                className="flex w-full items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3 text-right transition hover:border-[var(--primary)] hover:bg-[var(--primary-light)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
                  <ShoppingBag className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-black text-[var(--text)]">
                    مدیریت محصولات
                  </p>

                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    مشاهده کاتالوگ محصولات
                  </p>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex w-full items-center gap-3 rounded-2xl border border-red-500/15 bg-red-500/[0.04] p-3 text-right transition hover:border-red-500/30 hover:bg-red-500/10 disabled:opacity-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                  {deleting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-black text-red-500">حذف دسته</p>

                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    حذف این دسته‌بندی
                  </p>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* PRODUCTS */}
        <section className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-[var(--primary)]" />

                  <h2 className="font-black text-[var(--text)]">
                    محصولات این دسته
                  </h2>
                </div>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  محصولاتی که به «{category.name}» متصل هستند.
                </p>
              </div>

              <div className="relative w-full lg:w-80">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="جستجوی محصول..."
                  className="input h-11 w-full pr-10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {visibleProducts.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)]">
                <Package className="h-7 w-7" />
              </div>

              <h3 className="mt-5 font-black text-[var(--text)]">
                محصولی پیدا نشد
              </h3>

              <p className="mt-2 text-sm text-[var(--muted)]">
                {search
                  ? "عبارت جستجو را تغییر دهید."
                  : "هنوز محصولی به این دسته اختصاص داده نشده است."}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[850px] text-right">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                      <th className="px-5 py-4 text-xs font-black text-[var(--muted)]">
                        محصول
                      </th>

                      <th className="px-5 py-4 text-xs font-black text-[var(--muted)]">
                        SKU
                      </th>

                      <th className="px-5 py-4 text-xs font-black text-[var(--muted)]">
                        قیمت
                      </th>

                      <th className="px-5 py-4 text-xs font-black text-[var(--muted)]">
                        موجودی
                      </th>

                      <th className="px-5 py-4 text-xs font-black text-[var(--muted)]">
                        وضعیت
                      </th>

                      <th className="px-5 py-4 text-xs font-black text-[var(--muted)]">
                        عملیات
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg)]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package className="h-5 w-5 text-[var(--muted)]" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[300px] truncate text-sm font-black text-[var(--text)]">
                                {product.title}
                              </p>

                              <p className="mt-1 text-xs text-[var(--muted)]">
                                {product.brand || "بدون برند"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            dir="ltr"
                            className="text-xs font-bold text-[var(--muted)]"
                          >
                            {product.sku || "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm font-black text-[var(--text)]">
                            {formatPrice(product.price)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm font-black text-[var(--text)]">
                            {formatNumber(Number(product.stock || 0))}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <ProductStatus stock={Number(product.stock || 0)} />
                        </td>

                        <td className="px-5 py-4">
                          <Link
                            href={`/dashboard/products/${product.id}/edit`}
                            className="inline-flex h-9 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-xs font-black text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            ویرایش
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE PRODUCTS */}
              <div className="space-y-3 p-4 md:hidden">
                {visibleProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-[var(--muted)]" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-black text-[var(--text)]">
                          {product.title}
                        </p>

                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {product.brand || "بدون برند"}
                        </p>

                        <div className="mt-2">
                          <ProductStatus stock={Number(product.stock || 0)} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                        <p className="text-[11px] text-[var(--muted)]">قیمت</p>

                        <p className="mt-1 text-xs font-black text-[var(--text)]">
                          {formatPrice(product.price)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                        <p className="text-[11px] text-[var(--muted)]">
                          موجودی
                        </p>

                        <p className="mt-1 text-sm font-black text-[var(--text)]">
                          {formatNumber(Number(product.stock || 0))}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/products/${product.id}/edit`}
                      className="mt-3 flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-black text-[var(--text)]"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      ویرایش محصول
                    </Link>
                  </div>
                ))}
              </div>

              <div className="border-t border-[var(--border)] p-4">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={filteredProducts.length}
                  pageSize={PAGE_SIZE}
                />
              </div>
            </>
          )}
        </section>

        {/* FOOTER ACTION */}
        <div className="flex flex-col gap-3 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
              <Tag className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-black text-[var(--text)]">
                مدیریت دسته‌بندی
              </p>

              <p className="mt-0.5 text-xs text-[var(--muted)]">
                آخرین تغییرات این دسته را ذخیره و مدیریت کنید.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/categories" className="btn btn-secondary">
              <ArrowRight className="h-4 w-4" />
              بازگشت
            </Link>

            <button
              type="button"
              onClick={openEditModal}
              className="btn btn-primary"
            >
              <Edit3 className="h-4 w-4" />
              ویرایش دسته
            </button>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editModalOpen && (
        <Modal title="ویرایش دسته‌بندی" onClose={closeEditModal}>
          <div className="space-y-5">
            <div className="rounded-2xl border border-[var(--primary)]/15 bg-[var(--primary-light)] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--primary)]">
                  <Tag className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-black text-[var(--text)]">
                    ویرایش اطلاعات دسته
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    تغییرات مستقیماً روی دسته‌بندی فعلی اعمال می‌شود.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="field-label">نام دسته‌بندی</label>

              <input
                value={form.name}
                onChange={(event) => handleNameChange(event.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="field-label">Slug</label>

              <input
                value={form.slug}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    slug: event.target.value,
                  }))
                }
                dir="ltr"
                className="input text-left"
              />
            </div>

            <div>
              <label className="field-label">توضیحات</label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={4}
                className="input resize-none"
                placeholder="توضیحات دسته..."
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
              
              <CategoryImageField
                value={form.image}
                onChange={(url) =>
                  setForm((current) => ({
                    ...current,
                    image: url || "",
                  }))
                }
                disabled={saving}
              />

<div>
                <p className="text-sm font-black text-[var(--text)]">
                  وضعیت دسته
                </p>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  فعال بودن دسته در فروشگاه
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={form.active}
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    active: !current.active,
                  }))
                }
                className={`relative h-7 w-12 rounded-full transition ${
                  form.active ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                    form.active ? "right-1" : "right-6"
                  }`}
                />
              </button>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeEditModal}
                disabled={saving}
                className="btn btn-secondary"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="btn btn-primary min-w-36"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    ذخیره...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    ذخیره تغییرات
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}
