"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock3,
  Heart,
  LayoutGrid,
  MapPin,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Truck,
  UserRound,
} from "lucide-react";
import { faDate, money } from "@/features/portal/ui/PortalUI";
import {
  useCustomerOrders,
  useCustomerAddresses,
  useCustomerNotifications,
} from "../hooks";
import { useWishlist } from "@/features/wishlist/hooks";

const paymentLabels: Record<string, string> = {
  PAID: "تسویه شده",
  PENDING_TRANSFER: "در انتظار تأیید",
  PENDING_PAYMENT: "در انتظار پرداخت",
  PARTIAL: "پرداخت جزئی",
  CANCELED: "لغو شده",
};

const shippingLabels: Record<string, string> = {
  PENDING: "در انتظار",
  PROCESSING: "در حال آماده‌سازی",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل شده",
  CANCELED: "لغو شده",
};

const statusClasses: Record<string, string> = {
  PAID: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  PENDING_TRANSFER: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  PENDING_PAYMENT: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  PARTIAL: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  CANCELED: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  PENDING: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  PROCESSING: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  SHIPPED: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  DELIVERED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

function statusLabel(status?: string) {
  if (!status) {
    return "نامشخص";
  }

  return paymentLabels[status] ?? shippingLabels[status] ?? status;
}

function statusClass(status?: string) {
  return (
    statusClasses[status ?? ""] ??
    "bg-slate-500/10 text-slate-600 dark:text-slate-300"
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
  value,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  value?: number;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 transition hover:border-[var(--primary)]/30 hover:bg-[var(--surface)]"
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-black text-[var(--foreground)]">{title}</p>

          {value !== undefined && (
            <span className="rounded-full bg-[var(--primary)]/10 px-2 py-1 text-[9px] font-black text-[var(--primary)]">
              {value}
            </span>
          )}
        </div>

        <p className="mt-1 truncate text-[10px] text-[var(--muted)]">
          {description}
        </p>
      </div>

      <ArrowLeft
        size={15}
        className="shrink-0 text-[var(--muted)] transition group-hover:-translate-x-1 group-hover:text-[var(--primary)]"
      />
    </Link>
  );
}

function LoadingBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-[var(--border)]/60 ${className}`}
    />
  );
}

export default function CustomerOverview({ name }: { name: string }) {
  const {
    data: ordersPage,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useCustomerOrders();

  const { data: addresses = [], isLoading: addressesLoading } =
    useCustomerAddresses();

  const orders = useMemo(() => ordersPage?.items ?? [], [ordersPage?.items]);

  const { data: wishlist } = useWishlist();

  const { data: notifications = [], isLoading: notificationsLoading } =
    useCustomerNotifications();

  const addrCount = addresses.length;

  const wishCount = wishlist?.productIds.length ?? 0;

  const notifCount = notifications.filter((item) => item.read === false).length;

  const loading = ordersLoading || addressesLoading || notificationsLoading;

  const error = ordersError
    ? ordersError instanceof Error
      ? ordersError.message
      : String(ordersError)
    : null;

  const load = () => {
    void refetchOrders();
  };

  const firstName = name.trim().split(/\s+/)[0] || "کاربر";

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [orders],
  );

  const latestOrder = sortedOrders[0];

  const totalSpend = useMemo(
    () =>
      orders.reduce((total, order) => {
        if (order.paymentStatus === "CANCELED") {
          return total;
        }

        const amount = Number(order.netAmount);

        return Number.isFinite(amount) ? total + amount : total;
      }, 0),
    [orders],
  );

  const pendingOrders = orders.filter(
    (order) =>
      order.paymentStatus === "PENDING_PAYMENT" ||
      order.paymentStatus === "PENDING_TRANSFER" ||
      order.paymentStatus === "PARTIAL",
  ).length;

  return (
    <main dir="rtl" className="space-y-5 pb-8">
      {/* Header */}
      <section className="relative isolate overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-sm shadow-black/[0.035]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[var(--primary)]/[0.09] via-transparent to-transparent dark:from-[var(--primary)]/[0.12]" />

        <div className="pointer-events-none absolute -left-16 -top-24 size-72 rounded-full border border-[var(--primary)]/[0.09] dark:border-[var(--primary)]/[0.13]" />

        <div className="pointer-events-none absolute -left-5 -top-12 size-52 rounded-full border border-[var(--primary)]/[0.09] dark:border-[var(--primary)]/[0.13]" />

        <div className="pointer-events-none absolute bottom-0 left-1/3 size-60 translate-y-1/2 rounded-full bg-[var(--primary)]/[0.055] blur-3xl dark:bg-[var(--primary)]/[0.09]" />

        <div className="relative flex flex-col justify-between gap-6 p-5 sm:flex-row sm:items-center sm:p-7 lg:p-8">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/15 bg-[var(--primary)]/[0.07] px-3 py-1.5 text-[11px] font-bold text-[var(--primary)]">
              <Sparkles size={14} />
              پنل اختصاصی مشتریان ابزار احمدی
            </div>

            <h1 className="text-2xl font-black leading-relaxed tracking-tight text-[var(--foreground)] sm:text-3xl lg:text-4xl">
              سلام، {firstName}
              <span className="mr-2 inline-block">👋</span>
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-7 text-[var(--muted)]">
              به حساب کاربری خودت خوش اومدی. اینجا می‌تونی سفارش‌ها، وضعیت
              ارسال، آدرس‌ها و فعالیت‌های اخیرت رو مدیریت کنی.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-xs font-black text-white shadow-lg shadow-[var(--primary)]/15 transition hover:-translate-y-0.5 hover:brightness-110"
              >
                <ShoppingCart size={16} />
                شروع خرید
                <ArrowLeft size={15} />
              </Link>

              <Link
                href="/customer/orders"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-5 py-3 text-xs font-bold text-[var(--foreground)] transition hover:border-[var(--primary)]/35 hover:text-[var(--primary)]"
              >
                <Package size={16} />
                پیگیری سفارش‌ها
              </Link>
            </div>
          </div>

          <div className="hidden shrink-0 items-center justify-center sm:flex">
            <div className="relative flex size-36 items-center justify-center rounded-[32px] border border-[var(--primary)]/15 bg-[var(--background)] shadow-inner lg:size-44">
              <div className="absolute inset-3 rounded-[26px] border border-dashed border-[var(--primary)]/20" />

              <div className="flex size-24 items-center justify-center rounded-[26px] bg-[var(--primary)]/10 text-[var(--primary)] lg:size-28">
                <LayoutGrid size={56} strokeWidth={1.3} />
              </div>

              <div className="absolute -bottom-3 -right-3 flex size-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-emerald-600 shadow-lg dark:text-emerald-400">
                <ShieldCheck size={23} />
              </div>

              <div className="absolute -left-3 -top-3 flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-amber-500 shadow-lg dark:text-amber-400">
                <Sparkles size={19} />
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--background)]/70 px-5 py-3.5 text-[11px] text-[var(--muted)] sm:px-7 lg:px-8">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-[var(--primary)]" />
            <span>مدیریت حساب کاربری</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock3 size={14} />
            <span>اطلاعات حساب</span>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] p-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={19} className="shrink-0 text-rose-500" />

            <div>
              <p className="text-xs font-black text-[var(--foreground)]">
                خطا در دریافت اطلاعات
              </p>

              <p className="mt-1 text-[10px] text-[var(--muted)]">{error}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void load()}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      )}

      {/* Summary */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
              <ShoppingBag size={17} />
            </div>

            <span className="text-[9px] font-bold text-[var(--muted)]">
              سفارش‌ها
            </span>
          </div>

          <p className="mt-4 text-2xl font-black text-[var(--foreground)]">
            {loading ? "—" : orders.length}
          </p>

          <p className="mt-1 text-[9px] text-[var(--muted)]">
            کل سفارش‌های شما
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <WalletIcon />
            </div>

            <span className="text-[9px] font-bold text-[var(--muted)]">
              خرید
            </span>
          </div>

          <p className="mt-4 truncate text-xl font-black text-[var(--foreground)]">
            {loading ? "—" : money(totalSpend)}
          </p>

          <p className="mt-1 text-[9px] text-[var(--muted)]">تومان</p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock3 size={17} />
            </div>

            <span className="text-[9px] font-bold text-[var(--muted)]">
              پیگیری
            </span>
          </div>

          <p className="mt-4 text-2xl font-black text-[var(--foreground)]">
            {loading ? "—" : pendingOrders}
          </p>

          <p className="mt-1 text-[9px] text-[var(--muted)]">
            سفارش نیازمند پیگیری
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <div className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <MapPin size={17} />
            </div>

            <span className="text-[9px] font-bold text-[var(--muted)]">
              آدرس‌ها
            </span>
          </div>

          <p className="mt-4 text-2xl font-black text-[var(--foreground)]">
            {loading ? "—" : addrCount}
          </p>

          <p className="mt-1 text-[9px] text-[var(--muted)]">آدرس ثبت‌شده</p>
        </div>
      </section>

      {/* Main */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 lg:col-span-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-[var(--foreground)]">
                آخرین سفارش
              </h2>

              <p className="mt-1 text-[10px] text-[var(--muted)]">
                آخرین سفارش ثبت‌شده در حساب شما
              </p>
            </div>

            <Link
              href="/customer/orders"
              className="text-[10px] font-black text-[var(--primary)]"
            >
              همه سفارش‌ها
            </Link>
          </div>

          {loading ? (
            <div className="mt-5 space-y-3">
              <LoadingBox className="h-20" />
              <LoadingBox className="h-12" />
            </div>
          ) : latestOrder ? (
            <div className="mt-5">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                      <Package size={23} />
                    </div>

                    <div>
                      <p className="text-xs font-black text-[var(--foreground)]">
                        سفارش #{latestOrder.id.slice(0, 8).toUpperCase()}
                      </p>

                      <p className="mt-1 text-[10px] text-[var(--muted)]">
                        {faDate(latestOrder.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:text-left">
                    <p className="text-base font-black text-[var(--foreground)]">
                      {money(
                        Number.isFinite(Number(latestOrder.netAmount))
                          ? Number(latestOrder.netAmount)
                          : 0,
                      )}{" "}
                      <span className="text-[9px] font-bold text-[var(--muted)]">
                        تومان
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={`rounded-lg px-2.5 py-1.5 text-[9px] font-bold ${statusClass(
                      latestOrder.paymentStatus,
                    )}`}
                  >
                    {statusLabel(latestOrder.paymentStatus)}
                  </span>

                  {latestOrder.shippingStatus && (
                    <span
                      className={`rounded-lg px-2.5 py-1.5 text-[9px] font-bold ${statusClass(
                        latestOrder.shippingStatus,
                      )}`}
                    >
                      {statusLabel(latestOrder.shippingStatus)}
                    </span>
                  )}
                </div>
              </div>

              <Link
                href={`/customer/orders/${encodeURIComponent(latestOrder.id)}`}
                className="mt-3 flex min-h-11 items-center justify-between rounded-xl border border-[var(--border)] px-4 text-[10px] font-bold text-[var(--foreground)] transition hover:border-[var(--primary)]/30 hover:text-[var(--primary)]"
              >
                مشاهده جزئیات سفارش
                <ArrowLeft size={15} />
              </Link>
            </div>
          ) : (
            <div className="mt-5 flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background)]">
              <Package size={28} className="text-[var(--muted)]" />

              <p className="mt-3 text-xs font-black text-[var(--foreground)]">
                هنوز سفارشی ندارید
              </p>

              <Link
                href="/products"
                className="mt-3 text-[10px] font-black text-[var(--primary)]"
              >
                شروع خرید
              </Link>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 lg:col-span-5">
          <div>
            <h2 className="text-sm font-black text-[var(--foreground)]">
              دسترسی سریع
            </h2>

            <p className="mt-1 text-[10px] text-[var(--muted)]">
              مدیریت سریع بخش‌های اصلی حساب
            </p>
          </div>

          <div className="mt-5 space-y-2.5">
            <ActionCard
              href="/customer/orders"
              icon={<ShoppingBag size={19} />}
              title="سفارش‌های من"
              description="مشاهده و پیگیری سفارش‌ها"
              value={orders.length}
            />

            <ActionCard
              href="/customer/wishlist"
              icon={<Heart size={19} />}
              title="علاقه‌مندی‌ها"
              description="محصولات ذخیره‌شده"
              value={wishCount}
            />

            <ActionCard
              href="/customer/notifications"
              icon={<Bell size={19} />}
              title="اعلان‌ها"
              description="پیام‌ها و اطلاعیه‌های جدید"
              value={notifCount}
            />

            <ActionCard
              href="/customer/addresses"
              icon={<MapPin size={19} />}
              title="آدرس‌ها"
              description="مدیریت آدرس‌های تحویل"
              value={addrCount}
            />
          </div>
        </div>
      </section>

      {/* Account status */}
      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-sm font-black text-[var(--foreground)]">
              وضعیت حساب
            </h2>

            <p className="mt-1 text-[10px] text-[var(--muted)]">
              اطلاعات اصلی حساب کاربری
            </p>
          </div>

          <Link
            href="/customer/profile"
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-3 text-[10px] font-bold text-[var(--foreground)] transition hover:border-[var(--primary)]/30 hover:text-[var(--primary)]"
          >
            <UserRound size={14} />
            پروفایل
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl bg-[var(--background)] px-4 py-3">
            <CheckCircle2 size={17} className="text-emerald-500" />

            <div>
              <p className="text-[10px] font-black text-[var(--foreground)]">
                حساب فعال
              </p>

              <p className="mt-0.5 text-[9px] text-[var(--muted)]">
                حساب کاربری آماده استفاده است
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-[var(--background)] px-4 py-3">
            <MapPin size={17} className="text-violet-500" />

            <div>
              <p className="text-[10px] font-black text-[var(--foreground)]">
                {addrCount} آدرس
              </p>

              <p className="mt-0.5 text-[9px] text-[var(--muted)]">
                برای تحویل سفارش
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-[var(--background)] px-4 py-3">
            <Truck size={17} className="text-sky-500" />

            <div>
              <p className="text-[10px] font-black text-[var(--foreground)]">
                ارسال سفارش
              </p>

              <p className="mt-0.5 text-[9px] text-[var(--muted)]">
                پیگیری از بخش سفارش‌ها
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <Link
        href="/products"
        className="group flex flex-col gap-4 rounded-[24px] border border-[var(--primary)]/15 bg-[var(--primary)]/[0.055] p-5 transition hover:border-[var(--primary)]/30 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
            <ShoppingCart size={22} />
          </div>

          <div>
            <p className="text-sm font-black text-[var(--foreground)]">
              آماده خرید بعدی هستی؟
            </p>

            <p className="mt-1 text-[10px] text-[var(--muted)]">
              محصولات و ابزارهای موردنیازت را مشاهده کن.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-[10px] font-black text-white transition group-hover:gap-3">
          مشاهده محصولات
          <ArrowLeft size={14} />
        </span>
      </Link>
    </main>
  );
}

function WalletIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 7V6a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v8a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V7" />
      <path d="M16 14h.01" />
    </svg>
  );
}
