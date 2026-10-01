"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  MapPin,
  Package,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
  Wallet,
  XCircle,
} from "lucide-react";
import { EmptyState, PageHeader, money } from "@/features/portal/ui/PortalUI";

type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELED";

type OrderItem = {
  id: string | number;
  productId?: string | number;
  quantity?: number;
  total?: number;
  unitPrice?: number;
  product?: {
    title?: string;
    image?: string | null;
  } | null;
};

type ShippingAddress = {
  recipientName?: string;
  province?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  phone?: string;
};

type Order = {
  id: string | number;
  netAmount?: number;
  paymentStatus?: string;
  paymentProvider?: string;
  shippingStatus?: OrderStatus | string;
  createdAt?: string;
  trackingCode?: string | null;
  receiptImage?: string | null;
  shippingAddress?: ShippingAddress | null;
  items?: OrderItem[];
};

const steps: OrderStatus[] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

const stepLabels: Record<string, string> = {
  PENDING: "ثبت سفارش",
  PROCESSING: "آماده‌سازی",
  SHIPPED: "تحویل به پست",
  DELIVERED: "تحویل سفارش",
};

const paymentLabels: Record<string, string> = {
  PAID: "پرداخت‌شده",
  PENDING: "در انتظار پرداخت",
  PENDING_TRANSFER: "در انتظار تأیید واریز",
  PARTIAL: "پرداخت جزئی",
  FAILED: "پرداخت ناموفق",
  CANCELED: "لغو شده",
};

const shippingLabels: Record<string, string> = {
  PENDING: "ثبت شده",
  PROCESSING: "در حال آماده‌سازی",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل داده شده",
  CANCELED: "لغو شده",
};

function formatDate(value?: string) {
  if (!value) return "تاریخ نامشخص";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "تاریخ نامشخص";

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getOrderStatus(status?: string) {
  const value = status || "PENDING";

  if (value === "DELIVERED") {
    return {
      label: "تحویل داده شده",
      className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      icon: CheckCircle2,
    };
  }

  if (value === "SHIPPED") {
    return {
      label: "ارسال شده",
      className: "bg-sky-500/10 text-sky-600 border-sky-500/20",
      icon: Truck,
    };
  }

  if (value === "PROCESSING") {
    return {
      label: "در حال آماده‌سازی",
      className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      icon: Package,
    };
  }

  if (value === "CANCELED") {
    return {
      label: "لغو شده",
      className: "bg-rose-500/10 text-rose-600 border-rose-500/20",
      icon: XCircle,
    };
  }

  return {
    label: "ثبت سفارش",
    className: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    icon: Clock3,
  };
}

function getPaymentStatus(status?: string) {
  const value = status || "PENDING";

  if (value === "PAID") {
    return {
      label: paymentLabels[value],
      className: "text-emerald-600 bg-emerald-500/10",
      icon: CheckCircle2,
    };
  }

  if (value === "FAILED" || value === "CANCELED") {
    return {
      label: paymentLabels[value] || "نامشخص",
      className: "text-rose-600 bg-rose-500/10",
      icon: XCircle,
    };
  }

  return {
    label: paymentLabels[value] || "در انتظار بررسی",
    className: "text-amber-600 bg-amber-500/10",
    icon: Clock3,
  };
}

function DetailCard({
  icon: Icon,
  title,
  children,
  className = "",
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm ${className}`}
    >
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-4 sm:px-5">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
          <Icon size={19} />
        </div>
        <h2 className="font-black">{title}</h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function InfoRow({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value?: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <span className="shrink-0 text-[var(--muted)]">{label}</span>
      <span className={`text-left font-bold ${valueClassName}`}>
        {value || "—"}
      </span>
    </div>
  );
}

function LoadingOrder() {
  return (
    <div className="space-y-5" dir="rtl">
      <div className="h-24 animate-pulse rounded-2xl bg-[var(--surface-2)]" />
      <div className="h-36 animate-pulse rounded-2xl bg-[var(--surface-2)]" />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="h-72 animate-pulse rounded-2xl bg-[var(--surface-2)]" />
        <div className="h-72 animate-pulse rounded-2xl bg-[var(--surface-2)]" />
      </div>
    </div>
  );
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function loadOrder() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/account/orders/${encodeURIComponent(id)}`,
        {
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error?.message || "اطلاعات سفارش دریافت نشد.");
      }

      setOrder(result.data as Order);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "خطا در دریافت اطلاعات سفارش",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrder();
    // loadOrder is intentionally tied to the route id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const status = order?.shippingStatus || "PENDING";
  const statusInfo = useMemo(() => getOrderStatus(status), [status]);
  const paymentInfo = useMemo(
    () => getPaymentStatus(order?.paymentStatus),
    [order?.paymentStatus],
  );

  const currentStep = steps.indexOf(status as OrderStatus);
  const progress =
    status === "CANCELED"
      ? 0
      : (Math.max(0, currentStep) / (steps.length - 1)) * 100;

  async function copyTrackingCode() {
    if (!order?.trackingCode) return;

    try {
      await navigator.clipboard.writeText(order.trackingCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  if (loading) return <LoadingOrder />;

  if (error || !order) {
    return (
      <div className="space-y-5" dir="rtl">
        <PageHeader title="جزئیات سفارش" />
        <div className="rounded-2xl border border-rose-500/20 bg-[var(--surface)] p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-rose-500/10 text-rose-600">
            <Package size={25} />
          </div>
          <h2 className="font-black">دریافت سفارش ناموفق بود</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {error || "سفارش موردنظر پیدا نشد."}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => void loadOrder()}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            >
              <RefreshCw size={16} />
              تلاش مجدد
            </button>
            <Link
              href="/customer/orders"
              className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-bold transition hover:bg-[var(--surface-2)]"
            >
              بازگشت به سفارش‌ها
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderNumber = String(order.id).slice(0, 8).toUpperCase();
  const items = Array.isArray(order.items) ? order.items : [];
  const address = order.shippingAddress;
  const StatusIcon = statusInfo.icon;
  const PaymentIcon = paymentInfo.icon;

  return (
    <div className="space-y-5 pb-8" dir="rtl">
      <PageHeader
        title="جزئیات سفارش"
        description="وضعیت ارسال، اقلام خریداری‌شده و اطلاعات پرداخت سفارش"
        actions={
          <Link
            href="/customer/orders"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm font-bold transition hover:bg-[var(--surface-2)]"
          >
            <ArrowRight size={16} />
            همه سفارش‌ها
          </Link>
        }
      />

      {/* Order summary */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-[var(--primary)]" />
        <div className="flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-[var(--muted)]">شماره سفارش</span>
              <span className="rounded-lg bg-[var(--surface-2)] px-2.5 py-1 font-mono text-sm font-black tracking-wide">
                #{orderNumber}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusInfo.className}`}
              >
                <StatusIcon size={14} />
                {statusInfo.label}
              </span>
            </div>
            <p className="mt-3 text-sm text-[var(--muted)]">
              ثبت سفارش: {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="rounded-2xl bg-[var(--primary)]/8 px-5 py-4 sm:min-w-52 sm:text-left">
            <div className="text-xs font-medium text-[var(--muted)]">
              مبلغ نهایی سفارش
            </div>
            <div className="mt-1 text-2xl font-black tabular-nums text-[var(--primary)]">
              {money(Number(order.netAmount || 0))}
              <span className="mr-1 text-sm font-bold">تومان</span>
            </div>
          </div>
        </div>

        {/* Shipment progress */}
        {status === "CANCELED" ? (
          <div className="mx-5 mb-5 flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 sm:mx-6">
            <XCircle className="shrink-0 text-rose-600" size={21} />
            <div>
              <div className="text-sm font-black text-rose-600">
                این سفارش لغو شده است
              </div>
              <p className="mt-1 text-xs text-[var(--muted)]">
                برای اطلاعات بیشتر با پشتیبانی فروشگاه تماس بگیرید.
              </p>
            </div>
          </div>
        ) : (
          <div className="border-t border-[var(--border)] px-5 py-6 sm:px-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="font-black">مراحل سفارش</h2>
              <span className="text-xs text-[var(--muted)]">
                {stepLabels[status] || "در حال بررسی"}
              </span>
            </div>

            <div className="relative">
              <div className="absolute right-[12.5%] left-[12.5%] top-5 h-1 rounded-full bg-[var(--surface-2)]" />
              <div
                className="absolute right-[12.5%] top-5 h-1 rounded-full bg-[var(--primary)] transition-all duration-500"
                style={{ width: `${progress * 0.75}%` }}
              />

              <div className="relative grid grid-cols-4 gap-1">
                {steps.map((step, index) => {
                  const completed = index <= currentStep;
                  const Icon =
                    index === 0
                      ? Check
                      : index === 1
                        ? Package
                        : index === 2
                          ? Truck
                          : PackageCheck;

                  return (
                    <div
                      key={step}
                      className="flex flex-col items-center text-center"
                    >
                      <div
                        className={`z-10 grid size-10 place-items-center rounded-full border-4 border-[var(--surface)] transition ${
                          completed
                            ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20"
                            : "bg-[var(--surface-2)] text-[var(--muted)]"
                        }`}
                      >
                        {completed && index < currentStep ? (
                          <Check size={17} strokeWidth={3} />
                        ) : (
                          <Icon size={17} />
                        )}
                      </div>
                      <span
                        className={`mt-3 text-[10px] font-bold leading-5 sm:text-xs ${
                          completed
                            ? "text-[var(--foreground)]"
                            : "text-[var(--muted)]"
                        }`}
                      >
                        {stepLabels[step]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Items */}
        <div className="space-y-5">
          <DetailCard
            icon={ShoppingBag}
            title={`اقلام سفارش (${items.length})`}
          >
            {items.length === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--muted)]">
                اقلامی برای این سفارش ثبت نشده است.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {items.map((item, index) => (
                  <div
                    key={item.id ?? `${item.productId ?? "item"}-${index}`}
                    className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]">
                      {item.product?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.image}
                          alt={item.product?.title || "محصول"}
                          className="size-full object-contain"
                        />
                      ) : (
                        <Package size={23} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-2 text-sm font-black">
                        {item.product?.title || `محصول ${item.productId ?? ""}`}
                      </div>
                      <div className="mt-1.5 text-xs text-[var(--muted)]">
                        تعداد: {money(Number(item.quantity || 0))}
                      </div>
                    </div>

                    <div className="shrink-0 text-left">
                      <div className="text-sm font-black tabular-nums">
                        {money(Number(item.total || 0))}
                      </div>
                      <div className="mt-1 text-[10px] text-[var(--muted)]">
                        تومان
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DetailCard>

          {/* Shipping details */}
          <DetailCard icon={MapPin} title="اطلاعات تحویل">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface-2)] text-[var(--muted)]">
                <UserRound size={19} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-black">
                  {address?.recipientName || "گیرنده ثبت نشده"}
                </div>
                {address?.phone && (
                  <div className="mt-1 text-sm text-[var(--muted)]">
                    {address.phone}
                  </div>
                )}
                <div className="mt-3 text-sm leading-7">
                  {[address?.province, address?.city]
                    .filter(Boolean)
                    .join("، ") || "موقعیت ثبت نشده"}
                </div>
                <div className="text-sm leading-7 text-[var(--muted)]">
                  {address?.address || "نشانی ثبت نشده"}
                </div>
                {address?.postalCode && (
                  <div className="mt-2 text-xs text-[var(--muted)]">
                    کد پستی:{" "}
                    <span className="font-mono font-bold text-[var(--foreground)]">
                      {address.postalCode}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {order.trackingCode && (
              <div className="mt-5 rounded-xl border border-dashed border-[var(--primary)]/40 bg-[var(--primary)]/5 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-[var(--muted)]">
                      کد رهگیری مرسوله
                    </div>
                    <div className="mt-1 font-mono text-sm font-black tracking-wider">
                      {order.trackingCode}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void copyTrackingCode()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-bold transition hover:bg-[var(--surface-2)]"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "کپی شد" : "کپی کد"}
                  </button>
                </div>
              </div>
            )}
          </DetailCard>
        </div>

        {/* Payment sidebar */}
        <aside className="space-y-5">
          <DetailCard icon={Wallet} title="خلاصه پرداخت">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-[var(--muted)]">وضعیت پرداخت</span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${paymentInfo.className}`}
              >
                <PaymentIcon size={14} />
                {paymentInfo.label}
              </span>
            </div>

            <div className="my-4 border-t border-dashed border-[var(--border)]" />

            <InfoRow
              label="روش پرداخت"
              value={order.paymentProvider || "کارت به کارت"}
            />
            <InfoRow
              label="وضعیت ارسال"
              value={shippingLabels[status] || "در حال بررسی"}
            />

            <div className="my-4 rounded-2xl bg-[var(--surface-2)] p-4">
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <CreditCard size={15} />
                مبلغ قابل پرداخت
              </div>
              <div className="mt-2 text-2xl font-black tabular-nums">
                {money(Number(order.netAmount || 0))}
                <span className="mr-1 text-xs font-bold text-[var(--muted)]">
                  تومان
                </span>
              </div>
            </div>

            {order.receiptImage && (
              <a
                href={order.receiptImage}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-bold transition hover:bg-[var(--surface-2)]"
              >
                <ShieldCheck size={17} />
                مشاهده رسید پرداخت
              </a>
            )}
          </DetailCard>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                <Truck size={19} />
              </div>
              <div>
                <h3 className="text-sm font-black">پیگیری سفارش</h3>
                <p className="mt-1 text-xs leading-6 text-[var(--muted)]">
                  وضعیت سفارش و اطلاعات ارسال در همین صفحه به‌روزرسانی می‌شود.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void loadOrder()}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
            >
              <RefreshCw size={16} />
              به‌روزرسانی وضعیت
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
