"use client";

import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clipboard,
  Clock3,
  Eye,
  Filter,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import Pagination from "@/shared/ui/Pagination";
import type {
  ApiFailure,
  ApiSuccess,
  Customer,
  Sale,
  ShippingStatus,
} from "@/lib/types";

type SalesResponse = ApiSuccess<Sale[]> | ApiFailure;
type CustomersResponse = ApiSuccess<Customer[]> | ApiFailure;

type SortOption = "newest" | "oldest" | "highest" | "lowest";

type StatusFilter =
  | "ALL"
  | "PAID"
  | "PENDING_TRANSFER"
  | "PENDING_PAYMENT"
  | "PARTIAL"
  | "CANCELED";

const PAGE_SIZE = 10;

const shippingLabels: Record<ShippingStatus, string> = {
  PENDING: "در انتظار ارسال",
  PROCESSING: "در حال آماده‌سازی",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل شده",
  CANCELED: "لغو شده",
};

const paymentLabels: Record<string, string> = {
  PAID: "پرداخت شده",
  PENDING_TRANSFER: "در انتظار انتقال",
  PENDING_PAYMENT: "در انتظار پرداخت آنلاین",
  PARTIAL: "پرداخت ناقص",
  CANCELED: "لغو شده",
};

function isApiFailure<T>(
  result: ApiSuccess<T> | ApiFailure,
): result is ApiFailure {
  return result.success === false;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("fa-IR").format(Number(value || 0));
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getPaymentLabel(status: string) {
  return paymentLabels[status] || status || "نامشخص";
}

function getShippingLabel(status?: ShippingStatus) {
  return status ? shippingLabels[status] || status : "در انتظار ارسال";
}

function getInitials(name: string) {
  const normalized = name.trim();

  if (!normalized) {
    return "م";
  }

  const parts = normalized.split(/\s+/);

  if (parts.length >= 2) {
    return `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`;
  }

  return normalized.slice(0, 2);
}

function getPaymentStyle(status: string) {
  switch (status) {
    case "PAID":
      return {
        wrapper:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        dot: "bg-emerald-500",
        icon: CheckCircle2,
      };

    case "PENDING_PAYMENT":
    case "PENDING_TRANSFER":
      return {
        wrapper:
          "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        dot: "bg-amber-500",
        icon: Clock3,
      };

    case "PARTIAL":
      return {
        wrapper:
          "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400",
        dot: "bg-sky-500",
        icon: WalletCards,
      };

    case "CANCELED":
      return {
        wrapper:
          "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
        dot: "bg-red-500",
        icon: XCircle,
      };

    default:
      return {
        wrapper:
          "border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]",
        dot: "bg-[var(--muted)]",
        icon: CircleDollarSign,
      };
  }
}

function getShippingStyle(status?: ShippingStatus) {
  switch (status) {
    case "DELIVERED":
      return {
        wrapper:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        dot: "bg-emerald-500",
      };

    case "SHIPPED":
      return {
        wrapper:
          "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400",
        dot: "bg-sky-500",
      };

    case "PROCESSING":
      return {
        wrapper:
          "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        dot: "bg-amber-500",
      };

    case "CANCELED":
      return {
        wrapper:
          "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
        dot: "bg-red-500",
      };

    default:
      return {
        wrapper:
          "border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]",
        dot: "bg-[var(--muted)]",
      };
  }
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [sort, setSort] = useState<SortOption>("newest");

  const [page, setPage] = useState(1);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const customerMap = useMemo(() => {
    const map = new Map<string, Customer>();

    for (const customer of customers) {
      map.set(customer.id, customer);
    }

    return map;
  }, [customers]);

  async function loadData(isRefresh = false) {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [salesResponse, customersResponse] = await Promise.all([
        fetch("/api/admin/sales", {
          cache: "no-store",
        }),
        fetch("/api/admin/customers", {
          cache: "no-store",
        }),
      ]);

      const salesResult = (await salesResponse.json()) as SalesResponse;

      const customersResult =
        (await customersResponse.json()) as CustomersResponse;

      if (isApiFailure(salesResult)) {
        throw new Error(salesResult.error.message);
      }

      if (isApiFailure(customersResult)) {
        throw new Error(customersResult.error.message);
      }

      setSales(salesResult.data);
      setCustomers(customersResult.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "دریافت اطلاعات فروش انجام نشد.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, status, sort]);

  function getCustomer(sale: Sale) {
    if (!sale.customerId) {
      return null;
    }

    return customerMap.get(sale.customerId) || null;
  }

  function getCustomerName(sale: Sale) {
    const customer = getCustomer(sale);

    return customer?.name || sale.buyerName || "مشتری مهمان";
  }

  function getCustomerPhone(sale: Sale) {
    const customer = getCustomer(sale);

    return customer?.phone || sale.buyerPhone || "شماره ثبت نشده";
  }

  const filteredSales = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const result = sales.filter((sale) => {
      const customer = customerMap.get(sale.customerId || "");

      const searchable = [
        sale.id,
        sale.buyerName,
        sale.buyerPhone,
        sale.trackingCode,
        customer?.name,
        customer?.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch || searchable.includes(normalizedSearch);

      const matchesStatus = status === "ALL" || sale.paymentStatus === status;

      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

        case "highest":
          return Number(b.netAmount || 0) - Number(a.netAmount || 0);

        case "lowest":
          return Number(a.netAmount || 0) - Number(b.netAmount || 0);

        case "newest":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    return result;
  }, [sales, customerMap, search, status, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredSales.length / PAGE_SIZE));

  const safePage = Math.min(page, totalPages);

  const paginatedSales = filteredSales.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const total = sales.length;

  const paid = sales.filter((sale) => sale.paymentStatus === "PAID").length;

  const pending = sales.filter(
    (sale) =>
      sale.paymentStatus === "PENDING_TRANSFER" ||
      sale.paymentStatus === "PARTIAL",
  ).length;

  const canceled = sales.filter(
    (sale) => sale.paymentStatus === "CANCELED",
  ).length;

  const paidRevenue = sales
    .filter((sale) => sale.paymentStatus === "PAID")
    .reduce((sum, sale) => sum + Number(sale.netAmount || 0), 0);

  const shipped = sales.filter(
    (sale) =>
      sale.shippingStatus === "SHIPPED" || sale.shippingStatus === "DELIVERED",
  ).length;

  async function deleteSale() {
    if (!deleteId) {
      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(`/api/admin/sales/${deleteId}`, {
        method: "DELETE",
      });

      const result = (await response.json()) as
        | ApiSuccess<{ id: string }>
        | ApiFailure;

      if (isApiFailure(result)) {
        throw new Error(result.error.message);
      }

      setSales((current) => current.filter((sale) => sale.id !== deleteId));

      setDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حذف فروش انجام نشد.");
    } finally {
      setDeleting(false);
    }
  }

  async function copyTrackingCode(trackingCode: string, saleId: string) {
    try {
      await navigator.clipboard.writeText(trackingCode);

      setCopiedId(saleId);

      window.setTimeout(() => {
        setCopiedId((current) => (current === saleId ? null : current));
      }, 1500);
    } catch {
      // Clipboard unavailable.
    }
  }

  function clearFilters() {
    setSearch("");
    setStatus("ALL");
    setSort("newest");
  }

  const hasFilters =
    search.trim().length > 0 || status !== "ALL" || sort !== "newest";

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen w-full overflow-x-hidden bg-[var(--bg)] p-3 sm:p-4 md:p-6 lg:p-8"
      >
        <div className="mx-auto w-full max-w-[1500px] space-y-4 sm:space-y-5 md:space-y-6">
          <div className="h-40 animate-pulse rounded-[24px] bg-[var(--surface)] sm:h-44 sm:rounded-[28px]" />

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-[20px] bg-[var(--surface)] sm:h-32 sm:rounded-[22px]"
              />
            ))}
          </div>

          <div className="h-40 animate-pulse rounded-[22px] bg-[var(--surface)] sm:h-24" />

          <div className="space-y-2.5 sm:space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-[20px] bg-[var(--surface)] sm:h-24 sm:rounded-[22px]"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen w-full overflow-x-hidden bg-[var(--bg)] p-3 sm:p-4 md:p-6 lg:p-8"
    >
      <div className="mx-auto w-full max-w-[1500px] space-y-4 sm:space-y-5 md:space-y-6">
        {/* HERO */}
        <section className="relative w-full overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] sm:rounded-[28px]">
          <div className="pointer-events-none absolute -right-24 -top-28 h-56 w-56 rounded-full bg-[#00ADB5]/10 blur-3xl sm:h-72 sm:w-72" />

          <div className="pointer-events-none absolute -bottom-28 left-0 h-56 w-56 rounded-full bg-[#00ADB5]/5 blur-3xl" />

          <div className="relative flex min-w-0 flex-col gap-5 p-4 sm:p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-[#00ADB5]/20 bg-[#00ADB5]/10 px-2.5 py-1.5 text-[10px] font-bold text-[#00ADB5] sm:px-3 sm:text-xs">
                <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
                <span>مرکز مدیریت فروش</span>
              </div>

              <h1 className="text-2xl font-black tracking-tight text-[var(--text)] sm:text-3xl">
                فروش‌ها
              </h1>

              <p className="mt-2 max-w-xl text-xs leading-6 text-[var(--muted)] sm:text-sm sm:leading-7">
                تمام سفارش‌ها، پرداخت‌ها و وضعیت ارسال را از یکجا مدیریت و
                پیگیری کنید.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                <div className="flex items-center gap-2 text-[11px] text-[var(--muted)] sm:text-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {formatPrice(total)} فروش
                </div>

                <span className="hidden h-4 w-px bg-[var(--border)] sm:block" />

                <div className="flex items-center gap-2 text-[11px] text-[var(--muted)] sm:text-sm">
                  <Truck className="h-4 w-4" />
                  {formatPrice(shipped)} ارسال شده
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void loadData(true)}
              disabled={refreshing}
              className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 text-xs font-bold text-[var(--text)] transition hover:border-[#00ADB5]/40 hover:bg-[#00ADB5]/5 disabled:opacity-60 sm:w-auto sm:text-sm"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              بروزرسانی
            </button>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatCard
            label="کل فروش‌ها"
            value={formatPrice(total)}
            icon={ShoppingCart}
            accent="neutral"
          />

          <StatCard
            label="پرداخت شده"
            value={formatPrice(paid)}
            icon={CheckCircle2}
            accent="green"
            helper={total ? `${Math.round((paid / total) * 100)}٪` : "۰٪"}
          />

          <StatCard
            label="در انتظار"
            value={formatPrice(pending)}
            icon={Clock3}
            accent="amber"
            helper="نیازمند بررسی"
          />

          <StatCard
            label="لغو شده"
            value={formatPrice(canceled)}
            icon={XCircle}
            accent="red"
          />

          <StatCard
            label="درآمد پرداختی"
            value={formatPrice(paidRevenue)}
            suffix="تومان"
            icon={CircleDollarSign}
            accent="cyan"
          />

          <StatCard
            label="ارسال شده"
            value={formatPrice(shipped)}
            icon={Truck}
            accent="blue"
            helper={total ? `${Math.round((shipped / total) * 100)}٪` : "۰٪"}
          />
        </section>

        {/* FILTER AREA */}
        <section className="w-full min-w-0 overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-3 sm:rounded-[26px] sm:p-4 md:p-5">
          <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
            {/* SEARCH */}
            <div className="relative min-w-0 w-full">
              <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)] sm:right-4" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جستجو در فروش‌ها..."
                className="h-11 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] pr-10 pl-10 text-xs text-[var(--text)] outline-none transition placeholder:text-[var(--muted)] focus:border-[#00ADB5]/50 focus:ring-4 focus:ring-[#00ADB5]/10 sm:h-12 sm:rounded-2xl sm:pr-11 sm:text-sm"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute left-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface)] sm:left-3"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* STATUS + SORT */}
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_190px] sm:items-end">
              {/* STATUS */}
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold text-[var(--muted)] sm:hidden">
                  <Filter className="h-3.5 w-3.5" />
                  وضعیت پرداخت
                </div>

                <div className="grid min-w-0 grid-cols-2 gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-1.5 sm:flex sm:flex-wrap sm:items-center sm:gap-1">
                  <StatusButton
                    active={status === "ALL"}
                    label="همه"
                    count={sales.length}
                    onClick={() => setStatus("ALL")}
                  />

                  <StatusButton
                    active={status === "PAID"}
                    label="پرداخت شده"
                    count={
                      sales.filter((sale) => sale.paymentStatus === "PAID")
                        .length
                    }
                    onClick={() => setStatus("PAID")}
                  />

                  <StatusButton
                    active={status === "PENDING_TRANSFER"}
                    label="در انتظار"
                    count={
                      sales.filter(
                        (sale) => sale.paymentStatus === "PENDING_TRANSFER",
                      ).length
                    }
                    onClick={() => setStatus("PENDING_TRANSFER")}
                  />

                  <StatusButton
                    active={status === "PARTIAL"}
                    label="ناقص"
                    count={
                      sales.filter((sale) => sale.paymentStatus === "PARTIAL")
                        .length
                    }
                    onClick={() => setStatus("PARTIAL")}
                  />

                  <StatusButton
                    active={status === "CANCELED"}
                    label="لغو شده"
                    count={
                      sales.filter((sale) => sale.paymentStatus === "CANCELED")
                        .length
                    }
                    onClick={() => setStatus("CANCELED")}
                  />
                </div>
              </div>

              {/* SORT */}
              <div className="relative min-w-0 w-full">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold text-[var(--muted)] sm:hidden">
                  مرتب‌سازی
                </div>

                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as SortOption)
                  }
                  className="h-11 w-full min-w-0 appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface-2)] py-0 pl-10 pr-4 text-xs font-bold text-[var(--text)] outline-none focus:border-[#00ADB5]/50 sm:h-12 sm:text-sm"
                >
                  <option value="newest">جدیدترین</option>

                  <option value="oldest">قدیمی‌ترین</option>

                  <option value="highest">بیشترین مبلغ</option>

                  <option value="lowest">کمترین مبلغ</option>
                </select>

                <ChevronDown className="pointer-events-none absolute left-3 top-[calc(50%+10px)] h-4 w-4 -translate-y-1/2 text-[var(--muted)] sm:top-1/2" />
              </div>
            </div>

            {/* ACTIVE FILTERS */}
            {hasFilters && (
              <div className="flex min-w-0 flex-wrap items-center gap-2 border-t border-[var(--border)] pt-3 sm:pt-4">
                <span className="shrink-0 text-[10px] font-bold text-[var(--muted)] sm:text-xs">
                  فیلترهای فعال:
                </span>

                {search && (
                  <FilterChip
                    label={`جستجو: ${search}`}
                    onRemove={() => setSearch("")}
                  />
                )}

                {status !== "ALL" && (
                  <FilterChip
                    label={getPaymentLabel(status)}
                    onRemove={() => setStatus("ALL")}
                  />
                )}

                {sort !== "newest" && (
                  <FilterChip
                    label={
                      sort === "oldest"
                        ? "قدیمی‌ترین"
                        : sort === "highest"
                          ? "بیشترین مبلغ"
                          : "کمترین مبلغ"
                    }
                    onRemove={() => setSort("newest")}
                  />
                )}

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mr-0 inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-[#00ADB5] sm:mr-1 sm:text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  حذف فیلترها
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400 sm:p-4 sm:text-sm">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="min-w-0 flex-1">
              <p className="font-bold">خطا در دریافت اطلاعات</p>

              <p className="mt-1 break-words opacity-80">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 rounded-lg p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* TITLE */}
        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-[var(--text)] sm:text-xl">
              سفارش‌ها
            </h2>

            <p className="mt-1 text-[10px] text-[var(--muted)] sm:text-xs">
              نمایش {formatPrice(filteredSales.length)} نتیجه از{" "}
              {formatPrice(total)} فروش
            </p>
          </div>
        </div>

        {/* SALES */}
        {paginatedSales.length === 0 ? (
          <div className="flex min-h-[300px] w-full flex-col items-center justify-center overflow-hidden rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 text-center sm:min-h-[360px] sm:rounded-[28px]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00ADB5]/10 text-[#00ADB5] sm:h-16 sm:w-16">
              <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>

            <h3 className="mt-4 text-base font-black text-[var(--text)] sm:mt-5 sm:text-lg">
              فروشی پیدا نشد
            </h3>

            <p className="mt-2 max-w-sm text-xs leading-6 text-[var(--muted)] sm:text-sm sm:leading-7">
              با فیلترها یا عبارت جستجوی فعلی، نتیجه‌ای برای نمایش وجود ندارد.
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#00ADB5] px-4 py-2.5 text-xs font-bold text-white sm:mt-5 sm:px-5 sm:text-sm"
              >
                <RotateCcw className="h-4 w-4" />
                پاک کردن فیلترها
              </button>
            )}
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <section className="hidden w-full overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] lg:block">
              <div className="grid grid-cols-[minmax(220px,1.6fr)_140px_155px_145px_140px_100px] items-center gap-3 border-b border-[var(--border)] bg-[var(--surface-2)] px-5 py-4 text-[10px] font-black text-[var(--muted)] xl:grid-cols-[minmax(260px,1.6fr)_150px_165px_155px_145px_110px] xl:px-6">
                <span>فروش / مشتری</span>
                <span>مبلغ</span>
                <span>پرداخت</span>
                <span>ارسال</span>
                <span>تاریخ</span>
                <span className="text-left">عملیات</span>
              </div>

              <div className="divide-y divide-[var(--border)]">
                {paginatedSales.map((sale) => {
                  const customerName = getCustomerName(sale);

                  const customerPhone = getCustomerPhone(sale);

                  const paymentStyle = getPaymentStyle(sale.paymentStatus);

                  const PaymentIcon = paymentStyle.icon;

                  const shippingStyle = getShippingStyle(sale.shippingStatus);

                  return (
                    <div
                      key={sale.id}
                      className="grid grid-cols-[minmax(220px,1.6fr)_140px_155px_145px_140px_100px] items-center gap-3 px-5 py-4 transition hover:bg-[var(--surface-2)]/70 xl:grid-cols-[minmax(260px,1.6fr)_150px_165px_155px_145px_110px] xl:px-6 xl:py-5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00ADB5]/10 text-xs font-black text-[#00ADB5] xl:h-11 xl:w-11 xl:rounded-2xl xl:text-sm">
                          {getInitials(customerName)}
                        </div>

                        <div className="min-w-0">
                          <Link
                            href={`/dashboard/sales/${sale.id}`}
                            className="block truncate text-xs font-black text-[var(--text)] hover:text-[#00ADB5] xl:text-sm"
                          >
                            {customerName}
                          </Link>

                          <div className="mt-1 flex min-w-0 items-center gap-2 text-[10px] text-[var(--muted)]">
                            <span className="truncate">{customerPhone}</span>

                            <span className="hidden h-1 w-1 rounded-full bg-[var(--border)] xl:block" />

                            <span className="hidden font-mono xl:block">
                              #{sale.id.slice(-8)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-xs font-black text-[var(--text)] xl:text-sm">
                          {formatPrice(sale.netAmount)}
                        </div>

                        <div className="mt-1 text-[9px] text-[var(--muted)]">
                          تومان
                        </div>
                      </div>

                      <div className="min-w-0">
                        <span
                          className={`inline-flex max-w-full items-center gap-1.5 rounded-xl border px-2 py-2 text-[10px] font-bold xl:px-2.5 xl:text-[11px] ${paymentStyle.wrapper}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${paymentStyle.dot}`}
                          />

                          <PaymentIcon className="h-3.5 w-3.5 shrink-0" />

                          <span className="truncate">
                            {getPaymentLabel(sale.paymentStatus)}
                          </span>
                        </span>
                      </div>

                      <div className="min-w-0">
                        <span
                          className={`inline-flex max-w-full items-center gap-2 rounded-xl border px-2 py-2 text-[10px] font-bold xl:px-2.5 xl:text-[11px] ${shippingStyle.wrapper}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${shippingStyle.dot}`}
                          />

                          <span className="truncate">
                            {getShippingLabel(sale.shippingStatus)}
                          </span>
                        </span>
                      </div>

                      <div className="flex min-w-0 items-center gap-2 text-[10px] text-[var(--muted)] xl:text-xs">
                        <CalendarDays className="h-4 w-4 shrink-0" />

                        <span className="truncate leading-5">
                          {formatDate(sale.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/dashboard/sales/${sale.id}`}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:border-[#00ADB5]/30 hover:bg-[#00ADB5]/10 hover:text-[#00ADB5]"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setDeleteId(sale.id)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* MOBILE */}
            <section className="grid w-full min-w-0 grid-cols-1 gap-2.5 sm:gap-3 lg:hidden">
              {paginatedSales.map((sale) => {
                const customerName = getCustomerName(sale);

                const customerPhone = getCustomerPhone(sale);

                const paymentStyle = getPaymentStyle(sale.paymentStatus);

                const PaymentIcon = paymentStyle.icon;

                const shippingStyle = getShippingStyle(sale.shippingStatus);

                return (
                  <article
                    key={sale.id}
                    className="w-full min-w-0 overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)] sm:rounded-[24px]"
                  >
                    <div className="min-w-0 p-3.5 sm:p-4">
                      <div className="flex min-w-0 items-start justify-between gap-2.5">
                        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00ADB5]/10 text-xs font-black text-[#00ADB5] sm:h-11 sm:w-11 sm:rounded-2xl sm:text-sm">
                            {getInitials(customerName)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/dashboard/sales/${sale.id}`}
                              className="block truncate text-xs font-black text-[var(--text)] sm:text-sm"
                            >
                              {customerName}
                            </Link>

                            <p className="mt-1 truncate text-[10px] text-[var(--muted)] sm:text-[11px]">
                              {customerPhone}
                            </p>
                          </div>
                        </div>

                        <span className="max-w-[90px] shrink-0 truncate rounded-lg bg-[var(--surface-2)] px-2 py-1 font-mono text-[9px] text-[var(--muted)]">
                          #{sale.id.slice(-8)}
                        </span>
                      </div>

                      <div className="mt-4 w-full rounded-2xl bg-[var(--surface-2)] p-3 sm:mt-5 sm:p-4">
                        <div className="flex min-w-0 items-end justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold text-[var(--muted)]">
                              مبلغ نهایی
                            </p>

                            <div className="mt-1 flex min-w-0 items-baseline gap-1">
                              <p className="truncate text-lg font-black tracking-tight text-[var(--text)] sm:text-xl">
                                {formatPrice(sale.netAmount)}
                              </p>

                              <span className="shrink-0 text-[8px] font-bold text-[var(--muted)] sm:text-[10px]">
                                تومان
                              </span>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1 text-left text-[8px] text-[var(--muted)] sm:text-[10px]">
                            <CalendarDays className="h-3 w-3" />
                            <span>{formatDate(sale.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 grid min-w-0 grid-cols-2 gap-2">
                        <div
                          className={`min-w-0 overflow-hidden rounded-xl border px-2.5 py-2.5 ${paymentStyle.wrapper}`}
                        >
                          <div className="mb-1 flex items-center gap-1 text-[8px] opacity-70">
                            <PaymentIcon className="h-3 w-3 shrink-0" />
                            پرداخت
                          </div>

                          <p className="truncate text-[10px] font-bold">
                            {getPaymentLabel(sale.paymentStatus)}
                          </p>
                        </div>

                        <div
                          className={`min-w-0 overflow-hidden rounded-xl border px-2.5 py-2.5 ${shippingStyle.wrapper}`}
                        >
                          <div className="mb-1 flex items-center gap-1 text-[8px] opacity-70">
                            <Truck className="h-3 w-3 shrink-0" />
                            ارسال
                          </div>

                          <p className="truncate text-[10px] font-bold">
                            {getShippingLabel(sale.shippingStatus)}
                          </p>
                        </div>
                      </div>

                      {sale.trackingCode && (
                        <button
                          type="button"
                          onClick={() =>
                            void copyTrackingCode(sale.trackingCode!, sale.id)
                          }
                          className="mt-2.5 flex min-w-0 w-full items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-[10px]"
                        >
                          <span className="shrink-0 text-[var(--muted)]">
                            کد رهگیری
                          </span>

                          <span className="flex min-w-0 items-center gap-1.5 font-mono font-bold text-[var(--text)]">
                            <span className="truncate">
                              {copiedId === sale.id
                                ? "کپی شد ✓"
                                : sale.trackingCode}
                            </span>

                            <Clipboard className="h-3.5 w-3.5 shrink-0 text-[#00ADB5]" />
                          </span>
                        </button>
                      )}

                      <div className="mt-3 flex min-w-0 gap-2">
                        <Link
                          href={`/dashboard/sales/${sale.id}`}
                          className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#00ADB5] px-2 text-[10px] font-black text-white sm:h-11 sm:text-xs"
                        >
                          <Eye className="h-4 w-4 shrink-0" />
                          <span className="truncate">مشاهده جزئیات</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setDeleteId(sale.id)}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 sm:h-11 sm:w-11"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        )}

        {/* PAGINATION */}
        {paginatedSales.length > 0 && (
          <div className="w-full min-w-0 overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-2.5 sm:rounded-[22px] sm:p-3 md:p-4">
            <div className="min-w-0 overflow-x-auto">
              <Pagination
                page={safePage}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={filteredSales.length}
                pageSize={PAGE_SIZE}
              />
            </div>
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {deleteId && (
        <div
          className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center overflow-y-auto bg-black/50 p-3 backdrop-blur-sm sm:p-4"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              if (!deleting) {
                setDeleteId(null);
              }
            }
          }}
        >
          <div className="my-auto w-full max-w-md overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] shadow-2xl sm:rounded-[28px]">
            <div className="p-5 sm:p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 sm:h-14 sm:w-14">
                <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>

              <h3 className="mt-4 text-lg font-black text-[var(--text)] sm:text-xl">
                حذف فروش
              </h3>

              <p className="mt-2 text-xs leading-6 text-[var(--muted)] sm:text-sm sm:leading-7">
                آیا مطمئن هستید که می‌خواهید این فروش را حذف کنید؟ این عملیات
                قابل بازگشت نیست.
              </p>

              <div className="mt-5 flex flex-col-reverse gap-2.5 sm:mt-6 sm:flex-row sm:gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteId(null)}
                  disabled={deleting}
                  className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-xs font-bold text-[var(--text)] disabled:opacity-50 sm:flex-1 sm:text-sm"
                >
                  انصراف
                </button>

                <button
                  type="button"
                  onClick={() => void deleteSale()}
                  disabled={deleting}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-500 text-xs font-bold text-white disabled:opacity-60 sm:flex-1 sm:text-sm"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      در حال حذف...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      حذف فروش
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  suffix?: string;
  helper?: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  accent: "neutral" | "green" | "amber" | "red" | "cyan" | "blue";
};

function StatCard({
  label,
  value,
  suffix,
  helper,
  icon: Icon,
  accent,
}: StatCardProps) {
  const styles = {
    neutral: "bg-[var(--surface-2)] text-[var(--muted)]",
    green: "bg-emerald-500/10 text-emerald-500",
    amber: "bg-amber-500/10 text-amber-500",
    red: "bg-red-500/10 text-red-500",
    cyan: "bg-[#00ADB5]/10 text-[#00ADB5]",
    blue: "bg-sky-500/10 text-sky-500",
  };

  return (
    <div className="min-w-0 overflow-hidden rounded-[19px] border border-[var(--border)] bg-[var(--surface)] p-3 sm:rounded-[22px] sm:p-4">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${styles[accent]}`}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>

        {helper && (
          <span className="max-w-[65px] truncate rounded-md bg-[var(--surface-2)] px-1.5 py-1 text-[7px] font-bold text-[var(--muted)] sm:max-w-[90px] sm:rounded-lg sm:px-2 sm:text-[9px]">
            {helper}
          </span>
        )}
      </div>

      <p className="mt-3 truncate text-[9px] font-bold text-[var(--muted)] sm:mt-4 sm:text-[11px]">
        {label}
      </p>

      <div className="mt-1 flex min-w-0 items-baseline gap-1">
        <span className="truncate text-base font-black tracking-tight text-[var(--text)] sm:text-xl">
          {value}
        </span>

        {suffix && (
          <span className="shrink-0 text-[7px] font-bold text-[var(--muted)] sm:text-[9px]">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

type StatusButtonProps = {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
};

function StatusButton({ active, label, count, onClick }: StatusButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        min-w-0
        h-10
        w-full
        items-center
        justify-center
        gap-1.5
        rounded-lg
        px-2
        text-[10px]
        font-bold
        transition

        sm:h-9
        sm:w-auto
        sm:justify-start
        sm:px-3
        sm:text-[11px]

        ${
          active
            ? "bg-[var(--surface)] text-[var(--text)] shadow-sm ring-1 ring-[var(--border)]"
            : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
        }
      `}
    >
      <span className="truncate">{label}</span>

      <span
        className={`
          min-w-5
          shrink-0
          rounded-md
          px-1
          py-0.5
          text-[8px]
          sm:text-[9px]

          ${
            active
              ? "bg-[#00ADB5]/10 text-[#00ADB5]"
              : "bg-[var(--surface)] text-[var(--muted)]"
          }
        `}
      >
        {formatPrice(count)}
      </span>
    </button>
  );
}

type FilterChipProps = {
  label: string;
  onRemove: () => void;
};

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-[#00ADB5]/20 bg-[#00ADB5]/5 px-2 py-1.5 text-[9px] font-bold text-[#00ADB5] sm:px-2.5 sm:text-[10px]"
    >
      <span className="max-w-[180px] truncate">{label}</span>

      <X className="h-3 w-3 shrink-0" />
    </button>
  );
}
