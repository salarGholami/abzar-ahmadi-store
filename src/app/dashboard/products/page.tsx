"use client";

import Link from "next/link";
import {
  ArrowDownUp,
  ArrowLeft,
  BarChart3,
  Boxes,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  FileSpreadsheet,
  Filter,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Product } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

type SortKey =
  | "newest"
  | "oldest"
  | "price-high"
  | "price-low"
  | "stock-high"
  | "stock-low"
  | "name";

type ApiResponse<T> =
  | T
  | {
      success?: boolean;
      data?: T;
      products?: T;
      categories?: T;
      message?: string;
    };

type CategoryItem = {
  id: string;
  name: string;
  slug?: string;
};

const PAGE_SIZE = 10;

function formatPrice(value: number) {
  return new Intl.NumberFormat("fa-IR").format(Number(value || 0));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(Number(value || 0));
}

function getProductsFromResponse(response: ApiResponse<Product[]>): Product[] {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response.data)) return response.data;

  if (Array.isArray(response.products)) return response.products;

  return [];
}

function getCategoriesFromResponse(
  response: ApiResponse<CategoryItem[]>,
): CategoryItem[] {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response.data)) return response.data;

  if (Array.isArray(response.categories)) return response.categories;

  return [];
}

function getDiscountedPrice(product: Product) {
  const price = Number(product.price || 0);
  const discount = Number(product.discount || 0);

  if (!discount) return price;

  return Math.max(0, price - (price * discount) / 100);
}

function getStockStatus(stock: number) {
  if (stock <= 0) {
    return {
      label: "ناموجود",
      className: "badge",
      style: {
        background: "color-mix(in srgb, var(--danger) 12%, transparent)",
        color: "var(--danger)",
      },
    };
  }

  if (stock <= 5) {
    return {
      label: "رو به اتمام",
      className: "badge",
      style: {
        background: "color-mix(in srgb, var(--warning) 12%, transparent)",
        color: "var(--warning)",
      },
    };
  }

  return {
    label: "موجود",
    className: "badge",
    style: {
      background: "color-mix(in srgb, var(--success) 12%, transparent)",
      color: "var(--success)",
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState<
    "all" | "available" | "low" | "out"
  >("all");

  const [sort, setSort] = useState<SortKey>("newest");

  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ------------------------------------------------------------------------ */
  /* Fetch                                                                    */
  /* ------------------------------------------------------------------------ */

  const loadProducts = useCallback(async () => {
    try {
      setRefreshing(true);

      const response = await fetch("/api/admin/products", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("خطا در دریافت محصولات");
      }

      const json = (await response.json()) as ApiResponse<Product[]>;

      setProducts(getProductsFromResponse(json));
    } catch (error) {
      console.error(error);
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/categories", {
        cache: "no-store",
      });

      if (!response.ok) return;

      const json = (await response.json()) as ApiResponse<CategoryItem[]>;

      setCategories(getCategoriesFromResponse(json));
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    void Promise.all([loadProducts(), loadCategories()]);
  }, [loadProducts, loadCategories]);

  /* ------------------------------------------------------------------------ */
  /* Stats                                                                    */
  /* ------------------------------------------------------------------------ */

  const stats = useMemo(() => {
    const total = products.length;

    const available = products.filter(
      (product) => Number(product.stock || 0) > 0,
    ).length;

    const lowStock = products.filter((product) => {
      const stock = Number(product.stock || 0);
      return stock > 0 && stock <= 5;
    }).length;

    const outOfStock = products.filter(
      (product) => Number(product.stock || 0) <= 0,
    ).length;

    const totalInventory = products.reduce(
      (sum, product) => sum + Number(product.stock || 0),
      0,
    );

    return {
      total,
      available,
      lowStock,
      outOfStock,
      totalInventory,
    };
  }, [products]);

  /* ------------------------------------------------------------------------ */
  /* Filtering                                                                */
  /* ------------------------------------------------------------------------ */

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    let result = products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        [product.title, product.brand, product.sku, product.category]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedQuery),
          );

      const matchesCategory =
        category === "all" || String(product.category ?? "") === category;

      const stock = Number(product.stock || 0);

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "available" && stock > 5) ||
        (stockFilter === "low" && stock > 0 && stock <= 5) ||
        (stockFilter === "out" && stock <= 0);

      return matchesQuery && matchesCategory && matchesStock;
    });

    result = [...result].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return (
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
          );

        case "price-high":
          return Number(b.price || 0) - Number(a.price || 0);

        case "price-low":
          return Number(a.price || 0) - Number(b.price || 0);

        case "stock-high":
          return Number(b.stock || 0) - Number(a.stock || 0);

        case "stock-low":
          return Number(a.stock || 0) - Number(b.stock || 0);

        case "name":
          return a.title.localeCompare(b.title, "fa");

        case "newest":
        default:
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
      }
    });

    return result;
  }, [products, query, category, stockFilter, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE),
  );

  const currentPage = Math.min(page, totalPages);

  const visibleProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [query, category, stockFilter, sort]);

  /* ------------------------------------------------------------------------ */
  /* Selection                                                                */
  /* ------------------------------------------------------------------------ */

  const allVisibleSelected =
    visibleProducts.length > 0 &&
    visibleProducts.every((product) => selectedIds.includes(product.id));

  function toggleSelection(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function toggleSelectAll() {
    const visibleIds = visibleProducts.map((product) => product.id);

    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !visibleIds.includes(id)),
      );
      return;
    }

    setSelectedIds((current) => [...new Set([...current, ...visibleIds])]);
  }

  /* ------------------------------------------------------------------------ */
  /* Delete                                                                   */
  /* ------------------------------------------------------------------------ */

  async function deleteProduct(id: string) {
    const product = products.find((item) => item.id === id);

    if (!product) return;

    const confirmed = window.confirm(
      `آیا از حذف «${product.title}» مطمئن هستید؟`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("حذف محصول انجام نشد");
      }

      setProducts((current) => current.filter((item) => item.id !== id));

      setSelectedIds((current) => current.filter((item) => item !== id));
    } catch (error) {
      console.error(error);
      alert("حذف محصول انجام نشد.");
    } finally {
      setDeletingId(null);
    }
  }

  async function deleteSelected() {
    if (!selectedIds.length) return;

    const confirmed = window.confirm(
      `آیا از حذف ${selectedIds.length} محصول انتخاب‌شده مطمئن هستید؟`,
    );

    if (!confirmed) return;

    try {
      setBulkDeleting(true);

      const results = await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/admin/products/${id}`, {
            method: "DELETE",
          }),
        ),
      );

      const failed = results.some((response) => !response.ok);

      if (failed) {
        alert("برخی محصولات حذف نشدند.");
      }

      const successfulIds = selectedIds.filter(
        (_, index) => results[index]?.ok,
      );

      setProducts((current) =>
        current.filter((product) => !successfulIds.includes(product.id)),
      );

      setSelectedIds([]);
    } catch (error) {
      console.error(error);
      alert("حذف گروهی انجام نشد.");
    } finally {
      setBulkDeleting(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Excel Export                                                             */
  /* ------------------------------------------------------------------------ */

  async function exportExcel() {
    try {
      const XLSX = await import("xlsx");

      const rows = filteredProducts.map((product) => ({
        شناسه: product.id,
        "نام محصول": product.title,
        برند: product.brand,
        "کد کالا": product.sku,
        دسته‌بندی: product.category,
        قیمت: product.price,
        "تخفیف درصد": product.discount,
        "قیمت نهایی": getDiscountedPrice(product),
        موجودی: product.stock,
        "بهای خرید": product.purchaseCost ?? "",
        تصویر: product.image,
        توضیحات: product.description ?? "",
        امتیاز: product.rating ?? "",
        "تعداد نظرات": product.reviewCount ?? "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);

      worksheet["!cols"] = [
        { wch: 26 },
        { wch: 28 },
        { wch: 18 },
        { wch: 18 },
        { wch: 20 },
        { wch: 16 },
        { wch: 14 },
        { wch: 16 },
        { wch: 12 },
        { wch: 16 },
        { wch: 40 },
        { wch: 45 },
        { wch: 12 },
        { wch: 14 },
      ];

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

      XLSX.writeFile(
        workbook,
        `products-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
    } catch (error) {
      console.error(error);
      alert("خروجی Excel انجام نشد. مطمئن شوید پکیج xlsx نصب شده است.");
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Excel Import                                                             */
  /* ------------------------------------------------------------------------ */

  function normalizeExcelValue(value: unknown) {
    if (value === undefined || value === null) return "";
    return String(value).trim();
  }

  function getExcelField(row: Record<string, unknown>, keys: string[]) {
    const found = Object.keys(row).find((key) =>
      keys.includes(key.trim().toLowerCase()),
    );

    return found ? row[found] : "";
  }

  async function importExcel(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const XLSX = await import("xlsx");

      const buffer = await file.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
      });

      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        throw new Error("فایل Excel فاقد Sheet است.");
      }

      const worksheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

      if (!rows.length) {
        alert("فایل Excel خالی است.");
        return;
      }

      let successCount = 0;
      let failedCount = 0;

      for (const row of rows) {
        const title = normalizeExcelValue(
          getExcelField(row, ["نام محصول", "نام", "title", "product"]),
        );

        if (!title) {
          failedCount++;
          continue;
        }

        const product = {
          title,
          brand: normalizeExcelValue(getExcelField(row, ["برند", "brand"])),
          sku: normalizeExcelValue(
            getExcelField(row, ["کد کالا", "sku", "کد"]),
          ),
          category: normalizeExcelValue(
            getExcelField(row, ["دسته‌بندی", "دسته بندی", "category"]),
          ),
          price: Number(getExcelField(row, ["قیمت", "price"]) || 0),
          discount: Number(
            getExcelField(row, ["تخفیف درصد", "تخفیف", "discount"]) || 0,
          ),
          stock: Number(getExcelField(row, ["موجودی", "stock"]) || 0),
          purchaseCost: Number(
            getExcelField(row, ["بهای خرید", "purchaseCost"]) || 0,
          ),
          image: normalizeExcelValue(getExcelField(row, ["تصویر", "image"])),
          description: normalizeExcelValue(
            getExcelField(row, ["توضیحات", "description"]),
          ),
        };

        try {
          const response = await fetch("/api/admin/products", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(product),
          });

          if (!response.ok) {
            failedCount++;
            continue;
          }

          successCount++;
        } catch {
          failedCount++;
        }
      }

      await loadProducts();

      alert(
        `ورود Excel انجام شد.\n\nموفق: ${successCount}\nناموفق: ${failedCount}`,
      );
    } catch (error) {
      console.error(error);
      alert("خواندن فایل Excel انجام نشد. فرمت فایل را بررسی کنید.");
    } finally {
      event.target.value = "";
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <main
      className="min-h-screen px-4 py-5 sm:px-6 lg:px-8"
      style={{
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <div className="mx-auto max-w-[1500px] space-y-5">
        {/* ================================================================ */}
        {/* Header                                                            */}
        {/* ================================================================ */}

        <section
          className="relative overflow-hidden rounded-[28px] border p-5 sm:p-7"
          style={{
            background:
              "linear-gradient(135deg, var(--surface), color-mix(in srgb, var(--primary) 6%, var(--surface)))",
            borderColor: "var(--border)",
          }}
        >
          <div
            className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full blur-3xl"
            style={{
              background: "color-mix(in srgb, var(--primary) 13%, transparent)",
            }}
          />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{
                    background:
                      "color-mix(in srgb, var(--primary) 12%, transparent)",
                    color: "var(--primary)",
                  }}
                >
                  <Package size={18} />
                </span>

                <span
                  className="text-xs font-bold uppercase tracking-[0.18em]"
                  style={{ color: "var(--muted)" }}
                >
                  Inventory Management
                </span>
              </div>

              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                مدیریت محصولات
              </h1>

              <p
                className="mt-2 max-w-2xl text-sm leading-7"
                style={{ color: "var(--muted)" }}
              >
                مدیریت محصولات، موجودی، قیمت‌گذاری و اطلاعات کالاها از یک فضای
                یکپارچه.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary"
              >
                <Upload size={17} />
                ورود Excel
              </button>

              <button
                type="button"
                onClick={exportExcel}
                className="btn btn-secondary"
              >
                <Download size={17} />
                خروجی Excel
              </button>

              <Link href="/dashboard/products/new" className="btn btn-primary">
                <Plus size={18} />
                محصول جدید
              </Link>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={importExcel}
              />
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* Stats                                                             */}
        {/* ================================================================ */}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={<Boxes size={19} />}
            label="کل محصولات"
            value={stats.total}
            hint={`${formatNumber(stats.totalInventory)} عدد موجودی`}
            accent="primary"
          />

          <StatCard
            icon={<Zap size={19} />}
            label="محصولات فعال"
            value={stats.available}
            hint="دارای موجودی"
            accent="success"
          />

          <StatCard
            icon={<BarChart3 size={19} />}
            label="رو به اتمام"
            value={stats.lowStock}
            hint="موجودی کمتر از ۶"
            accent="warning"
          />

          <StatCard
            icon={<ShoppingBag size={19} />}
            label="ناموجود"
            value={stats.outOfStock}
            hint="نیازمند تأمین"
            accent="danger"
          />
        </section>

        {/* ================================================================ */}
        {/* Main                                                             */}
        {/* ================================================================ */}

        <section
          className="overflow-hidden rounded-[24px] border"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          {/* Toolbar */}

          <div
            className="border-b p-4 sm:p-5"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative min-w-0 flex-1 xl:max-w-xl">
                <Search
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--muted)" }}
                />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="جستجوی نام، برند، کد کالا یا دسته‌بندی..."
                  className="input w-full pr-11"
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg"
                    style={{
                      background: "var(--bg-secondary)",
                      color: "var(--muted)",
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters((current) => !current)}
                  className={`btn ${
                    showFilters ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  <Filter size={17} />
                  فیلتر
                  {(category !== "all" || stockFilter !== "all") && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1 text-[10px]">
                      {Number(category !== "all") +
                        Number(stockFilter !== "all")}
                    </span>
                  )}
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSort((current) => !current)}
                    className="btn btn-secondary"
                  >
                    <ArrowDownUp size={17} />
                    مرتب‌سازی
                    <ChevronDown
                      size={15}
                      className={`transition-transform ${
                        showSort ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showSort && (
                    <div
                      className="absolute left-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-2xl border p-1.5 shadow-xl"
                      style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                      }}
                    >
                      {[
                        ["newest", "جدیدترین"],
                        ["oldest", "قدیمی‌ترین"],
                        ["price-high", "گران‌ترین"],
                        ["price-low", "ارزان‌ترین"],
                        ["stock-high", "بیشترین موجودی"],
                        ["stock-low", "کمترین موجودی"],
                        ["name", "نام محصول"],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setSort(value as SortKey);
                            setShowSort(false);
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-right text-sm transition"
                          style={{
                            background:
                              sort === value
                                ? "var(--primary-light)"
                                : "transparent",
                            color:
                              sort === value
                                ? "var(--primary-dark)"
                                : "var(--text)",
                          }}
                        >
                          {label}

                          {sort === value && <Check size={15} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => void loadProducts()}
                  disabled={refreshing}
                  className="btn btn-secondary"
                  title="به‌روزرسانی"
                >
                  <RefreshCw
                    size={17}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  <span className="hidden sm:inline">بروزرسانی</span>
                </button>
              </div>
            </div>

            {/* Filters */}

            {showFilters && (
              <div
                className="mt-4 grid gap-3 rounded-2xl border p-4 md:grid-cols-2"
                style={{
                  background: "var(--surface-2)",
                  borderColor: "var(--border)",
                }}
              >
                <div>
                  <label className="field-label">دسته‌بندی</label>

                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="input w-full"
                  >
                    <option value="all">همه دسته‌بندی‌ها</option>

                    {categories.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="field-label">وضعیت موجودی</label>

                  <select
                    value={stockFilter}
                    onChange={(event) =>
                      setStockFilter(
                        event.target.value as
                          | "all"
                          | "available"
                          | "low"
                          | "out",
                      )
                    }
                    className="input w-full"
                  >
                    <option value="all">همه وضعیت‌ها</option>
                    <option value="available">موجود</option>
                    <option value="low">رو به اتمام</option>
                    <option value="out">ناموجود</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Selection Bar */}

          {selectedIds.length > 0 && (
            <div
              className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              style={{
                background:
                  "color-mix(in srgb, var(--primary) 7%, var(--surface))",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    background: "var(--primary)",
                    color: "white",
                  }}
                >
                  <Check size={16} />
                </div>

                <span className="text-sm font-bold">
                  {formatNumber(selectedIds.length)} محصول انتخاب شده
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="btn btn-secondary"
                >
                  لغو انتخاب
                </button>

                <button
                  type="button"
                  onClick={deleteSelected}
                  disabled={bulkDeleting}
                  className="btn btn-danger"
                >
                  <Trash2 size={16} />
                  {bulkDeleting ? "در حال حذف..." : "حذف انتخاب‌شده‌ها"}
                </button>
              </div>
            </div>
          )}

          {/* Table */}

          {loading ? (
            <LoadingState />
          ) : visibleProducts.length === 0 ? (
            <EmptyState
              hasFilters={
                Boolean(query) || category !== "all" || stockFilter !== "all"
              }
              onClear={() => {
                setQuery("");
                setCategory("all");
                setStockFilter("all");
              }}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] border-collapse">
                  <thead>
                    <tr
                      className="border-b text-right"
                      style={{
                        background: "var(--surface-2)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <th className="w-12 px-5 py-4">
                        <button
                          type="button"
                          onClick={toggleSelectAll}
                          className="flex h-5 w-5 items-center justify-center rounded-md border"
                          style={{
                            background: allVisibleSelected
                              ? "var(--primary)"
                              : "var(--surface)",
                            borderColor: allVisibleSelected
                              ? "var(--primary)"
                              : "var(--border)",
                            color: "white",
                          }}
                        >
                          {allVisibleSelected && <Check size={13} />}
                        </button>
                      </th>

                      <th className="px-4 py-4 text-xs font-bold text-[var(--muted)]">
                        محصول
                      </th>

                      <th className="px-4 py-4 text-xs font-bold text-[var(--muted)]">
                        دسته‌بندی
                      </th>

                      <th className="px-4 py-4 text-xs font-bold text-[var(--muted)]">
                        قیمت
                      </th>

                      <th className="px-4 py-4 text-xs font-bold text-[var(--muted)]">
                        موجودی
                      </th>

                      <th className="px-4 py-4 text-xs font-bold text-[var(--muted)]">
                        وضعیت
                      </th>

                      <th className="w-32 px-4 py-4 text-left text-xs font-bold text-[var(--muted)]">
                        عملیات
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleProducts.map((product) => {
                      const stock = Number(product.stock || 0);

                      const status = getStockStatus(stock);

                      const selected = selectedIds.includes(product.id);

                      return (
                        <tr
                          key={product.id}
                          className="group border-b transition-colors last:border-0"
                          style={{
                            borderColor: "var(--border)",
                            background: selected
                              ? "color-mix(in srgb, var(--primary) 4%, var(--surface))"
                              : "var(--surface)",
                          }}
                        >
                          {/* Select */}

                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => toggleSelection(product.id)}
                              className="flex h-5 w-5 items-center justify-center rounded-md border"
                              style={{
                                background: selected
                                  ? "var(--primary)"
                                  : "var(--surface)",
                                borderColor: selected
                                  ? "var(--primary)"
                                  : "var(--border)",
                                color: "white",
                              }}
                            >
                              {selected && <Check size={13} />}
                            </button>
                          </td>

                          {/* Product */}

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border"
                                style={{
                                  background: "var(--bg-secondary)",
                                  borderColor: "var(--border)",
                                }}
                              >
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.title}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  <div
                                    className="flex h-full w-full items-center justify-center"
                                    style={{
                                      color: "var(--muted)",
                                    }}
                                  >
                                    <Package size={20} />
                                  </div>
                                )}

                                {Number(product.discount || 0) > 0 && (
                                  <span
                                    className="absolute bottom-1 left-1 rounded-md px-1.5 py-0.5 text-[9px] font-black"
                                    style={{
                                      background: "var(--danger)",
                                      color: "white",
                                    }}
                                  >
                                    %{formatNumber(Number(product.discount))}
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0">
                                <Link
                                  href={`/dashboard/products/${product.id}/edit`}
                                  className="line-clamp-1 text-sm font-bold transition-colors hover:text-[var(--primary)]"
                                >
                                  {product.title}
                                </Link>

                                <div className="mt-1 flex items-center gap-2">
                                  <span
                                    className="text-xs"
                                    style={{
                                      color: "var(--muted)",
                                    }}
                                  >
                                    {product.brand || "بدون برند"}
                                  </span>

                                  <span
                                    className="h-1 w-1 rounded-full"
                                    style={{
                                      background: "var(--border)",
                                    }}
                                  />

                                  <span
                                    className="font-mono text-[11px]"
                                    style={{
                                      color: "var(--muted)",
                                    }}
                                  >
                                    {product.sku || "بدون کد"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category */}

                          <td className="px-4 py-4">
                            <span
                              className="inline-flex max-w-[160px] truncate rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                              style={{
                                background: "var(--bg-secondary)",
                                color: "var(--muted)",
                              }}
                            >
                              {product.category || "بدون دسته‌بندی"}
                            </span>
                          </td>

                          {/* Price */}

                          <td className="px-4 py-4">
                            <div className="flex flex-col items-start">
                              {Number(product.discount || 0) > 0 && (
                                <span
                                  className="text-[11px] line-through"
                                  style={{
                                    color: "var(--muted)",
                                  }}
                                >
                                  {formatPrice(Number(product.price || 0))}
                                </span>
                              )}

                              <div className="flex items-baseline gap-1">
                                <strong className="text-sm">
                                  {formatPrice(getDiscountedPrice(product))}
                                </strong>

                                <span
                                  className="text-[10px]"
                                  style={{
                                    color: "var(--muted)",
                                  }}
                                >
                                  تومان
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Stock */}

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-20">
                                <div
                                  className="mb-1.5 h-1.5 overflow-hidden rounded-full"
                                  style={{
                                    background: "var(--bg-secondary)",
                                  }}
                                >
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        Math.max(4, stock * 5),
                                      )}%`,
                                      background:
                                        stock <= 0
                                          ? "var(--danger)"
                                          : stock <= 5
                                            ? "var(--warning)"
                                            : "var(--success)",
                                    }}
                                  />
                                </div>
                              </div>

                              <span className="text-sm font-black">
                                {formatNumber(stock)}
                              </span>
                            </div>
                          </td>

                          {/* Status */}

                          <td className="px-4 py-4">
                            <span
                              className={status.className}
                              style={status.style}
                            >
                              <span
                                className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                                style={{
                                  background: "currentColor",
                                }}
                              />
                              {status.label}
                            </span>
                          </td>

                          {/* Actions */}

                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-1">
                              <Link
                                href={`/dashboard/products/${product.id}/edit`}
                                className="group flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 hover:-translate-y-0.5"
                                style={{
                                  background:
                                    "color-mix(in srgb, var(--primary) 7%, var(--surface))",
                                  borderColor:
                                    "color-mix(in srgb, var(--primary) 20%, var(--border))",
                                  color: "var(--primary)",
                                  boxShadow:
                                    "0 1px 2px color-mix(in srgb, var(--text) 6%, transparent)",
                                }}
                                title="ویرایش"
                              >
                                <Edit3
                                  size={16}
                                  strokeWidth={2.2}
                                  className="transition-transform duration-200 group-hover:scale-110"
                                />
                              </Link>
                              <button
                                type="button"
                                onClick={() => void deleteProduct(product.id)}
                                disabled={deletingId === product.id}
                                className="group flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                                style={{
                                  background:
                                    "color-mix(in srgb, var(--danger) 5%, var(--surface))",
                                  borderColor:
                                    "color-mix(in srgb, var(--danger) 20%, var(--border))",
                                  color: "var(--danger)",
                                  boxShadow:
                                    "0 1px 2px color-mix(in srgb, var(--text) 6%, transparent)",
                                }}
                                title="حذف"
                              >
                                {deletingId === product.id ? (
                                  <RefreshCw
                                    size={15}
                                    strokeWidth={2.2}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2
                                    size={16}
                                    strokeWidth={2.2}
                                    className="transition-transform duration-200 group-hover:scale-110"
                                  />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer */}

              <div
                className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="text-xs" style={{ color: "var(--muted)" }}>
                  نمایش{" "}
                  <strong style={{ color: "var(--text)" }}>
                    {formatNumber(
                      filteredProducts.length
                        ? (currentPage - 1) * PAGE_SIZE + 1
                        : 0,
                    )}
                  </strong>{" "}
                  تا{" "}
                  <strong style={{ color: "var(--text)" }}>
                    {formatNumber(
                      Math.min(
                        currentPage * PAGE_SIZE,
                        filteredProducts.length,
                      ),
                    )}
                  </strong>{" "}
                  از{" "}
                  <strong style={{ color: "var(--text)" }}>
                    {formatNumber(filteredProducts.length)}
                  </strong>{" "}
                  محصول
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border disabled:cursor-not-allowed disabled:opacity-40"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface)",
                    }}
                  >
                    <ChevronRight size={17} />
                  </button>

                  {Array.from(
                    { length: Math.min(totalPages, 5) },
                    (_, index) => {
                      let pageNumber = index + 1;

                      if (totalPages > 5) {
                        if (currentPage <= 3) {
                          pageNumber = index + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + index;
                        } else {
                          pageNumber = currentPage - 2 + index;
                        }
                      }

                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => setPage(pageNumber)}
                          className="flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-xs font-bold"
                          style={{
                            background:
                              currentPage === pageNumber
                                ? "var(--primary)"
                                : "var(--surface)",
                            color:
                              currentPage === pageNumber
                                ? "white"
                                : "var(--text)",
                            border:
                              currentPage === pageNumber
                                ? "1px solid var(--primary)"
                                : "1px solid var(--border)",
                          }}
                        >
                          {formatNumber(pageNumber)}
                        </button>
                      );
                    },
                  )}

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setPage((value) => Math.min(totalPages, value + 1))
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-xl border disabled:cursor-not-allowed disabled:opacity-40"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface)",
                    }}
                  >
                    <ChevronLeft size={17} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Stat Card                                                                  */
/* -------------------------------------------------------------------------- */

function StatCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
  accent: "primary" | "success" | "warning" | "danger";
}) {
  const colors = {
    primary: "var(--primary)",
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--danger)",
  };

  return (
    <div
      className="group relative overflow-hidden rounded-[22px] border p-4 sm:p-5"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            background: `color-mix(in srgb, ${colors[accent]} 11%, transparent)`,
            color: colors[accent],
          }}
        >
          {icon}
        </div>

        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "var(--muted)" }}
        >
          KPI
        </span>
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>
          {label}
        </p>

        <strong className="mt-1 block text-2xl font-black tracking-tight">
          {formatNumber(value)}
        </strong>

        <p className="mt-1 text-[11px]" style={{ color: "var(--muted)" }}>
          {hint}
        </p>
      </div>

      <div
        className="absolute -bottom-8 -left-8 h-20 w-20 rounded-full opacity-20 blur-2xl transition group-hover:opacity-40"
        style={{
          background: colors[accent],
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Loading                                                                    */
/* -------------------------------------------------------------------------- */

function LoadingState() {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="flex h-20 animate-pulse items-center gap-4 rounded-2xl"
          style={{
            background: "var(--bg-secondary)",
          }}
        >
          <div
            className="mr-4 h-12 w-12 rounded-xl"
            style={{
              background: "var(--border)",
            }}
          />

          <div className="flex-1 space-y-2">
            <div
              className="h-3 w-1/3 rounded-full"
              style={{
                background: "var(--border)",
              }}
            />

            <div
              className="h-2 w-1/5 rounded-full"
              style={{
                background: "var(--border)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty                                                                      */
/* -------------------------------------------------------------------------- */

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-5 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-[24px]"
        style={{
          background: "color-mix(in srgb, var(--primary) 9%, transparent)",
          color: "var(--primary)",
        }}
      >
        <Package size={32} />
      </div>

      <h3 className="mt-5 text-lg font-black">
        {hasFilters ? "محصولی با این فیلترها پیدا نشد" : "هنوز محصولی ثبت نشده"}
      </h3>

      <p
        className="mt-2 max-w-md text-sm leading-7"
        style={{ color: "var(--muted)" }}
      >
        {hasFilters
          ? "فیلترها یا عبارت جستجو را تغییر دهید تا محصولات بیشتری نمایش داده شود."
          : "اولین محصول فروشگاه ابزار احمدی را اضافه کنید."}
      </p>

      <div className="mt-5 flex gap-2">
        {hasFilters && (
          <button type="button" onClick={onClear} className="btn btn-secondary">
            <X size={16} />
            پاک کردن فیلترها
          </button>
        )}

        {!hasFilters && (
          <Link href="/dashboard/products/new" className="btn btn-primary">
            <Plus size={17} />
            افزودن محصول
          </Link>
        )}
      </div>
    </div>
  );
}
