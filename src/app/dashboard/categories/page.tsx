"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Archive,
  ArrowDownAZ,
  BarChart3,
  Check,
  ChevronDown,
  Clock3,
  Edit3,
  Eye,
  FolderOpen,
  Hash,
  Layers3,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Tags,
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

type SortKey =
  | "newest"
  | "oldest"
  | "nameAsc"
  | "nameDesc"
  | "productsHigh"
  | "productsLow";

type StatusFilter = "all" | "active" | "inactive";

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

function formatNumber(value: number) {
  return value.toLocaleString("fa-IR");
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
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

function getProductCount(category: Category, products: Product[]) {
  return products.filter(
    (product) => product.category?.trim() === category.name?.trim(),
  ).length;
}

function getCategoryColor(index: number) {
  const colors = [
    "from-cyan-500/20 via-cyan-500/10 to-transparent",
    "from-violet-500/20 via-violet-500/10 to-transparent",
    "from-amber-500/20 via-amber-500/10 to-transparent",
    "from-emerald-500/20 via-emerald-500/10 to-transparent",
    "from-blue-500/20 via-blue-500/10 to-transparent",
    "from-rose-500/20 via-rose-500/10 to-transparent",
  ];

  return colors[index % colors.length];
}

function getCategoryIcon(index: number) {
  const icons = [Layers3, Package, Tags, Archive, FolderOpen, Zap];

  return icons[index % icons.length];
}

function getSortLabel(sort: SortKey) {
  switch (sort) {
    case "oldest":
      return "قدیمی‌ترین";
    case "nameAsc":
      return "نام: صعودی";
    case "nameDesc":
      return "نام: نزولی";
    case "productsHigh":
      return "بیشترین محصول";
    case "productsLow":
      return "کمترین محصول";
    default:
      return "جدیدترین";
  }
}

function StatBox({
  icon: Icon,
  label,
  value,
  description,
  tone = "default",
}: {
  icon: typeof Layers3;
  label: string;
  value: number | string;
  description: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneClasses = {
    default:
      "bg-[var(--primary-light)] text-[var(--primary)] border-[var(--primary)]/10",
    success:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10",
    warning:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10",
    danger: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/10",
  };

  return (
    <div className="group relative overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl">
      <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-[var(--primary)]/5 blur-2xl transition group-hover:bg-[var(--primary)]/10" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--muted)]">{label}</p>

          <div className="mt-2 text-3xl font-black tracking-tight text-[var(--text)]">
            {typeof value === "number" ? formatNumber(value) : value}
          </div>

          <p className="mt-2 text-xs text-[var(--muted)]">{description}</p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${toneClasses[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ active }: { active?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${
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

function ProgressBar({ value, max }: { value: number; max: number }) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
      <div
        className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadData(showRefresh = false) {
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

      const categoriesPayload = await categoriesResponse.json();
      const productsPayload = await productsResponse.json();

      setCategories(parseList<Category>(categoriesPayload));
      setProducts(parseList<Product>(productsPayload));
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, status, sort]);

  useEffect(() => {
    function handleDocumentClick() {
      setOpenMenu(null);
    }

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const categoryStats = useMemo(() => {
    return categories.map((category) => ({
      category,
      productCount: getProductCount(category, products),
    }));
  }, [categories, products]);

  const totalProducts = products.length;

  const activeCount = categories.filter(
    (category) => category.active !== false,
  ).length;

  const inactiveCount = categories.length - activeCount;

  const categorizedProducts = products.filter((product) =>
    categories.some(
      (category) => category.name.trim() === product.category?.trim(),
    ),
  ).length;

  const uncategorizedProducts = Math.max(
    totalProducts - categorizedProducts,
    0,
  );

  const coverage =
    totalProducts > 0
      ? Math.round((categorizedProducts / totalProducts) * 100)
      : 0;

  const averageProducts =
    categories.length > 0
      ? Math.round(categorizedProducts / categories.length)
      : 0;

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = categoryStats.filter(({ category }) => {
      const matchesSearch =
        !query ||
        category.name?.toLowerCase().includes(query) ||
        category.slug?.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query);

      const matchesStatus =
        status === "all" ||
        (status === "active" && category.active !== false) ||
        (status === "inactive" && category.active === false);

      return matchesSearch && matchesStatus;
    });

    return result.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return (
            new Date(a.category.createdAt || 0).getTime() -
            new Date(b.category.createdAt || 0).getTime()
          );

        case "nameAsc":
          return a.category.name.localeCompare(b.category.name, "fa");

        case "nameDesc":
          return b.category.name.localeCompare(a.category.name, "fa");

        case "productsHigh":
          return b.productCount - a.productCount;

        case "productsLow":
          return a.productCount - b.productCount;

        default:
          return (
            new Date(b.category.createdAt || 0).getTime() -
            new Date(a.category.createdAt || 0).getTime()
          );
      }
    });
  }, [categoryStats, search, status, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCategories.length / PAGE_SIZE),
  );

  const visibleCategories = filteredCategories.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const topCategories = useMemo(() => {
    return [...categoryStats]
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 5);
  }, [categoryStats]);

  const attentionCategories = useMemo(() => {
    return categoryStats
      .filter(
        ({ category, productCount }) =>
          category.active === false || productCount === 0,
      )
      .sort((a, b) => {
        if (a.category.active !== b.category.active) {
          return a.category.active === false ? -1 : 1;
        }

        return a.productCount - b.productCount;
      })
      .slice(0, 5);
  }, [categoryStats]);

  function openCreateModal() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(category: Category) {
    setEditing(category);

    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      image: category.image || "",
      active: category.active !== false,
    });

    setModalOpen(true);
    setOpenMenu(null);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    try {
      setSaving(true);

      const url = editing
        ? `/api/admin/categories/${editing.id}`
        : "/api/admin/categories";

      const method = editing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
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
        throw new Error("Category save failed");
      }

      await loadData(true);
      closeModal();
    } catch (error) {
      console.error("Failed to save category:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: Category) {
    const productCount = getProductCount(category, products);

    const message =
      productCount > 0
        ? `دسته «${category.name}» دارای ${formatNumber(
            productCount,
          )} محصول است. آیا از حذف آن مطمئن هستید؟`
        : `آیا از حذف دسته «${category.name}» مطمئن هستید؟`;

    if (!window.confirm(message)) return;

    try {
      setDeletingId(category.id);
      setOpenMenu(null);

      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Category deletion failed");
      }

      await loadData(true);
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-full pb-10" dir="rtl">
      <div className="space-y-6">
        {/* HEADER */}
        <section className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(0,173,181,0.16),transparent_35%),radial-gradient(circle_at_10%_100%,rgba(0,173,181,0.07),transparent_30%)]" />

          <div className="relative p-5 sm:p-7">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary-light)] px-3 py-1.5 text-xs font-black text-[var(--primary)]">
                    <Activity className="h-3.5 w-3.5" />
                    مرکز کنترل کاتالوگ
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-xs font-bold text-[var(--muted)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    سیستم آنلاین
                  </span>
                </div>

                <h1 className="text-2xl font-black tracking-tight text-[var(--text)] sm:text-3xl">
                  مدیریت دسته‌بندی‌ها
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                  ساختار کاتالوگ فروشگاه را مدیریت کنید، وضعیت دسته‌ها را بررسی
                  کنید و توزیع محصولات را زیر نظر داشته باشید.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={refreshing}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-bold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                  بروزرسانی
                </button>

                <button
                  type="button"
                  onClick={openCreateModal}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-5 text-sm font-black text-white shadow-lg shadow-[var(--primary)]/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <Plus className="h-4 w-4" />
                  دسته جدید
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-5 sm:grid-cols-4">
              <div>
                <p className="text-xs text-[var(--muted)]">دسته‌ها</p>
                <p className="mt-1 text-lg font-black text-[var(--text)]">
                  {formatNumber(categories.length)}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--muted)]">محصولات</p>
                <p className="mt-1 text-lg font-black text-[var(--text)]">
                  {formatNumber(totalProducts)}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--muted)]">پوشش کاتالوگ</p>
                <p className="mt-1 text-lg font-black text-[var(--primary)]">
                  {formatNumber(coverage)}٪
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--muted)]">بروزرسانی</p>
                <p className="mt-1 text-lg font-black text-[var(--text)]">
                  اکنون
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* KPI */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatBox
            icon={Layers3}
            label="کل دسته‌بندی‌ها"
            value={categories.length}
            description="تمام دسته‌های ثبت‌شده"
          />

          <StatBox
            icon={Check}
            label="دسته‌های فعال"
            value={activeCount}
            description="دسته‌های قابل استفاده در فروشگاه"
            tone="success"
          />

          <StatBox
            icon={Archive}
            label="دسته‌های غیرفعال"
            value={inactiveCount}
            description="دسته‌هایی که فعلاً غیرفعال هستند"
            tone={inactiveCount > 0 ? "warning" : "default"}
          />

          <StatBox
            icon={Package}
            label="محصولات بدون دسته"
            value={uncategorizedProducts}
            description="محصولات نیازمند سامان‌دهی"
            tone={uncategorizedProducts > 0 ? "danger" : "success"}
          />
        </section>

        {/* ANALYTICS */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[var(--primary)]" />
                  <h2 className="font-black text-[var(--text)]">
                    توزیع محصولات
                  </h2>
                </div>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  دسته‌هایی که بیشترین محصول را در خود دارند
                </p>
              </div>

              <span className="rounded-xl bg-[var(--primary-light)] px-3 py-2 text-xs font-black text-[var(--primary)]">
                Top 5
              </span>
            </div>

            {loading ? (
              <div className="space-y-5">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="animate-pulse">
                    <div className="mb-2 h-4 w-40 rounded bg-[var(--bg-secondary)]" />
                    <div className="h-2 rounded bg-[var(--bg-secondary)]" />
                  </div>
                ))}
              </div>
            ) : topCategories.length === 0 ? (
              <div className="flex min-h-48 items-center justify-center text-sm text-[var(--muted)]">
                هنوز دسته‌ای ثبت نشده است.
              </div>
            ) : (
              <div className="space-y-5">
                {topCategories.map(({ category, productCount }, index) => (
                  <div key={category.id}>
                    <div className="mb-2.5 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-secondary)] text-xs font-black text-[var(--muted)]">
                          {formatNumber(index + 1)}
                        </span>

                        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
                          {category.image ? (
                             
                            <img
                              src={category.image}
                              alt=""
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <span className="text-[10px] font-black text-[var(--muted)]">—</span>
                          )}
                        </span>

                        <span className="truncate text-sm font-bold text-[var(--text)]">
                          {category.name}
                        </span>
                      </div>

                      <span className="shrink-0 text-xs font-black text-[var(--primary)]">
                        {formatNumber(productCount)} محصول
                      </span>
                    </div>

                    <ProgressBar
                      value={productCount}
                      max={topCategories[0]?.productCount || 1}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="font-black text-[var(--text)]">وضعیت کاتالوگ</h2>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-[var(--muted)]">
                    پوشش دسته‌بندی
                  </span>

                  <span className="font-black text-[var(--text)]">
                    {formatNumber(coverage)}٪
                  </span>
                </div>

                <div className="mt-3">
                  <ProgressBar value={coverage} max={100} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
                  <p className="text-xs text-[var(--muted)]">میانگین محصول</p>

                  <p className="mt-2 text-xl font-black text-[var(--text)]">
                    {formatNumber(averageProducts)}
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
                  <p className="text-xs text-[var(--muted)]">فعال</p>

                  <p className="mt-2 text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {formatNumber(activeCount)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
                    <Package className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs text-[var(--muted)]">کل محصولات</p>

                    <p className="mt-1 text-lg font-black text-[var(--text)]">
                      {formatNumber(totalProducts)}
                    </p>
                  </div>

                  <div className="mr-auto text-left">
                    <p className="text-[11px] text-[var(--muted)]">بدون دسته</p>

                    <p className="mt-1 text-sm font-black text-red-500">
                      {formatNumber(uncategorizedProducts)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ATTENTION */}
        {!loading && attentionCategories.length > 0 && (
          <section className="rounded-[24px] border border-amber-500/20 bg-amber-500/[0.035] p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-amber-500" />
                  <h2 className="font-black text-[var(--text)]">
                    نیازمند توجه
                  </h2>
                </div>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  دسته‌هایی که خالی یا غیرفعال هستند.
                </p>
              </div>

              <span className="w-fit rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-black text-amber-600 dark:text-amber-400">
                {formatNumber(attentionCategories.length)} مورد
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {attentionCategories.map(({ category, productCount }) => (
                <Link
                  key={category.id}
                  href={`/dashboard/categories/${category.id}`}
                  className="group flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-right transition hover:-translate-y-0.5 hover:border-amber-500/30 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    {productCount === 0 ? (
                      <Package className="h-5 w-5" />
                    ) : (
                      <Archive className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--text)]">
                      {category.name}
                    </p>

                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {category.active === false ? "غیرفعال" : "بدون محصول"}
                    </p>
                  </div>

                  <ChevronDown className="mr-auto h-4 w-4 -rotate-90 text-[var(--muted)] transition group-hover:text-amber-500" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* COMMAND BAR */}
        <section className="sticky top-3 z-20 rounded-[22px] border border-[var(--border)] bg-[var(--surface)]/95 p-3 shadow-lg backdrop-blur-xl">
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جستجو در نام، slug یا توضیحات..."
                className="input h-11 w-full pr-11"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text)]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-[160px]">
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as StatusFilter)
                  }
                  className="input h-11 w-full appearance-none pl-10"
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="active">فقط فعال</option>
                  <option value="inactive">فقط غیرفعال</option>
                </select>

                <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              </div>

              <div className="relative min-w-[175px]">
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortKey)}
                  className="input h-11 w-full appearance-none pl-10"
                >
                  <option value="newest">جدیدترین</option>
                  <option value="oldest">قدیمی‌ترین</option>
                  <option value="nameAsc">نام: صعودی</option>
                  <option value="nameDesc">نام: نزولی</option>
                  <option value="productsHigh">بیشترین محصول</option>
                  <option value="productsLow">کمترین محصول</option>
                </select>

                <ArrowDownAZ className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                  setSort("newest");
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 text-sm font-bold text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                <Settings2 className="h-4 w-4" />
                پاک‌سازی
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-3">
            <span className="text-xs font-bold text-[var(--muted)]">
              نمایش:
            </span>

            <span className="rounded-lg bg-[var(--primary-light)] px-2.5 py-1.5 text-xs font-black text-[var(--primary)]">
              {formatNumber(filteredCategories.length)} دسته
            </span>

            {search && (
              <span className="rounded-lg bg-[var(--bg-secondary)] px-2.5 py-1.5 text-xs font-bold text-[var(--text)]">
                جستجو: {search}
              </span>
            )}

            {status !== "all" && (
              <span className="rounded-lg bg-[var(--bg-secondary)] px-2.5 py-1.5 text-xs font-bold text-[var(--text)]">
                {status === "active" ? "فعال" : "غیرفعال"}
              </span>
            )}

            <span className="mr-auto text-xs text-[var(--muted)]">
              مرتب‌سازی:{" "}
              <span className="font-bold text-[var(--text)]">
                {getSortLabel(sort)}
              </span>
            </span>
          </div>
        </section>

        {/* GRID */}
        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-[var(--text)]">
                کاتالوگ دسته‌بندی‌ها
              </h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                مدیریت سریع ساختار دسته‌بندی فروشگاه
              </p>
            </div>

            <div className="hidden items-center gap-2 text-xs text-[var(--muted)] sm:flex">
              <Hash className="h-4 w-4" />
              {formatNumber(filteredCategories.length)} نتیجه
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[260px] animate-pulse rounded-[24px] border border-[var(--border)] bg-[var(--surface)]"
                />
              ))}
            </div>
          ) : visibleCategories.length === 0 ? (
            <div className="rounded-[26px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)]">
                <FolderOpen className="h-7 w-7" />
              </div>

              <h3 className="mt-5 font-black text-[var(--text)]">
                دسته‌ای پیدا نشد
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                با تغییر عبارت جستجو یا فیلترها دوباره امتحان کنید.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {visibleCategories.map(({ category, productCount }, index) => {
                  const Icon = getCategoryIcon(index);
                  const color = getCategoryColor(index);

                  return (
                    <article
                      key={category.id}
                      className="group relative overflow-hidden rounded-[25px] border border-[var(--border)] bg-[var(--surface)] transition duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/30 hover:shadow-2xl"
                    >
                      <div
                        className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-br ${color}`}
                      />

                      <div className="relative p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                            <Icon className="h-5 w-5 text-[var(--primary)]" />
                          </div>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();

                                setOpenMenu((current) =>
                                  current === category.id ? null : category.id,
                                );
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>

                            {openMenu === category.id && (
                              <div
                                onClick={(event) => event.stopPropagation()}
                                className="absolute left-0 top-11 z-30 w-44 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-2xl"
                              >
                                <Link
                                  href={`/dashboard/categories/${category.id}`}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-[var(--text)] hover:bg-[var(--bg-secondary)]"
                                >
                                  <Eye className="h-4 w-4 text-[var(--primary)]" />
                                  مدیریت
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => openEditModal(category)}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-[var(--text)] hover:bg-[var(--bg-secondary)]"
                                >
                                  <Edit3 className="h-4 w-4 text-blue-500" />
                                  ویرایش سریع
                                </button>

                                <div className="my-1 border-t border-[var(--border)]" />

                                <button
                                  type="button"
                                  disabled={deletingId === category.id}
                                  onClick={() => handleDelete(category)}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  حذف دسته
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-5">
                          <div className="mb-3 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]">
                            <div className="aspect-[16/9] w-full">
                              {category.image ? (
                                 
                                <img
                                  src={category.image}
                                  alt={category.name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="grid h-full place-items-center text-xs font-bold text-[var(--muted)]">
                                  بدون تصویر
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-lg font-black text-[var(--text)]">
                              {category.name}
                            </h3>

                            <StatusBadge active={category.active !== false} />
                          </div>

                          <p
                            dir="ltr"
                            className="mt-2 truncate text-xs font-medium text-[var(--muted)]"
                          >
                            /{category.slug || "—"}
                          </p>

                          <p className="mt-3 min-h-10 line-clamp-2 text-sm leading-5 text-[var(--muted)]">
                            {category.description ||
                              "برای این دسته توضیحی ثبت نشده است."}
                          </p>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-2">
                          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3">
                            <div className="flex items-center gap-2 text-[var(--muted)]">
                              <Package className="h-3.5 w-3.5" />
                              <span className="text-[11px]">محصولات</span>
                            </div>

                            <p className="mt-1.5 text-lg font-black text-[var(--text)]">
                              {formatNumber(productCount)}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3">
                            <div className="flex items-center gap-2 text-[var(--muted)]">
                              <Clock3 className="h-3.5 w-3.5" />
                              <span className="text-[11px]">ایجاد</span>
                            </div>

                            <p className="mt-1.5 truncate text-xs font-black text-[var(--text)]">
                              {formatDate(category.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
                          <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                            <Hash className="h-3.5 w-3.5" />
                            <span dir="ltr" className="max-w-[100px] truncate">
                              {category.id}
                            </span>
                          </div>

                          <Link
                            href={`/dashboard/categories/${category.id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-black text-[var(--primary)] transition hover:bg-[var(--primary-light)]"
                          >
                            مدیریت
                            <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-6 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={filteredCategories.length}
                  pageSize={PAGE_SIZE}
                  disabled={loading}
                />
              </div>
            </>
          )}
        </section>
      </div>

      {/* QUICK EDIT MODAL */}
      {modalOpen && (
        <Modal
          title={editing ? "ویرایش دسته‌بندی" : "ایجاد دسته‌بندی جدید"}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-2xl border border-[var(--primary)]/15 bg-[var(--primary-light)] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--primary)]">
                  <Tags className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-black text-[var(--text)]">
                    {editing
                      ? "اطلاعات دسته را بروزرسانی کنید"
                      : "یک دسته جدید به کاتالوگ اضافه کنید"}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    نام دسته برای نمایش به مشتری و slug برای ساختار URL استفاده
                    می‌شود.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="field-label">نام دسته‌بندی</label>

              <input
                value={form.name}
                onChange={(event) => handleNameChange(event.target.value)}
                placeholder="مثلاً دریل و پیچ‌گوشتی"
                className="input"
                autoFocus
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
                placeholder="drel-va-pich-goshti"
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
                placeholder="توضیح کوتاه درباره این دسته..."
                rows={4}
                className="input resize-none"
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
                  دسته فعال در بخش‌های فروشگاه قابل استفاده است.
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
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
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
                onClick={closeModal}
                disabled={saving}
                className="btn btn-secondary"
              >
                انصراف
              </button>

              <button
                type="submit"
                disabled={saving || !form.name.trim()}
                className="btn btn-primary min-w-32"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {editing ? "ذخیره تغییرات" : "ایجاد دسته"}
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </main>
  );
}
