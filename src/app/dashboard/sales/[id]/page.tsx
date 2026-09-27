"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clipboard,
  CreditCard,
  ExternalLink,
  FileText,
  Hash,
  Loader2,
  MapPin,
  Package,
  Phone,
  Printer,
  Receipt,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
  User,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import ShippingManager from "@/components/dashboard/ShippingManager";
import type {
  ApiFailure,
  ApiSuccess,
  Customer,
  Product,
  Sale,
  SaleItem,
  ShippingStatus,
} from "@/lib/types";

type ApiResult<T> = ApiSuccess<T> | ApiFailure;

type SalesResponse = ApiResult<Sale[]>;
type SaleItemsResponse = ApiResult<SaleItem[]>;
type ProductsResponse = ApiResult<Product[]>;
type CustomersResponse = ApiResult<Customer[]>;

const paymentLabels: Record<string, string> = {
  PAID: "پرداخت شده",
  PENDING_TRANSFER: "در انتظار انتقال",
  PARTIAL: "پرداخت ناقص",
  CANCELED: "لغو شده",
};

const shippingLabels: Record<ShippingStatus, string> = {
  PENDING: "در انتظار ارسال",
  PROCESSING: "در حال آماده‌سازی",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل شده",
  CANCELED: "لغو شده",
};

function isApiFailure<T>(result: ApiResult<T>): result is ApiFailure {
  return result.success === false;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("fa-IR").format(Number(value || 0));
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getPaymentClass(status: string) {
  switch (status) {
    case "PAID":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300";

    case "PENDING_TRANSFER":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300";

    case "PARTIAL":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300";

    case "CANCELED":
      return "border-red-200 bg-red-50 text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400";

    default:
      return "border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]";
  }
}

function getShippingClass(status: ShippingStatus) {
  switch (status) {
    case "DELIVERED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300";

    case "SHIPPED":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300";

    case "PROCESSING":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300";

    case "CANCELED":
      return "border-red-200 bg-red-50 text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400";

    default:
      return "border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]";
  }
}

function getInitials(name?: string | null) {
  if (!name) return "م";

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 1);
  }

  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`;
}

function SectionTitle({
  icon: Icon,
  title,
  description,
  count,
}: {
  icon: typeof Package;
  title: string;
  description?: string;
  count?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)]">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <h2 className="font-black text-[var(--text)]">{title}</h2>

          {description && (
            <p className="mt-0.5 text-xs text-[var(--muted)]">{description}</p>
          )}
        </div>
      </div>

      {count && (
        <span className="shrink-0 rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-black text-[var(--muted)]">
          {count}
        </span>
      )}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
  tone = "primary",
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  description?: string;
  tone?: "primary" | "green" | "blue" | "amber";
}) {
  const toneClasses = {
    primary:
      "bg-[var(--primary-light)] text-[var(--primary)] border-[var(--primary)]/10",
    green:
      "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40",
    blue: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40",
    amber:
      "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40",
  };

  return (
    <div className="group relative overflow-hidden rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.035)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(0,0,0,0.07)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-[var(--muted)]">{label}</p>

          <p className="mt-2 text-lg font-black tracking-tight text-[var(--text)]">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-[11px] text-[var(--muted)]">
              {description}
            </p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${toneClasses[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="pointer-events-none absolute -bottom-8 -left-8 h-20 w-20 rounded-full bg-[var(--primary)] opacity-[0.025] transition group-hover:scale-150" />
    </div>
  );
}

export default function SaleDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const [saleId, setSaleId] = useState("");

  const [sale, setSale] = useState<Sale | null>(null);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleting, setDeleting] = useState(false);

  const [paymentStatus, setPaymentStatus] = useState("");
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");

  const [trackingCopied, setTrackingCopied] = useState(false);

  useEffect(() => {
    void params.then((value) => {
      setSaleId(value.id);
    });
  }, [params]);

  useEffect(() => {
    if (!saleId) return;

    void loadSale();
  }, [saleId]);

  async function loadSale() {
    try {
      setLoading(true);
      setError("");

      const [
        salesResponse,
        itemsResponse,
        productsResponse,
        customersResponse,
      ] = await Promise.all([
        fetch("/api/admin/sales", {
          cache: "no-store",
        }),

        fetch("/api/admin/sale-items", {
          cache: "no-store",
        }),

        fetch("/api/admin/products", {
          cache: "no-store",
        }),

        fetch("/api/admin/customers", {
          cache: "no-store",
        }),
      ]);

      const salesResult = (await salesResponse.json()) as SalesResponse;
      const itemsResult = (await itemsResponse.json()) as SaleItemsResponse;
      const productsResult =
        (await productsResponse.json()) as ProductsResponse;
      const customersResult =
        (await customersResponse.json()) as CustomersResponse;

      if (isApiFailure(salesResult)) {
        throw new Error(salesResult.error.message);
      }

      if (isApiFailure(itemsResult)) {
        throw new Error(itemsResult.error.message);
      }

      if (isApiFailure(productsResult)) {
        throw new Error(productsResult.error.message);
      }

      if (isApiFailure(customersResult)) {
        throw new Error(customersResult.error.message);
      }

      const foundSale = salesResult.data.find((item) => item.id === saleId);

      if (!foundSale) {
        throw new Error("فروش موردنظر پیدا نشد.");
      }

      setSale(foundSale);
      setPaymentStatus(foundSale.paymentStatus);

      setItems(itemsResult.data.filter((item) => item.saleId === saleId));

      setProducts(productsResult.data);
      setCustomers(customersResult.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "خطا در دریافت اطلاعات فروش.",
      );
    } finally {
      setLoading(false);
    }
  }

  const customer = useMemo(() => {
    if (!sale?.customerId) {
      return null;
    }

    return customers.find((item) => item.id === sale.customerId);
  }, [customers, sale]);

  const itemRows = useMemo(() => {
    return items.map((item) => {
      const product = products.find(
        (productItem) => productItem.id === item.productId,
      );

      return {
        item,
        product,
      };
    });
  }, [items, products]);

  async function updatePaymentStatus() {
    if (!sale) return;

    if (paymentStatus === sale.paymentStatus) return;

    try {
      setUpdatingPayment(true);
      setPaymentMessage("");
      setError("");

      const response = await fetch(`/api/admin/sales/${sale.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentStatus,
        }),
      });

      const result = (await response.json()) as ApiResult<Sale>;

      if (isApiFailure(result)) {
        throw new Error(result.error.message);
      }

      setSale(result.data);
      setPaymentStatus(result.data.paymentStatus);
      setPaymentMessage("وضعیت پرداخت با موفقیت بروزرسانی شد.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "بروزرسانی وضعیت پرداخت انجام نشد.",
      );
    } finally {
      setUpdatingPayment(false);
    }
  }

  async function deleteSale() {
    if (!sale) return;

    const confirmed = window.confirm(
      "آیا از حذف این فروش مطمئن هستید؟ این عملیات قابل بازگشت نیست.",
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(`/api/admin/sales/${sale.id}`, {
        method: "DELETE",
      });

      const result = (await response.json()) as
        | ApiSuccess<{ id: string }>
        | ApiFailure;

      if (isApiFailure(result)) {
        throw new Error(result.error.message);
      }

      window.location.href = "/dashboard/sales";
    } catch (err) {
      setError(err instanceof Error ? err.message : "حذف فروش انجام نشد.");
    } finally {
      setDeleting(false);
    }
  }

  async function copyTrackingCode() {
    if (!sale?.trackingCode) return;

    try {
      await navigator.clipboard.writeText(sale.trackingCode);

      setTrackingCopied(true);

      window.setTimeout(() => {
        setTrackingCopied(false);
      }, 1500);
    } catch {
      setError("کپی کد رهگیری انجام نشد.");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 animate-pulse rounded-2xl bg-[var(--surface-2)]" />

            <div className="space-y-2">
              <div className="h-5 w-40 animate-pulse rounded-lg bg-[var(--surface-2)]" />
              <div className="h-3 w-64 animate-pulse rounded-lg bg-[var(--surface-2)]" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-[26px] bg-[var(--surface-2)]"
            />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
          <div className="h-[600px] animate-pulse rounded-[28px] bg-[var(--surface-2)]" />
          <div className="h-[500px] animate-pulse rounded-[28px] bg-[var(--surface-2)]" />
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-[var(--surface-2)] text-[var(--muted)]">
            <Package className="h-9 w-9" />
          </div>

          <h1 className="mt-5 text-xl font-black text-[var(--text)]">
            فروش پیدا نشد
          </h1>

          <p className="mt-2 text-sm text-[var(--muted)]">
            این سفارش وجود ندارد یا ممکن است قبلاً حذف شده باشد.
          </p>

          <Link
            href="/dashboard/sales"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-2xl bg-[var(--primary)] px-5 text-sm font-black text-white shadow-lg shadow-[var(--primary)]/20 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <ArrowRight className="h-4 w-4" />
            بازگشت به فروش‌ها
          </Link>
        </div>
      </div>
    );
  }

  const shippingStatus = sale.shippingStatus ?? "PENDING";

  const customerName = customer?.name || sale.buyerName || "مشتری مهمان";

  return (
    <div className="space-y-6 pb-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_12px_45px_rgba(0,0,0,0.045)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-[var(--primary)] via-cyan-400 to-transparent" />

        <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-[var(--primary)] opacity-[0.035] blur-3xl" />

        <div className="relative p-5 sm:p-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <Link
                href="/dashboard/sales"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)] transition hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                title="بازگشت به فروش‌ها"
              >
                <ArrowRight className="h-5 w-5" />
              </Link>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--primary-light)] px-3 py-1 text-[11px] font-black text-[var(--primary)]">
                    سفارش
                  </span>

                  <span className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-[11px] font-bold text-[var(--muted)]">
                    {sale.channel === "ONLINE" ? "فروش آنلاین" : "صندوق فروش"}
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] font-bold ${getShippingClass(
                      shippingStatus,
                    )}`}
                  >
                    {shippingLabels[shippingStatus]}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-black tracking-tight text-[var(--text)] sm:text-3xl">
                    جزئیات سفارش
                  </h1>

                  <span className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-black text-[var(--muted)]">
                    #{sale.id.slice(0, 8)}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--muted)]">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(sale.createdAt)}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {customerName}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              <Link
                href={`/dashboard/sales/${sale.id}/print`}
                target="_blank"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-black text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                <Printer className="h-4 w-4" />
                چاپ فاکتور
              </Link>

              <button
                type="button"
                onClick={() => void deleteSale()}
                disabled={deleting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                حذف سفارش
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-3 rounded-[24px] border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40">
            !
          </div>

          <div>{error}</div>
        </div>
      )}

      {paymentMessage && (
        <div className="flex items-center gap-3 rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
            <Check className="h-4 w-4" />
          </div>

          {paymentMessage}
        </div>
      )}

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Wallet}
          label="مبلغ نهایی"
          value={`${formatPrice(sale.netAmount)} تومان`}
          description="مبلغ قابل پرداخت سفارش"
          tone="primary"
        />

        <MetricCard
          icon={Receipt}
          label="سود ناخالص"
          value={`${formatPrice(sale.grossProfit)} تومان`}
          description="پس از کسر بهای تمام‌شده"
          tone="green"
        />

        <MetricCard
          icon={ShoppingBag}
          label="تعداد اقلام"
          value={formatPrice(
            items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
          )}
          description={`${formatPrice(itemRows.length)} محصول در سفارش`}
          tone="blue"
        />

        <MetricCard
          icon={Truck}
          label="ارسال"
          value={shippingLabels[shippingStatus]}
          description={sale.shippingCompany || "شرکت حمل ثبت نشده"}
          tone="amber"
        />
      </div>

      {/* Main layout */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
        {/* Main column */}
        <main className="min-w-0 space-y-6">
          {/* Products */}
          <section className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_8px_35px_rgba(0,0,0,0.035)]">
            <SectionTitle
              icon={ShoppingBag}
              title="اقلام سفارش"
              description="محصولات ثبت‌شده در این فروش"
              count={`${formatPrice(itemRows.length)} محصول`}
            />

            {itemRows.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center p-8 text-center">
                <Package className="h-9 w-9 text-[var(--muted)]" />

                <p className="mt-3 text-sm font-bold text-[var(--text)]">
                  آیتمی برای این فروش ثبت نشده است.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {itemRows.map(({ item, product }, index) => (
                  <div
                    key={item.id}
                    className="group p-5 transition hover:bg-[var(--surface-2)]/50 sm:p-6"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]">
                        {product?.image ? (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-7 w-7 text-[var(--muted)]" />
                          </div>
                        )}

                        <span className="absolute bottom-1 right-1 flex h-5 min-w-5 items-center justify-center rounded-lg bg-black/70 px-1 text-[9px] font-black text-white">
                          {formatPrice(index + 1)}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="truncate font-black text-[var(--text)]">
                              {product?.title || "محصول حذف شده"}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="rounded-lg bg-[var(--surface-2)] px-2.5 py-1 text-[11px] font-bold text-[var(--muted)]">
                                تعداد: {formatPrice(item.quantity)}
                              </span>

                              <span className="rounded-lg bg-[var(--surface-2)] px-2.5 py-1 text-[11px] font-bold text-[var(--muted)]">
                                واحد: {formatPrice(item.unitPrice)} تومان
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 sm:text-left">
                            <p className="text-lg font-black text-[var(--text)]">
                              {formatPrice(item.total)}
                            </p>

                            <p className="mt-0.5 text-[10px] font-bold text-[var(--muted)]">
                              تومان
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
                          <span className="text-[11px] text-[var(--muted)]">
                            بهای خرید
                          </span>

                          <span className="text-xs font-black text-[var(--text)]">
                            {formatPrice(item.purchaseCost)} تومان
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Financial */}
          <section className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_8px_35px_rgba(0,0,0,0.035)]">
            <SectionTitle
              icon={CreditCard}
              title="خلاصه مالی"
              description="جزئیات محاسبه مبلغ سفارش"
            />

            <div className="p-5 sm:p-6">
              <div className="rounded-[24px] bg-[var(--surface-2)] p-4 sm:p-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-[var(--muted)]">مبلغ اولیه</span>

                    <span className="font-bold text-[var(--text)]">
                      {formatPrice(sale.subtotal)} تومان
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-[var(--muted)]">تخفیف</span>

                    <span className="font-bold text-red-500">
                      − {formatPrice(sale.discount)} تومان
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-[var(--primary)]/15 bg-[var(--primary-light)] p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-[var(--primary)]">
                      مبلغ نهایی سفارش
                    </p>

                    <p className="mt-1 text-2xl font-black tracking-tight text-[var(--text)]">
                      {formatPrice(sale.netAmount)}
                    </p>
                  </div>

                  <span className="text-xs font-bold text-[var(--muted)]">
                    تومان
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] p-4">
                  <p className="text-xs text-[var(--muted)]">بهای تمام‌شده</p>

                  <p className="mt-2 font-black text-[var(--text)]">
                    {formatPrice(sale.cogs)} تومان
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    سود ناخالص
                  </p>

                  <p className="mt-2 font-black text-emerald-700 dark:text-emerald-300">
                    {formatPrice(sale.grossProfit)} تومان
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Shipping */}
          <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)]">
            <ShippingManager
              sale={sale}
              onUpdated={(updatedSale) => {
                setSale(updatedSale);
              }}
            />
          </div>

          {/* Tracking */}
          {sale.trackingCode && (
            <section className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_8px_35px_rgba(0,0,0,0.035)]">
              <div className="absolute inset-y-0 right-0 w-1 bg-[var(--primary)]" />

              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-[var(--primary)]" />

                      <p className="text-xs font-black text-[var(--muted)]">
                        کد رهگیری مرسوله
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <code
                        dir="ltr"
                        className="rounded-xl bg-[var(--surface-2)] px-4 py-2 text-lg font-black tracking-wider text-[var(--text)]"
                      >
                        {sale.trackingCode}
                      </code>

                      {sale.shippingCompany && (
                        <span className="text-xs font-bold text-[var(--muted)]">
                          {sale.shippingCompany}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void copyTrackingCode()}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-black text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    >
                      {trackingCopied ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Clipboard className="h-4 w-4" />
                      )}

                      {trackingCopied ? "کپی شد" : "کپی کد"}
                    </button>

                    {sale.trackingUrl && (
                      <a
                        href={sale.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-4 text-sm font-black text-white shadow-lg shadow-[var(--primary)]/15 transition hover:-translate-y-0.5 hover:shadow-xl"
                      >
                        <ExternalLink className="h-4 w-4" />
                        پیگیری مرسوله
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Receipt */}
          {(sale.receipt?.url || sale.receiptImage) && (
            <section className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_8px_35px_rgba(0,0,0,0.035)]">
              <SectionTitle
                icon={FileText}
                title="رسید پرداخت"
                description="تصویر رسید ثبت‌شده توسط مشتری"
              />

              <div className="p-5 sm:p-6">
                <a
                  href={sale.receipt?.url || sale.receiptImage || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative block overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)]"
                >
                  <img
                    src={sale.receipt?.url || sale.receiptImage || ""}
                    alt="رسید پرداخت"
                    className="max-h-[600px] w-full object-contain transition duration-500 group-hover:scale-[1.01]"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/10 group-hover:opacity-100">
                    <span className="rounded-2xl bg-white px-4 py-2 text-xs font-black text-gray-900 shadow-xl">
                      مشاهده تصویر
                    </span>
                  </div>
                </a>

                {sale.receipt?.fileName && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-[var(--muted)]">
                    <FileText className="h-3.5 w-3.5" />
                    {sale.receipt.fileName}
                  </div>
                )}
              </div>
            </section>
          )}
        </main>

        {/* Sidebar */}
        <aside className="min-w-0 space-y-6 xl:sticky xl:top-6 xl:self-start">
          {/* Customer */}
          <section className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_8px_35px_rgba(0,0,0,0.035)]">
            <div className="relative overflow-hidden bg-gradient-to-br from-[var(--primary-light)] to-[var(--surface)] p-6">
              <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-[var(--primary)] opacity-[0.06]" />

              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[var(--primary)] text-lg font-black text-white shadow-lg shadow-[var(--primary)]/20">
                  {getInitials(customerName)}
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-[var(--muted)]">
                    مشتری سفارش
                  </p>

                  <h2 className="mt-1 truncate font-black text-[var(--text)]">
                    {customerName}
                  </h2>

                  <div className="mt-1 flex items-center gap-1 text-[11px] text-[var(--muted)]">
                    <BadgeCheck className="h-3.5 w-3.5 text-[var(--primary)]" />
                    اطلاعات ثبت‌شده
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1 p-5">
              <div className="rounded-2xl p-3 transition hover:bg-[var(--surface-2)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--muted)]">
                    <Phone className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] text-[var(--muted)]">
                      شماره تماس
                    </p>

                    <p
                      dir="ltr"
                      className="mt-1 truncate text-sm font-black text-[var(--text)]"
                    >
                      {customer?.phone || sale.buyerPhone || "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-3 transition hover:bg-[var(--surface-2)]">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--muted)]">
                    <MapPin className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] text-[var(--muted)]">آدرس</p>

                    <p className="mt-1 text-sm font-semibold leading-6 text-[var(--text)]">
                      {customer?.address || "آدرسی ثبت نشده است."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_8px_35px_rgba(0,0,0,0.035)]">
            <SectionTitle
              icon={CreditCard}
              title="وضعیت پرداخت"
              description="مدیریت وضعیت مالی سفارش"
            />

            <div className="p-5">
              <div
                className={`rounded-2xl border p-4 ${getPaymentClass(
                  sale.paymentStatus,
                )}`}
              >
                <p className="text-[10px] font-bold opacity-70">وضعیت فعلی</p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-current" />

                  <span className="text-sm font-black">
                    {paymentLabels[sale.paymentStatus] ?? sale.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="relative mt-4">
                <select
                  value={paymentStatus}
                  onChange={(event) => setPaymentStatus(event.target.value)}
                  className="input w-full appearance-none pl-10"
                  disabled={updatingPayment}
                >
                  <option value="PAID">پرداخت شده</option>
                  <option value="PENDING_TRANSFER">در انتظار انتقال</option>
                  <option value="PARTIAL">پرداخت ناقص</option>
                  <option value="CANCELED">لغو شده</option>
                </select>

                <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              </div>

              <button
                type="button"
                onClick={() => void updatePaymentStatus()}
                disabled={
                  updatingPayment || paymentStatus === sale.paymentStatus
                }
                className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] text-sm font-black text-white shadow-lg shadow-[var(--primary)]/15 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {updatingPayment && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                بروزرسانی وضعیت
              </button>
            </div>
          </section>

          {/* Sale info */}
          <section className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_8px_35px_rgba(0,0,0,0.035)]">
            <SectionTitle
              icon={Store}
              title="اطلاعات سفارش"
              description="مشخصات ثبت سفارش"
            />

            <div className="p-5">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-4 rounded-xl px-3 py-3 hover:bg-[var(--surface-2)]">
                  <span className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <Store className="h-3.5 w-3.5" />
                    کانال
                  </span>

                  <span className="text-xs font-black text-[var(--text)]">
                    {sale.channel === "ONLINE" ? "آنلاین" : "صندوق فروش"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl px-3 py-3 hover:bg-[var(--surface-2)]">
                  <span className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <Hash className="h-3.5 w-3.5" />
                    شناسه
                  </span>

                  <code
                    dir="ltr"
                    className="max-w-[170px] truncate text-[10px] font-bold text-[var(--text)]"
                  >
                    {sale.id}
                  </code>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl px-3 py-3 hover:bg-[var(--surface-2)]">
                  <span className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <CalendarDays className="h-3.5 w-3.5" />
                    ثبت
                  </span>

                  <span className="text-[10px] font-bold text-[var(--text)]">
                    {formatDate(sale.createdAt)}
                  </span>
                </div>

                {sale.shippedAt && (
                  <div className="flex items-center justify-between gap-4 rounded-xl px-3 py-3 hover:bg-[var(--surface-2)]">
                    <span className="flex items-center gap-2 text-xs text-[var(--muted)]">
                      <Truck className="h-3.5 w-3.5" />
                      ارسال
                    </span>

                    <span className="text-[10px] font-bold text-[var(--text)]">
                      {formatDate(sale.shippedAt)}
                    </span>
                  </div>
                )}

                {sale.updatedAt && (
                  <div className="flex items-center justify-between gap-4 rounded-xl px-3 py-3 hover:bg-[var(--surface-2)]">
                    <span className="text-xs text-[var(--muted)]">
                      آخرین بروزرسانی
                    </span>

                    <span className="text-[10px] font-bold text-[var(--text)]">
                      {formatDate(sale.updatedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Order status mini timeline */}
          <section className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_8px_35px_rgba(0,0,0,0.035)]">
            <SectionTitle
              icon={Truck}
              title="مسیر سفارش"
              description="وضعیت فعلی پردازش سفارش"
            />

            <div className="p-5">
              <div className="relative space-y-5">
                <div className="absolute right-[15px] top-3 h-[calc(100%-28px)] w-px bg-[var(--border)]" />

                {[
                  {
                    title: "ثبت سفارش",
                    active: true,
                    icon: CheckCircle2,
                  },
                  {
                    title: "پرداخت",
                    active: sale.paymentStatus === "PAID",
                    icon: CreditCard,
                  },
                  {
                    title: "آماده‌سازی",
                    active:
                      shippingStatus === "PROCESSING" ||
                      shippingStatus === "SHIPPED" ||
                      shippingStatus === "DELIVERED",
                    icon: Package,
                  },
                  {
                    title: "ارسال / تحویل",
                    active:
                      shippingStatus === "SHIPPED" ||
                      shippingStatus === "DELIVERED",
                    icon: Truck,
                  },
                ].map((step) => {
                  const StepIcon = step.icon;

                  return (
                    <div
                      key={step.title}
                      className="relative flex items-center gap-3"
                    >
                      <div
                        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
                          step.active
                            ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                            : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
                        }`}
                      >
                        <StepIcon className="h-3.5 w-3.5" />
                      </div>

                      <span
                        className={`text-xs ${
                          step.active
                            ? "font-black text-[var(--text)]"
                            : "font-medium text-[var(--muted)]"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
