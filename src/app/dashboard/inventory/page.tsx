"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Package,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  X,
} from "lucide-react";
import Modal from "@/shared/ui/Modal";
import type { Product, InventoryMovement } from "@/lib/types";

const PAGE_SIZE = 10;

const fa = (value: number) => new Intl.NumberFormat("fa-IR").format(value);

const cn = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export default function InventoryPage() {
  const [rows, setRows] = useState<InventoryMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const [search, setSearch] = useState("");
  const [movementFilter, setMovementFilter] = useState<"ALL" | "IN" | "OUT">(
    "ALL",
  );

  const [page, setPage] = useState(1);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const [inventoryResponse, productsResponse] = await Promise.all([
        fetch("/api/admin/inventory", {
          cache: "no-store",
        }),
        fetch("/api/admin/products", {
          cache: "no-store",
        }),
      ]);

      if (!inventoryResponse.ok || !productsResponse.ok) {
        throw new Error("دریافت اطلاعات انبار ناموفق بود.");
      }

      const [inventoryJson, productsJson] = await Promise.all([
        inventoryResponse.json(),
        productsResponse.json(),
      ]);

      setRows(
        inventoryJson.success ? [...(inventoryJson.data ?? [])].reverse() : [],
      );

      setProducts(productsJson.success ? (productsJson.data ?? []) : []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "دریافت اطلاعات انبار ناموفق بود.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const totalStock = useMemo(
    () =>
      products.reduce(
        (total, product) => total + Number(product.stock ?? 0),
        0,
      ),
    [products],
  );

  const lowStockProducts = useMemo(
    () => products.filter((product) => Number(product.stock ?? 0) <= 5),
    [products],
  );

  const outOfStockProducts = useMemo(
    () => products.filter((product) => Number(product.stock ?? 0) <= 0),
    [products],
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fa");

    return rows.filter((movement) => {
      const product = productMap.get(movement.productId);

      const searchableText = [
        movement.productId,
        movement.reason ?? "",
        product?.title ?? "",
        product?.sku ?? "",
      ]
        .join(" ")
        .toLocaleLowerCase("fa");

      const matchesSearch = !query || searchableText.includes(query);

      const matchesMovement =
        movementFilter === "ALL" ||
        (movementFilter === "IN" && movement.quantity > 0) ||
        (movementFilter === "OUT" && movement.quantity < 0);

      return matchesSearch && matchesMovement;
    });
  }, [rows, productMap, search, movementFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;

    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [search, movementFilter]);

  const openModal = () => {
    setProductId("");
    setQuantity("");
    setReason("");
    setError(null);
    setModalOpen(true);
  };

  const submit = async () => {
    const parsedQuantity = Number(quantity);

    if (
      !productId ||
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity === 0
    ) {
      setError("محصول و مقدار تعدیل غیر صفر الزامی است.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/inventory/adjust", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: parsedQuantity,
          reason: reason.trim(),
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        setError(json.error?.message ?? "ثبت تعدیل موجودی ناموفق بود.");
        return;
      }

      setModalOpen(false);

      await load(true);
    } catch {
      setError("خطا در ارتباط با سرور.");
    } finally {
      setSaving(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setMovementFilter("ALL");
    setPage(1);
  };

  const hasFilters = Boolean(search) || movementFilter !== "ALL";

  return (
    <main dir="rtl" className="mx-auto w-full max-w-[1600px] space-y-4">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
          <Boxes size={15} />

          <span>مدیریت فروشگاه</span>

          <ChevronLeft size={13} />

          <strong className="text-[var(--text)]">مدیریت انبار</strong>
        </div>

        <button
          type="button"
          onClick={() => void load(true)}
          disabled={refreshing}
          className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted)] transition hover:text-[var(--text)] disabled:opacity-50"
          title="تازه‌سازی"
        >
          <RefreshCw
            size={15}
            className={refreshing ? "animate-spin" : undefined}
          />
        </button>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-[#18232d] p-5 text-white sm:p-6">
        <div className="absolute -left-20 -top-24 size-80 rounded-full bg-[#00adb5]/15 blur-3xl" />

        <div className="absolute bottom-0 right-1/3 h-px w-1/2 bg-gradient-to-l from-transparent via-[#00adb5]/60 to-transparent" />

        <div className="relative flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold text-[#8adfe1]">
              <ClipboardList size={15} />
              مرکز کنترل موجودی
              <span className="rounded-md border border-white/15 px-2 py-1 text-[10px] text-slate-300">
                INVENTORY MANAGEMENT
              </span>
            </div>

            <h1 className="text-2xl font-black sm:text-3xl">
              مدیریت هوشمند انبار
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              کنترل موجودی محصولات، شناسایی کمبود کالا و ثبت تمام تغییرات انبار
              در یک فضای کاری واحد.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00adb5] px-4 py-3 text-sm font-extrabold text-[#10242a] transition hover:bg-[#39c6cb]"
            >
              <Plus size={17} />
              تعدیل موجودی
            </button>

            <button
              type="button"
              onClick={() => void load(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : undefined}
              />
              بروزرسانی
            </button>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-2 border-t border-white/10 pt-4 sm:grid-cols-4">
          <div className="rounded-lg bg-white/5 px-3 py-2">
            <p className="text-[10px] text-slate-400">محصولات</p>

            <p className="mt-1 text-lg font-black tabular-nums">
              {fa(products.length)}
            </p>
          </div>

          <div className="rounded-lg bg-white/5 px-3 py-2">
            <p className="text-[10px] text-slate-400">موجودی کل</p>

            <p className="mt-1 text-lg font-black tabular-nums">
              {fa(totalStock)}
            </p>
          </div>

          <div className="rounded-lg bg-white/5 px-3 py-2">
            <p className="text-[10px] text-slate-400">موجودی کم</p>

            <p className="mt-1 text-lg font-black tabular-nums text-amber-300">
              {fa(lowStockProducts.length)}
            </p>
          </div>

          <div className="rounded-lg bg-white/5 px-3 py-2">
            <p className="text-[10px] text-slate-400">ناموجود</p>

            <p className="mt-1 text-lg font-black tabular-nums text-red-300">
              {fa(outOfStockProducts.length)}
            </p>
          </div>
        </div>
      </section>

      {/* Stock health */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[var(--muted)]">
                موجودی کل
              </p>

              <p className="mt-2 text-2xl font-black text-[var(--text)]">
                {fa(totalStock)}
              </p>

              <p className="mt-1 text-[10px] text-[var(--muted)]">
                مجموع واحدهای موجود در انبار
              </p>
            </div>

            <div className="grid size-10 place-items-center rounded-xl bg-[#00adb5]/10 text-[#00adb5]">
              <Package size={20} />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                نیازمند تأمین
              </p>

              <p className="mt-2 text-2xl font-black text-[var(--text)]">
                {fa(lowStockProducts.length)}
              </p>

              <p className="mt-1 text-[10px] text-[var(--muted)]">
                محصولات با موجودی ۵ عدد یا کمتر
              </p>
            </div>

            <div className="grid size-10 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
              <AlertTriangle size={20} />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-red-600">ناموجود</p>

              <p className="mt-2 text-2xl font-black text-[var(--text)]">
                {fa(outOfStockProducts.length)}
              </p>

              <p className="mt-1 text-[10px] text-[var(--muted)]">
                محصولات بدون موجودی قابل فروش
              </p>
            </div>

            <div className="grid size-10 place-items-center rounded-xl bg-red-500/10 text-red-600">
              <Boxes size={20} />
            </div>
          </div>
        </div>
      </section>

      {/* Control Center */}
      <section className="overflow-visible rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex flex-col justify-between gap-3 border-b border-[var(--border)] p-4 xl:flex-row xl:items-center">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[var(--bg-secondary)] text-[var(--primary)]">
              <Settings2 size={19} />
            </div>

            <div>
              <h2 className="font-black text-[var(--text)]">
                مرکز کنترل حرکات انبار
              </h2>

              <p className="mt-1 text-[11px] text-[var(--muted)]">
                جست‌وجو و تفکیک ورود و خروج کالا
              </p>
            </div>
          </div>

          {hasFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="btn btn-secondary inline-flex items-center gap-2"
            >
              <X size={15} />
              پاک کردن فیلترها
            </button>
          ) : null}
        </div>

        <div className="grid gap-3 p-4 lg:grid-cols-[minmax(280px,1fr)_auto]">
          <div className="relative">
            <Search
              size={17}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جست‌وجوی محصول، SKU یا دلیل تعدیل..."
              className="input w-full pr-10"
            />

            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                aria-label="پاک کردن جست‌وجو"
              >
                <X size={15} />
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-[var(--bg-secondary)] p-1">
            {(
              [
                ["ALL", "همه"],
                ["IN", "ورود کالا"],
                ["OUT", "خروج کالا"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMovementFilter(value)}
                className={cn(
                  "rounded-lg px-4 py-2 text-xs font-bold transition",
                  movementFilter === value
                    ? "bg-[var(--surface)] text-[var(--primary)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--text)]",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table heading */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-y border-[var(--border)] bg-[var(--bg-secondary)]/60 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--text)]">
            <ClipboardList size={16} className="text-[var(--primary)]" />
            تاریخچه حرکات انبار
          </div>

          <div className="flex items-center gap-3 text-[10px] text-[var(--muted)]">
            <span>{fa(filteredRows.length)} حرکت</span>

            <span>
              صفحه {fa(page)} از {fa(totalPages)}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] border-collapse text-right">
            <thead>
              <tr className="bg-[var(--surface)] text-[10px] font-bold text-[var(--muted)]">
                <th className="px-4 py-3">ردیف</th>

                <th className="px-4 py-3">محصول</th>

                <th className="px-4 py-3">SKU</th>

                <th className="px-4 py-3">نوع حرکت</th>

                <th className="px-4 py-3">مقدار تغییر</th>

                <th className="px-4 py-3">موجودی فعلی</th>

                <th className="px-4 py-3">دلیل</th>

                <th className="px-4 py-3">تاریخ</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <tr key={index} className="border-t border-[var(--border)]">
                    {Array.from({ length: 8 }).map((_, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-4">
                        <div className="h-5 animate-pulse rounded-md bg-[var(--bg-secondary)]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedRows.length > 0 ? (
                paginatedRows.map((movement, index) => {
                  const product = productMap.get(movement.productId);

                  const isIncoming = movement.quantity > 0;

                  const stock = Number(product?.stock ?? 0);

                  return (
                    <tr
                      key={movement.id}
                      className="border-t border-[var(--border)] text-xs transition hover:bg-[var(--bg-secondary)]/50"
                    >
                      <td className="px-4 py-3.5 text-[var(--muted)]">
                        {fa((page - 1) * PAGE_SIZE + index + 1)}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                            <Package size={15} />
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[220px] truncate font-bold text-[var(--text)]">
                              {product?.title ?? movement.productId}
                            </p>

                            <p className="mt-0.5 text-[9px] text-[var(--muted)]">
                              {movement.productId}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[10px] text-[var(--muted)]">
                        {product?.sku ?? "—"}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-extrabold",
                            isIncoming
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-red-500/10 text-red-600",
                          )}
                        >
                          {isIncoming ? (
                            <ArrowUpRight size={12} />
                          ) : (
                            <ArrowDownLeft size={12} />
                          )}

                          {isIncoming ? "ورود" : "خروج"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "font-black tabular-nums",
                            isIncoming ? "text-emerald-600" : "text-red-600",
                          )}
                        >
                          {isIncoming ? "+" : ""}
                          {fa(movement.quantity)}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "font-black tabular-nums",
                            stock <= 0
                              ? "text-red-600"
                              : stock <= 5
                                ? "text-amber-600"
                                : "text-[var(--text)]",
                          )}
                        >
                          {fa(stock)}
                        </span>

                        <span className="mr-1 text-[9px] text-[var(--muted)]">
                          عدد
                        </span>
                      </td>

                      <td className="max-w-[220px] px-4 py-3.5">
                        <span className="block truncate text-[var(--muted)]">
                          {movement.reason || "بدون توضیح"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-[var(--muted)]">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <CalendarDays size={13} />

                          {formatDate(movement.updatedAt)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-3 grid size-12 place-items-center rounded-xl bg-[var(--bg-secondary)] text-[var(--muted)]">
                        <Search size={20} />
                      </div>

                      <p className="font-bold text-[var(--text)]">
                        حرکت انباری یافت نشد
                      </p>

                      <p className="mt-1 text-xs text-[var(--muted)]">
                        فیلتر یا عبارت جست‌وجو را تغییر دهید.
                      </p>

                      {hasFilters ? (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="mt-3 text-xs font-bold text-[var(--primary)]"
                        >
                          پاک کردن فیلترها
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredRows.length > 0 ? (
          <div className="flex flex-col gap-3 border-t border-[var(--border)] bg-[var(--bg-secondary)]/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[10px] text-[var(--muted)]">
              نمایش{" "}
              <strong className="text-[var(--text)]">
                {fa(Math.min((page - 1) * PAGE_SIZE + 1, filteredRows.length))}
              </strong>{" "}
              تا{" "}
              <strong className="text-[var(--text)]">
                {fa(Math.min(page * PAGE_SIZE, filteredRows.length))}
              </strong>{" "}
              از{" "}
              <strong className="text-[var(--text)]">
                {fa(filteredRows.length)}
              </strong>{" "}
              حرکت
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="grid size-9 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="صفحه قبل"
              >
                <ChevronRight size={15} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter(
                  (item) =>
                    item === 1 ||
                    item === totalPages ||
                    Math.abs(item - page) <= 1,
                )
                .map((item, index, visible) => {
                  const previous = visible[index - 1];

                  const showDots =
                    previous !== undefined && item - previous > 1;

                  return (
                    <div key={item} className="flex items-center gap-1">
                      {showDots ? (
                        <span className="px-1 text-xs text-[var(--muted)]">
                          …
                        </span>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => setPage(item)}
                        className={cn(
                          "grid size-9 place-items-center rounded-lg text-xs font-bold transition",
                          page === item
                            ? "bg-[var(--primary)] text-white"
                            : "border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]",
                        )}
                      >
                        {fa(item)}
                      </button>
                    </div>
                  );
                })}

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                className="grid size-9 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="صفحه بعد"
              >
                <ChevronLeft size={15} />
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* Error */}
      {error ? (
        <section className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="text-sm font-bold text-red-600">{error}</div>
        </section>
      ) : null}

      {/* Adjustment Modal */}
      {modalOpen ? (
        <Modal
          title="ثبت تعدیل موجودی"
          onClose={() => !saving && setModalOpen(false)}
        >
          <div className="space-y-4">
            {error ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[var(--muted)]">
                محصول
              </label>

              <select
                className="input w-full"
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
              >
                <option value="">انتخاب محصول</option>

                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title} — موجودی فعلی: {product.stock}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[var(--muted)]">
                مقدار تعدیل
              </label>

              <input
                className="input w-full"
                type="number"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="مثلاً 5 یا -3"
              />

              <p className="mt-1.5 text-[10px] text-[var(--muted)]">
                مقدار مثبت موجودی را افزایش و مقدار منفی موجودی را کاهش می‌دهد.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[var(--muted)]">
                دلیل تعدیل
              </label>

              <input
                className="input w-full"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="مثلاً شمارش فیزیکی یا کالای معیوب"
              />
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={() => void submit()}
              className="btn btn-primary w-full disabled:opacity-60"
            >
              {saving ? "در حال ثبت..." : "ثبت تعدیل موجودی"}
            </button>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}
