"use client";

import Link from "next/link";
import { useAdminSales } from "@/features/admin/hooks";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  CircleDollarSign,
  Clock3,
  CreditCard,
  LayoutDashboard,
  ListFilter,
  Package,
  RefreshCw,
  Search,
  Settings2,
  ShoppingBag,
  Truck,
  UserRound,
  Wallet,
  X,
  XCircle,
} from "lucide-react";

type Order = {
  id: string;
  channel?: string;
  buyerName?: string | null;
  buyerPhone?: string | null;
  netAmount?: number | string | null;
  paymentStatus?: string | null;
  shippingStatus?: string | null;
  createdAt: string;
};


type PaymentFilter = "ALL" | "PAID" | "PENDING" | "FAILED" | "REFUNDED";

type ShippingFilter =
  | "ALL"
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

const cn = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

const fa = (value: number) => new Intl.NumberFormat("fa-IR").format(value);

const toman = (value: number) => `${fa(value)} تومان`;

const paymentLabels: Record<string, string> = {
  PAID: "پرداخت شده",
  PENDING: "در انتظار پرداخت",
  FAILED: "ناموفق",
  REFUNDED: "مرجوع شده",
};

const shippingLabels: Record<string, string> = {
  PENDING: "در انتظار ارسال",
  PROCESSING: "در حال پردازش",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل شده",
  CANCELLED: "لغو شده",
};

const normalize = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLocaleLowerCase("fa")
    .replace(/\s+/g, " ");

const englishDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

function formatAmount(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);

  return `${amount.toLocaleString("fa-IR")} تومان`;
}

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatDateShort(value: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function getDateKey(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((item) => item.type === "year")?.value;
  const month = parts.find((item) => item.type === "month")?.value;
  const day = parts.find((item) => item.type === "day")?.value;

  if (!year || !month || !day) {
    return "";
  }

  return `${year}-${month}-${day}`;
}

function PaymentBadge({ status }: { status?: string | null }) {
  const normalized = status ?? "PENDING";

  const isPaid = normalized === "PAID";
  const isFailed = normalized === "FAILED";
  const isRefunded = normalized === "REFUNDED";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-extrabold",
        isPaid
          ? "bg-emerald-500/10 text-emerald-600"
          : isFailed
            ? "bg-red-500/10 text-red-600"
            : isRefunded
              ? "bg-orange-500/10 text-orange-600"
              : "bg-amber-500/10 text-amber-600",
      )}
    >
      {isPaid ? (
        <CheckCircle2 size={12} />
      ) : isFailed ? (
        <XCircle size={12} />
      ) : (
        <Clock3 size={12} />
      )}

      {paymentLabels[normalized] ?? normalized}
    </span>
  );
}

function ShippingBadge({ status }: { status?: string | null }) {
  const normalized = status ?? "PENDING";

  const isDelivered = normalized === "DELIVERED";
  const isShipped = normalized === "SHIPPED";
  const isProcessing = normalized === "PROCESSING";
  const isCancelled = normalized === "CANCELLED";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-extrabold",
        isDelivered
          ? "bg-emerald-500/10 text-emerald-600"
          : isShipped
            ? "bg-blue-500/10 text-blue-600"
            : isProcessing
              ? "bg-violet-500/10 text-violet-600"
              : isCancelled
                ? "bg-red-500/10 text-red-600"
                : "bg-slate-500/10 text-slate-600",
      )}
    >
      <Truck size={12} />
      {shippingLabels[normalized] ?? normalized}
    </span>
  );
}

function StatCard({
  title,
  value,
  caption,
  icon,
  color,
  foot,
}: {
  title: string;
  value: string;
  caption: string;
  icon: React.ReactNode;
  color: string;
  foot?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="absolute -left-5 -top-6 size-24 rounded-full bg-current opacity-[0.035]" />

      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[var(--muted)]">{title}</p>

          <p className="mt-2 break-words text-xl font-black leading-8 tabular-nums text-[var(--text)]">
            {value}
          </p>

          <p className="mt-1 text-[10px] text-[var(--muted)]">{caption}</p>
        </div>

        <div
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl",
            color,
          )}
        >
          {icon}
        </div>
      </div>

      {foot ? (
        <div className="relative mt-3 flex items-center gap-1 border-t border-[var(--border)] pt-2 text-[10px] text-[var(--muted)]">
          <Activity size={12} />
          {foot}
        </div>
      ) : null}
    </div>
  );
}

export default function OrdersAdmin() {
  const salesQuery = useAdminSales();
  const rows = (salesQuery.data ?? []) as Order[];
  const loading = salesQuery.isLoading;
  const refreshing = salesQuery.isFetching && !salesQuery.isLoading;
  const error = salesQuery.error instanceof Error
    ? salesQuery.error.message
    : salesQuery.error
      ? "دریافت سفارش‌ها ناموفق بود."
      : "";

  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState<PaymentFilter>("ALL");
  const [shipping, setShipping] = useState<ShippingFilter>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [message, setMessage] = useState("");

  const load = async (_isRefresh = false) => {
    await salesQuery.refetch();
  };

  const onlineOrders = useMemo(
    () =>
      rows.filter(
        (order) => !order.channel || order.channel.toUpperCase() === "ONLINE",
      ),
    [rows],
  );

  const totalAmount = useMemo(
    () =>
      onlineOrders.reduce(
        (total, order) => total + Number(order.netAmount ?? 0),
        0,
      ),
    [onlineOrders],
  );

  const paidOrders = useMemo(
    () => onlineOrders.filter((order) => order.paymentStatus === "PAID"),
    [onlineOrders],
  );

  const pendingOrders = useMemo(
    () => onlineOrders.filter((order) => order.paymentStatus === "PENDING"),
    [onlineOrders],
  );

  const failedOrders = useMemo(
    () => onlineOrders.filter((order) => order.paymentStatus === "FAILED"),
    [onlineOrders],
  );

  const deliveredOrders = useMemo(
    () => onlineOrders.filter((order) => order.shippingStatus === "DELIVERED"),
    [onlineOrders],
  );

  const shippedOrders = useMemo(
    () => onlineOrders.filter((order) => order.shippingStatus === "SHIPPED"),
    [onlineOrders],
  );

  const filteredOrders = useMemo(() => {
    const query = normalize(englishDigits(search));

    const min = minAmount
      ? Number(englishDigits(minAmount).replace(/[,\s٬]/g, ""))
      : null;

    const max = maxAmount
      ? Number(englishDigits(maxAmount).replace(/[,\s٬]/g, ""))
      : null;

    return onlineOrders.filter((order) => {
      const amount = Number(order.netAmount ?? 0);

      const searchableValues = [
        order.id,
        order.buyerName ?? "",
        order.buyerPhone ?? "",
        order.paymentStatus ?? "",
        order.shippingStatus ?? "",
      ];

      const matchesSearch =
        !query ||
        searchableValues.some((value) =>
          normalize(englishDigits(String(value))).includes(query),
        );

      const matchesPayment =
        payment === "ALL" || order.paymentStatus === payment;

      const matchesShipping =
        shipping === "ALL" || order.shippingStatus === shipping;

      const dateKey = getDateKey(order.createdAt);

      const matchesFrom =
        !dateFrom || (Boolean(dateKey) && dateKey >= dateFrom);

      const matchesTo = !dateTo || (Boolean(dateKey) && dateKey <= dateTo);

      const matchesMin =
        min === null || (Number.isFinite(min) && amount >= min);

      const matchesMax =
        max === null || (Number.isFinite(max) && amount <= max);

      return (
        matchesSearch &&
        matchesPayment &&
        matchesShipping &&
        matchesFrom &&
        matchesTo &&
        matchesMin &&
        matchesMax
      );
    });
  }, [
    onlineOrders,
    search,
    payment,
    shipping,
    dateFrom,
    dateTo,
    minAmount,
    maxAmount,
  ]);

  const activeFilters = [
    Boolean(search),
    payment !== "ALL",
    shipping !== "ALL",
    Boolean(dateFrom),
    Boolean(dateTo),
    Boolean(minAmount),
    Boolean(maxAmount),
  ].filter(Boolean).length;

  const paidPercentage = onlineOrders.length
    ? Math.round((paidOrders.length / onlineOrders.length) * 100)
    : 0;

  const averageAmount = onlineOrders.length
    ? Math.round(totalAmount / onlineOrders.length)
    : 0;

  const clearFilters = () => {
    setSearch("");
    setPayment("ALL");
    setShipping("ALL");
    setDateFrom("");
    setDateTo("");
    setMinAmount("");
    setMaxAmount("");
  };

  return (
    <main dir="rtl" className="mx-auto w-full max-w-[1600px] space-y-4">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
          <LayoutDashboard size={15} />

          <span>داشبورد</span>

          <ChevronLeft size={13} />

          <span>فروش و سفارشات</span>

          <ChevronLeft size={13} />

          <strong className="text-[var(--text)]">سفارش‌های آنلاین</strong>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            سیستم فعال
          </span>

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
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-[#18232d] p-5 text-white sm:p-6">
        <div className="absolute -left-20 -top-28 size-80 rounded-full bg-[#00adb5]/15 blur-3xl" />

        <div className="absolute bottom-0 right-1/3 h-px w-1/2 bg-gradient-to-l from-transparent via-[#00adb5]/60 to-transparent" />

        <div className="relative flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold text-[#8adfe1]">
              <ShoppingBag size={15} />
              مرکز کنترل فروش و سفارشات
              <span className="rounded-md border border-white/15 px-2 py-1 text-[10px] text-slate-300">
                ORDER MANAGEMENT
              </span>
            </div>

            <h1 className="text-2xl font-black sm:text-3xl">
              مدیریت جامع سفارش‌ها
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              بررسی سفارش‌های آنلاین، وضعیت پرداخت، فرآیند ارسال و اطلاعات
              مشتریان در یک فضای کاری واحد.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/sales"
              className="inline-flex items-center gap-2 rounded-xl bg-[#00adb5] px-4 py-3 text-sm font-extrabold text-[#10242a] transition hover:bg-[#39c6cb]"
            >
              <ShoppingBag size={17} />
              سفارش‌ها
            </Link>

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
            <p className="text-[10px] text-slate-400">کل سفارش‌ها</p>

            <p className="mt-1 text-lg font-black tabular-nums">
              {fa(onlineOrders.length)}
            </p>
          </div>

          <div className="rounded-lg bg-white/5 px-3 py-2">
            <p className="text-[10px] text-slate-400">پرداخت موفق</p>

            <p className="mt-1 text-lg font-black tabular-nums">
              {fa(paidOrders.length)}
            </p>
          </div>

          <div className="rounded-lg bg-white/5 px-3 py-2">
            <p className="text-[10px] text-slate-400">در انتظار پرداخت</p>

            <p className="mt-1 text-lg font-black tabular-nums">
              {fa(pendingOrders.length)}
            </p>
          </div>

          <div className="rounded-lg bg-white/5 px-3 py-2">
            <p className="text-[10px] text-slate-400">تحویل‌شده</p>

            <p className="mt-1 text-lg font-black tabular-nums">
              {fa(deliveredOrders.length)}
            </p>
          </div>
        </div>
      </section>

      {/* KPI */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          title="ارزش کل سفارش‌ها"
          value={toman(totalAmount)}
          caption="مجموع مبلغ سفارش‌های آنلاین"
          icon={<CircleDollarSign size={20} />}
          color="bg-[#00adb5]/10 text-[#00adb5]"
          foot={`${fa(onlineOrders.length)} سفارش آنلاین`}
        />

        <StatCard
          title="پرداخت‌های موفق"
          value={fa(paidOrders.length)}
          caption="سفارش‌های دارای پرداخت موفق"
          icon={<CreditCard size={20} />}
          color="bg-emerald-500/10 text-emerald-600"
          foot={`نرخ پرداخت موفق ${fa(paidPercentage)}٪`}
        />

        <StatCard
          title="در انتظار پرداخت"
          value={fa(pendingOrders.length)}
          caption="سفارش‌های نیازمند پیگیری"
          icon={<Clock3 size={20} />}
          color="bg-amber-500/10 text-amber-600"
          foot={`${fa(failedOrders.length)} پرداخت ناموفق`}
        />

        <StatCard
          title="میانگین ارزش سفارش"
          value={toman(averageAmount)}
          caption="میانگین مبلغ هر سفارش"
          icon={<Wallet size={20} />}
          color="bg-violet-500/10 text-violet-600"
          foot={`${fa(shippedOrders.length)} سفارش در مسیر ارسال`}
        />
      </section>

      {/* Control Center */}
      <section className="overflow-visible rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex flex-col justify-between gap-3 border-b border-[var(--border)] p-4 xl:flex-row xl:items-center">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[var(--bg-secondary)] text-[var(--primary)]">
              <ListFilter size={19} />
            </div>

            <div>
              <h2 className="font-black text-[var(--text)]">
                مرکز کنترل سفارش‌ها
              </h2>

              <p className="mt-1 text-[11px] text-[var(--muted)]">
                جست‌وجو، فیلتر و مدیریت سفارش‌های آنلاین
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowAdvanced((value) => !value)}
              className={cn(
                "btn inline-flex items-center gap-2",
                showAdvanced ? "btn-primary" : "btn-secondary",
              )}
            >
              <Settings2 size={15} />
              فیلتر پیشرفته
              <span className="rounded-md bg-current/10 px-1.5 py-0.5 text-[9px]">
                {fa(activeFilters)}
              </span>
            </button>

            {activeFilters > 0 ? (
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-secondary inline-flex items-center gap-2"
              >
                <X size={15} />
                پاک کردن فیلترها
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 p-4 lg:grid-cols-[minmax(250px,1fr)_auto] lg:items-center">
          <div className="relative">
            <Search
              size={17}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جست‌وجو: شناسه سفارش، مشتری، شماره تماس..."
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
                ["PAID", "پرداخت شده"],
                ["PENDING", "در انتظار"],
                ["FAILED", "ناموفق"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPayment(value)}
                className={cn(
                  "rounded-lg px-4 py-2 text-xs font-bold transition",
                  payment === value
                    ? "bg-[var(--surface)] text-[var(--primary)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--text)]",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {showAdvanced ? (
          <div className="grid grid-cols-1 gap-3 border-t border-[var(--border)] bg-[var(--bg-secondary)]/40 p-4 sm:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-1.5">
              <span className="text-xs font-bold text-[var(--muted)]">
                از تاریخ
              </span>

              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                className="input w-full"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold text-[var(--muted)]">
                تا تاریخ
              </span>

              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                className="input w-full"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold text-[var(--muted)]">
                حداقل مبلغ
              </span>

              <input
                inputMode="numeric"
                value={minAmount}
                onChange={(event) => setMinAmount(event.target.value)}
                placeholder="مثلاً 1000000"
                className="input w-full"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold text-[var(--muted)]">
                حداکثر مبلغ
              </span>

              <input
                inputMode="numeric"
                value={maxAmount}
                onChange={(event) => setMaxAmount(event.target.value)}
                placeholder="مثلاً 50000000"
                className="input w-full"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold text-[var(--muted)]">
                وضعیت ارسال
              </span>

              <select
                value={shipping}
                onChange={(event) =>
                  setShipping(event.target.value as ShippingFilter)
                }
                className="input w-full"
              >
                <option value="ALL">همه وضعیت‌ها</option>
                <option value="PENDING">در انتظار ارسال</option>
                <option value="PROCESSING">در حال پردازش</option>
                <option value="SHIPPED">ارسال شده</option>
                <option value="DELIVERED">تحویل شده</option>
                <option value="CANCELLED">لغو شده</option>
              </select>
            </label>

            <div className="flex items-end sm:col-span-2 xl:col-span-3">
              <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                <span className="text-xs text-[var(--muted)]">
                  {fa(activeFilters)} فیلتر فعال · {fa(filteredOrders.length)}{" "}
                  نتیجه
                </span>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-bold text-[var(--primary)]"
                >
                  پاک کردن همه
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Table heading */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-y border-[var(--border)] bg-[var(--bg-secondary)]/60 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--text)]">
            <ShoppingBag size={16} className="text-[var(--primary)]" />
            فهرست سفارش‌ها
          </div>

          <div className="flex items-center gap-3 text-[10px] text-[var(--muted)]">
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500" />
              پرداخت موفق
            </span>

            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-amber-500" />
              در انتظار
            </span>

            <span className="inline-flex items-center gap-1">
              <Package size={12} />
              {fa(filteredOrders.length)} مورد
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] border-collapse text-right">
            <thead>
              <tr className="bg-[var(--surface)] text-[10px] font-bold text-[var(--muted)]">
                <th className="px-4 py-3">ردیف</th>

                <th className="px-4 py-3">شناسه سفارش</th>

                <th className="px-4 py-3">مشتری</th>

                <th className="px-4 py-3">تاریخ ثبت</th>

                <th className="px-4 py-3">مبلغ</th>

                <th className="px-4 py-3">وضعیت پرداخت</th>

                <th className="px-4 py-3">وضعیت ارسال</th>

                <th className="px-4 py-3 text-center">عملیات</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 7 }).map((_, index) => (
                  <tr key={index} className="border-t border-[var(--border)]">
                    {Array.from({ length: 8 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-4">
                        <div className="h-5 animate-pulse rounded-md bg-[var(--bg-secondary)]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    className="border-t border-[var(--border)] text-xs transition hover:bg-[var(--bg-secondary)]/50"
                  >
                    <td className="px-4 py-3.5 text-[var(--muted)]">
                      {fa(index + 1)}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                          <ShoppingBag size={14} />
                        </div>

                        <div>
                          <p className="font-bold text-[var(--text)]">
                            #{order.id.slice(0, 8)}
                          </p>

                          <p className="mt-0.5 font-mono text-[9px] text-[var(--muted)]">
                            {order.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--bg-secondary)] text-[var(--muted)]">
                          <UserRound size={14} />
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[190px] truncate font-bold text-[var(--text)]">
                            {order.buyerName || "مشتری"}
                          </p>

                          {order.buyerPhone ? (
                            <p
                              dir="ltr"
                              className="mt-0.5 text-right text-[10px] text-[var(--muted)]"
                            >
                              {order.buyerPhone}
                            </p>
                          ) : (
                            <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                              شماره تماس ثبت نشده
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-[var(--muted)]">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <CalendarDays size={13} />

                        {formatDate(order.createdAt)}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-black tabular-nums text-[var(--text)]">
                        {fa(Number(order.netAmount ?? 0))}
                      </div>

                      <div className="mt-0.5 text-[9px] text-[var(--muted)]">
                        تومان
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <PaymentBadge status={order.paymentStatus} />
                    </td>

                    <td className="px-4 py-3.5">
                      <ShippingBadge status={order.shippingStatus} />
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <Link
                        href={`/dashboard/sales/${encodeURIComponent(
                          order.id,
                        )}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 font-bold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                      >
                        مشاهده
                        <ArrowLeft size={12} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-3 grid size-12 place-items-center rounded-xl bg-[var(--bg-secondary)] text-[var(--muted)]">
                        <Search size={20} />
                      </div>

                      <p className="font-bold text-[var(--text)]">
                        سفارشی یافت نشد
                      </p>

                      <p className="mt-1 text-xs text-[var(--muted)]">
                        عبارت جست‌وجو یا فیلترهای انتخابی را تغییر بده.
                      </p>

                      {activeFilters > 0 ? (
                        <button
                          type="button"
                          onClick={clearFilters}
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
      </section>

      {/* Error */}
      {error ? (
        <section className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-red-600">
            <AlertCircle size={17} />
            {error}
          </div>
        </section>
      ) : null}

      {/* Success */}
      {message ? (
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-600">
              <BadgeCheck size={17} />
              {message}
            </div>

            <button
              type="button"
              onClick={() => setMessage("")}
              className="text-[var(--muted)] hover:text-[var(--text)]"
              aria-label="بستن پیام"
            >
              <X size={16} />
            </button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
