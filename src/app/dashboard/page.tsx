"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  AlertCircle,
  ArrowDownLeft,
  BarChart3,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  FilePlus2,
  LayoutDashboard,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Store,
  Tag,
  TrendingUp,
  Truck,
  Wallet,
  XCircle,
} from "lucide-react";

import type { Purchase, Sale } from "@/lib/types";
import { useAdminCollection, useAdminReports, useAdminSales } from "@/features/admin/hooks";

type Summary = {
  totalRevenue: number;
  totalProfit: number;
  salesCount: number;
  salesTrend: {
    date: string;
    amount: number;
  }[];
  lowStock: {
    title: string;
    stock: number;
    sku: string;
  }[];
};

const paymentLabels: Record<string, string> = {
  PAID: "تسویه شده",
  PENDING_TRANSFER: "در انتظار تأیید",
  PENDING_PAYMENT: "در انتظار پرداخت آنلاین",
  PARTIAL: "پرداخت جزئی",
  CANCELED: "لغو شده",
};

function money(value: number) {
  return `${Number(value || 0).toLocaleString("fa-IR")} ت`;
}

function num(value: number) {
  return Number(value || 0).toLocaleString("fa-IR");
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "تاریخ نامشخص";
  }

  return date.toLocaleDateString("fa-IR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("fa-IR", {
    day: "numeric",
    month: "short",
  });
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return date.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitial(value: string | undefined) {
  return (value || "ف").trim().slice(0, 1);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function Dashboard() {
  const reportsQuery = useAdminReports();
  const salesQuery = useAdminSales();
  const purchasesQuery = useAdminCollection<Purchase>("purchases");

  const summary = (reportsQuery.data ?? null) as Summary | null;
  const sales = salesQuery.data ?? [];
  const purchases = purchasesQuery.data?.items ?? [];
  const loading =
    reportsQuery.isLoading || salesQuery.isLoading || purchasesQuery.isLoading;

  async function loadDashboard() {
    await Promise.all([
      reportsQuery.refetch(),
      salesQuery.refetch(),
      purchasesQuery.refetch(),
    ]);
  }

  const today = useMemo(() => new Date(), []);

  const revenue = summary?.totalRevenue ?? 0;
  const profit = summary?.totalProfit ?? 0;
  const salesCount = summary?.salesCount ?? 0;
  const trend = summary?.salesTrend ?? [];
  const lowStock = summary?.lowStock ?? [];

  const todaySales = useMemo(() => {
    return sales.filter((sale) => isSameDay(new Date(sale.createdAt), today));
  }, [sales, today]);

  const todayRevenue = useMemo(() => {
    return todaySales.reduce(
      (sum, sale) => sum + Number(sale.netAmount || 0),
      0,
    );
  }, [todaySales]);

  const paidSales = useMemo(
    () => sales.filter((sale) => sale.paymentStatus === "PAID"),
    [sales],
  );

  const pendingSales = useMemo(
    () => sales.filter((sale) => sale.paymentStatus === "PENDING_TRANSFER"),
    [sales],
  );

  const partialSales = useMemo(
    () => sales.filter((sale) => sale.paymentStatus === "PARTIAL"),
    [sales],
  );

  const canceledSales = useMemo(
    () => sales.filter((sale) => sale.paymentStatus === "CANCELED"),
    [sales],
  );

  const pendingAmount = useMemo(
    () =>
      pendingSales.reduce((sum, sale) => sum + Number(sale.netAmount || 0), 0),
    [pendingSales],
  );

  const partialAmount = useMemo(
    () =>
      partialSales.reduce((sum, sale) => sum + Number(sale.netAmount || 0), 0),
    [partialSales],
  );

  const canceledAmount = useMemo(
    () =>
      canceledSales.reduce((sum, sale) => sum + Number(sale.netAmount || 0), 0),
    [canceledSales],
  );

  const paidAmount = useMemo(
    () => paidSales.reduce((sum, sale) => sum + Number(sale.netAmount || 0), 0),
    [paidSales],
  );

  const purchaseTotal = useMemo(
    () =>
      purchases.reduce(
        (sum, purchase) => sum + Number(purchase.subtotal || 0),
        0,
      ),
    [purchases],
  );

  const averageTicket = salesCount > 0 ? revenue / salesCount : 0;

  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

  const largestSale = useMemo(() => {
    return sales.reduce<Sale | null>((largest, sale) => {
      if (!largest) {
        return sale;
      }

      return Number(sale.netAmount || 0) > Number(largest.netAmount || 0)
        ? sale
        : largest;
    }, null);
  }, [sales]);

  const chartMax = Math.max(
    ...trend.map((item) => Number(item.amount || 0)),
    1,
  );

  const totalPaymentAmount =
    paidAmount + pendingAmount + partialAmount + canceledAmount;

  const recentActivity = useMemo(() => {
    return [
      ...sales.map((sale) => ({
        id: `sale-${sale.id}`,
        title: sale.buyerName || "فروش حضوری",
        description: "فروش ثبت شد",
        amount: Number(sale.netAmount || 0),
        createdAt: sale.createdAt,
        type: "sale" as const,
      })),

      ...purchases.map((purchase) => ({
        id: `purchase-${purchase.id}`,
        title: purchase.supplierName || "تأمین‌کننده",
        description: "خرید ثبت شد",
        amount: Number(purchase.subtotal || 0),
        createdAt: purchase.createdAt,
        type: "purchase" as const,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [sales, purchases]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <main dir="rtl" className="mx-auto max-w-[1850px] space-y-6 pb-14">
      {/* Header */}

      <section className="overflow-visible rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-stretch">
          <div className="flex min-h-[120px] flex-1 items-center gap-5 p-6 lg:p-7">
            <div className="relative grid size-16 shrink-0 place-items-center rounded-2xl bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20">
              <Store size={28} />

              <span className="absolute -bottom-1 -left-1 size-4 rounded-full border-[3px] border-[var(--surface)] bg-emerald-500" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight lg:text-3xl">
                  مرکز عملیات فروشگاه
                </h1>

                <span className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-black text-emerald-500">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  سیستم فعال
                </span>
              </div>

              <p className="mt-2 text-sm text-[var(--muted)] lg:text-base">
                کنترل فروش، پرداخت، موجودی و خرید فروشگاه در یک نگاه
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] p-4 lg:p-5 xl:border-r xl:border-t-0">
            <div className="hidden h-12 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 xl:flex">
              <Search size={18} className="text-[var(--muted)]" />

              <span className="text-sm text-[var(--muted)]">
                جستجوی عملیات...
              </span>
            </div>

            <button
              type="button"
              onClick={loadDashboard}
              aria-label="بروزرسانی داشبورد"
              className="grid size-12 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)] transition hover:border-[var(--primary)]/20 hover:text-[var(--primary)]"
            >
              <RefreshCw size={19} />
            </button>

            <Link
              href="/dashboard/pos"
              className="flex h-12 items-center gap-2 rounded-xl bg-[var(--primary)] px-5 text-sm font-black text-white shadow-lg shadow-[var(--primary)]/15 transition hover:-translate-y-0.5"
            >
              <Plus size={19} />
              فروش جدید
            </Link>
          </div>
        </div>
      </section>

      {/* Snapshot */}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Snapshot
          icon={CalendarDays}
          label="امروز"
          value={today.toLocaleDateString("fa-IR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        />

        <Snapshot
          icon={ShoppingCart}
          label="فروش‌های امروز"
          value={`${num(todaySales.length)} فاکتور`}
        />

        <Snapshot
          icon={Clock3}
          label="پرداخت‌های در انتظار"
          value={money(pendingAmount)}
          warning={pendingAmount > 0}
        />

        <Snapshot
          icon={AlertCircle}
          label="کالاهای کم‌موجودی"
          value={`${num(lowStock.length)} کالا`}
          danger={lowStock.length > 0}
        />
      </section>

      {/* Quick Actions */}

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm lg:p-7">
        <div>
          <h2 className="text-xl font-black">دسترسی سریع</h2>

          <p className="mt-1.5 text-sm text-[var(--muted)]">
            عملیات پرتکرار مدیریت فروشگاه
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ActionTile
            href="/dashboard/pos"
            icon={ShoppingCart}
            title="ثبت فروش"
            description="ایجاد فاکتور جدید"
          />

          <ActionTile
            href="/dashboard/purchases"
            icon={FilePlus2}
            title="ثبت خرید"
            description="ورود کالا از تأمین‌کننده"
          />

          <ActionTile
            href="/dashboard/products"
            icon={Package}
            title="مدیریت محصولات"
            description="قیمت، موجودی و مشخصات"
          />

          <ActionTile
            href="/dashboard/reports"
            icon={BarChart3}
            title="گزارش‌ها"
            description="تحلیل عملکرد فروشگاه"
          />
        </div>
      </section>

      {/* Sales Monitoring */}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_430px]">
        <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="flex flex-col gap-5 border-b border-[var(--border)] p-6 lg:p-7 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                <BarChart3 size={25} />
              </span>

              <div>
                <h2 className="text-xl font-black">مانیتورینگ فروش</h2>

                <p className="mt-1.5 text-sm text-[var(--muted)]">
                  روند فروش ۱۴ روز اخیر
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-xl bg-[var(--surface-2)] px-4 py-2.5 text-xs font-bold text-[var(--muted)]">
                ۱۴ روز اخیر
              </span>

              <Link
                href="/dashboard/reports"
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-bold transition hover:border-[var(--primary)]/30 hover:text-[var(--primary)]"
              >
                گزارش کامل
                <ChevronLeft size={16} />
              </Link>
            </div>
          </div>

          <div className="p-6 lg:p-7">
            <div className="grid gap-4 md:grid-cols-3">
              <PerformanceBox
                label="فروش امروز"
                value={money(todayRevenue)}
                icon={ShoppingCart}
              />

              <PerformanceBox
                label="میانگین فاکتور"
                value={money(averageTicket)}
                icon={Tag}
              />

              <PerformanceBox
                label="حاشیه سود"
                value={`${profitMargin.toLocaleString("fa-IR", {
                  maximumFractionDigits: 1,
                })}٪`}
                icon={TrendingUp}
              />
            </div>

            <div className="mt-8 h-[360px]">
              {trend.length > 0 ? (
                <div className="flex h-full items-end gap-2 sm:gap-3">
                  {trend.map((item) => {
                    const amount = Number(item.amount || 0);

                    const height = Math.max(5, (amount / chartMax) * 100);

                    return (
                      <div
                        key={item.date}
                        className="group flex h-full min-w-0 flex-1 flex-col justify-end"
                      >
                        <div className="relative flex min-h-0 flex-1 items-end">
                          <div className="absolute bottom-full left-1/2 z-20 mb-3 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-[var(--text)] px-3 py-2 text-xs font-black text-[var(--surface)] shadow-xl group-hover:block">
                            {money(amount)}
                          </div>

                          <div
                            className="w-full rounded-t-xl bg-[var(--primary)]/55 transition-all duration-300 group-hover:bg-[var(--primary)]"
                            style={{
                              height: `${height}%`,
                            }}
                          />
                        </div>

                        <span className="mt-3 truncate text-center text-[11px] font-bold text-[var(--muted)]">
                          {formatShortDate(item.date)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState text="اطلاعاتی برای نمودار فروش وجود ندارد." />
              )}
            </div>
          </div>
        </article>

        <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="border-b border-[var(--border)] p-6 lg:p-7">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">وضعیت پرداخت</h2>

                <p className="mt-1.5 text-sm text-[var(--muted)]">
                  توزیع وضعیت فاکتورها
                </p>
              </div>

              <span className="grid size-14 place-items-center rounded-2xl bg-blue-500/10 text-blue-500">
                <Wallet size={25} />
              </span>
            </div>
          </div>

          <div className="space-y-3 p-5 lg:p-6">
            <FinancialRow
              label="تسویه شده"
              count={paidSales.length}
              amount={paidAmount}
              color="green"
              icon={CheckCircle2}
            />

            <FinancialRow
              label="در انتظار تأیید"
              count={pendingSales.length}
              amount={pendingAmount}
              color="yellow"
              icon={Clock3}
            />

            <FinancialRow
              label="پرداخت جزئی"
              count={partialSales.length}
              amount={partialAmount}
              color="blue"
              icon={Wallet}
            />

            <FinancialRow
              label="لغو شده"
              count={canceledSales.length}
              amount={canceledAmount}
              color="red"
              icon={XCircle}
            />
          </div>

          <div className="border-t border-[var(--border)] p-5 lg:p-6">
            <div className="rounded-2xl bg-[var(--surface-2)] p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[var(--muted)]">
                  سود ناخالص ثبت‌شده
                </span>

                <TrendingUp size={20} className="text-emerald-500" />
              </div>

              <div className="mt-3 text-3xl font-black">{money(profit)}</div>

              {totalPaymentAmount > 0 ? (
                <div className="mt-2 text-xs text-[var(--muted)]">
                  مجموع مبالغ ثبت‌شده: {money(totalPaymentAmount)}
                </div>
              ) : null}
            </div>
          </div>
        </article>
      </section>

      {/* =====================================================
          OPERATIONS
      ===================================================== */}

      <section className="grid items-stretch gap-5 xl:grid-cols-3">
        {/* عملیات امروز */}

        <article className="group relative flex min-h-[330px] flex-col overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute inset-x-0 top-0 h-1 bg-[var(--primary)]" />

          <div className="flex flex-1 flex-col p-6 lg:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                  <LayoutDashboard size={21} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-black">عملیات امروز</h2>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    خلاصه فعالیت روز جاری
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black text-emerald-500">
                امروز
              </span>
            </div>

            <div className="mt-8">
              <div className="text-xs font-bold text-[var(--muted)]">
                مبلغ فروش امروز
              </div>

              <div className="mt-2 truncate text-3xl font-black tracking-tight">
                {money(todayRevenue)}
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[var(--surface-2)] p-4">
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <ShoppingCart size={14} />
                  فروش
                </div>

                <div className="mt-2 text-lg font-black">
                  {num(todaySales.length)}
                </div>

                <div className="mt-1 text-[10px] text-[var(--muted)]">
                  فاکتور
                </div>
              </div>

              <div className="rounded-2xl bg-[var(--surface-2)] p-4">
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <Clock3 size={14} />
                  در انتظار
                </div>

                <div
                  className={`mt-2 text-lg font-black ${
                    pendingSales.length > 0 ? "text-amber-500" : ""
                  }`}
                >
                  {num(pendingSales.length)}
                </div>

                <div className="mt-1 text-[10px] text-[var(--muted)]">
                  پرداخت
                </div>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-5">
              <span className="text-xs text-[var(--muted)]">فروش لغو شده</span>

              <span
                className={`text-sm font-black ${
                  canceledSales.length > 0 ? "text-red-500" : "text-emerald-500"
                }`}
              >
                {num(canceledSales.length)} مورد
              </span>
            </div>
          </div>
        </article>

        {/* تأمین کالا */}

        <article className="group relative flex min-h-[330px] flex-col overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute inset-x-0 top-0 h-1 bg-orange-500" />

          <div className="flex flex-1 flex-col p-6 lg:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-orange-500/10 text-orange-500">
                  <Truck size={21} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-black">تأمین کالا</h2>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    وضعیت ورود کالا و خرید
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/purchases"
                className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--surface-2)] text-[var(--muted)] transition hover:text-[var(--primary)]"
                aria-label="مشاهده خریدها"
              >
                <ChevronLeft size={17} />
              </Link>
            </div>

            <div className="mt-8">
              <div className="text-xs font-bold text-[var(--muted)]">
                مجموع خرید
              </div>

              <div className="mt-2 truncate text-3xl font-black tracking-tight">
                {money(purchaseTotal)}
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[var(--surface-2)] p-4">
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <FilePlus2 size={14} />
                  خریدها
                </div>

                <div className="mt-2 text-lg font-black">
                  {num(purchases.length)}
                </div>

                <div className="mt-1 text-[10px] text-[var(--muted)]">
                  رکورد
                </div>
              </div>

              <div className="rounded-2xl bg-[var(--surface-2)] p-4">
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <Truck size={14} />
                  تأمین‌کننده
                </div>

                <div className="mt-2 text-lg font-black">
                  {num(
                    new Set(purchases.map((purchase) => purchase.supplierName))
                      .size,
                  )}
                </div>

                <div className="mt-1 text-[10px] text-[var(--muted)]">
                  تأمین‌کننده
                </div>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-5">
              <div>
                <div className="text-[10px] text-[var(--muted)]">
                  آخرین خرید
                </div>

                <div className="mt-1 text-sm font-black">
                  {purchases[0] ? money(purchases[0].subtotal) : "۰ ت"}
                </div>
              </div>

              <div className="grid size-10 place-items-center rounded-xl bg-orange-500/10 text-orange-500">
                <ArrowDownLeft size={18} />
              </div>
            </div>
          </div>
        </article>

        {/* بزرگ‌ترین فروش */}

        <article className="group relative flex min-h-[330px] flex-col overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />

          <div className="flex flex-1 flex-col p-6 lg:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <TrendingUp size={21} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-black">بزرگ‌ترین فروش</h2>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    بالاترین مبلغ فاکتور
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black text-emerald-500">
                رکورد فروش
              </span>
            </div>

            {largestSale ? (
              <>
                <div className="mt-8 flex items-center gap-4">
                  <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-sm font-black text-emerald-500">
                    {getInitial(largestSale.buyerName)}
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-sm font-black">
                      {largestSale.buyerName || "فروش حضوری"}
                    </div>

                    <div className="mt-1 text-xs text-[var(--muted)]">
                      {formatDate(largestSale.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-xs font-bold text-[var(--muted)]">
                    مبلغ فاکتور
                  </div>

                  <div className="mt-2 truncate text-3xl font-black tracking-tight text-emerald-500">
                    {money(largestSale.netAmount)}
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-5">
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <Clock3 size={13} />
                    {formatTime(largestSale.createdAt)}
                  </div>

                  <span className="rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-[10px] font-black text-[var(--muted)]">
                    {paymentLabels[largestSale.paymentStatus] ||
                      largestSale.paymentStatus}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <EmptyState text="هنوز فروشی ثبت نشده است." />
              </div>
            )}
          </div>
        </article>
      </section>

      {/* Recent Sales */}

      <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[var(--border)] p-6 lg:p-7 xl:flex-row xl:items-center xl:justify-between">
          <SectionTitle
            icon={ShoppingCart}
            title="فروش‌های اخیر"
            description="آخرین تراکنش‌های ثبت‌شده در فروشگاه"
          />

          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-[var(--surface-2)] px-4 py-2.5 text-xs font-black text-[var(--muted)]">
              {num(Math.min(sales.length, 8))} تراکنش
            </span>

            <Link
              href="/dashboard/sales"
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-bold transition hover:border-[var(--primary)]/30 hover:text-[var(--primary)]"
            >
              مدیریت فروش
              <ChevronLeft size={16} />
            </Link>
          </div>
        </div>

        {sales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                <tr className="text-right text-xs text-[var(--muted)]">
                  <th className="px-7 py-4 font-black">مشتری</th>

                  <th className="px-7 py-4 font-black">مبلغ</th>

                  <th className="px-7 py-4 font-black">تاریخ و ساعت</th>

                  <th className="px-7 py-4 font-black">وضعیت پرداخت</th>

                  <th className="px-7 py-4 font-black">شناسه</th>
                </tr>
              </thead>

              <tbody>
                {sales.slice(0, 8).map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-[var(--border)] transition last:border-0 hover:bg-[var(--surface-2)]"
                  >
                    <td className="px-7 py-5">
                      <div className="flex items-center gap-4">
                        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[var(--primary)]/10 text-sm font-black text-[var(--primary)]">
                          {getInitial(sale.buyerName)}
                        </div>

                        <div>
                          <div className="text-sm font-black">
                            {sale.buyerName || "فروش حضوری"}
                          </div>

                          <div className="mt-1 text-xs text-[var(--muted)]">
                            مشتری فروش
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-7 py-5">
                      <span className="text-base font-black">
                        {money(sale.netAmount)}
                      </span>
                    </td>

                    <td className="px-7 py-5">
                      <div className="flex items-center gap-2 text-sm font-black">
                        <CalendarDays
                          size={15}
                          className="text-[var(--primary)]"
                        />

                        {formatDate(sale.createdAt)}
                      </div>

                      <div className="mt-1.5 flex items-center gap-2 text-xs text-[var(--muted)]">
                        <Clock3 size={13} />
                        {formatTime(sale.createdAt)}
                      </div>
                    </td>

                    <td className="px-7 py-5">
                      <PaymentBadge status={sale.paymentStatus} />
                    </td>

                    <td className="px-7 py-5">
                      <span className="rounded-lg bg-[var(--surface-2)] px-3 py-2 text-xs font-black text-[var(--muted)]">
                        #{String(sale.id).slice(-8)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState text="هنوز هیچ فروش ثبت نشده است." />
        )}
      </section>

      {/* Inventory / Purchases / Activity */}

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr_0.9fr]">
        {/* Inventory */}

        <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border)] p-6 lg:p-7">
            <SectionTitle
              icon={Boxes}
              title="کنترل موجودی"
              description="محصولات نیازمند رسیدگی"
            />

            <Link
              href="/dashboard/products"
              className="text-sm font-black text-[var(--primary)]"
            >
              محصولات
            </Link>
          </div>

          <div className="space-y-3 p-5 lg:p-6">
            {lowStock.length > 0 ? (
              lowStock.slice(0, 5).map((item) => {
                const critical = item.stock <= 2;

                return (
                  <Link
                    key={item.sku}
                    href="/dashboard/products"
                    className="flex items-center gap-4 rounded-2xl border border-[var(--border)] p-4 transition hover:bg-[var(--surface-2)]"
                  >
                    <div
                      className={`grid size-12 shrink-0 place-items-center rounded-xl ${
                        critical
                          ? "bg-red-500/10 text-red-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      <Package size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-black">
                        {item.title}
                      </div>

                      <div className="mt-1.5 text-xs text-[var(--muted)]">
                        SKU: {item.sku}
                      </div>
                    </div>

                    <div className="text-left">
                      <div
                        className={`text-xl font-black ${
                          critical ? "text-red-500" : "text-amber-500"
                        }`}
                      >
                        {num(item.stock)}
                      </div>

                      <div className="mt-0.5 text-[10px] text-[var(--muted)]">
                        موجودی
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="grid min-h-[300px] place-items-center text-center">
                <div>
                  <CheckCircle2
                    size={42}
                    className="mx-auto text-emerald-500"
                  />

                  <p className="mt-4 text-sm font-black">موجودی مناسب است</p>

                  <p className="mt-2 text-xs text-[var(--muted)]">
                    هیچ هشدار موجودی ثبت نشده است.
                  </p>
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Purchases */}

        <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border)] p-6 lg:p-7">
            <SectionTitle
              icon={Truck}
              title="ورودی کالا"
              description="آخرین خریدهای ثبت‌شده"
            />

            <Link
              href="/dashboard/purchases"
              className="text-sm font-black text-[var(--primary)]"
            >
              خریدها
            </Link>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {purchases.length > 0 ? (
              purchases.slice(0, 5).map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center gap-4 p-5 lg:p-6"
                >
                  <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-500">
                    <Truck size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black">
                      {purchase.supplierName || "بدون تأمین‌کننده"}
                    </div>

                    <div className="mt-1.5 flex items-center gap-2 text-xs text-[var(--muted)]">
                      <CalendarDays size={12} />

                      {formatDate(purchase.createdAt)}

                      <span>•</span>

                      <Clock3 size={12} />

                      {formatTime(purchase.createdAt)}
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="text-sm font-black">
                      {money(purchase.subtotal)}
                    </div>

                    <div className="mt-1 text-xs text-[var(--muted)]">خرید</div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState text="هنوز خریدی ثبت نشده است." />
            )}
          </div>
        </article>

        {/* Activity */}

        <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="border-b border-[var(--border)] p-6 lg:p-7">
            <SectionTitle
              icon={Clock3}
              title="فعالیت‌های اخیر"
              description="آخرین رویدادهای سیستم"
            />
          </div>

          <div className="p-5 lg:p-6">
            {recentActivity.length > 0 ? (
              <div className="relative space-y-0">
                <div className="absolute bottom-5 right-5 top-5 w-px bg-[var(--border)]" />

                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="relative flex gap-4 pb-7 last:pb-0"
                  >
                    <div
                      className={`z-10 grid size-10 shrink-0 place-items-center rounded-full border-4 border-[var(--surface)] ${
                        activity.type === "sale"
                          ? "bg-blue-500/15 text-blue-500"
                          : "bg-orange-500/15 text-orange-500"
                      }`}
                    >
                      {activity.type === "sale" ? (
                        <ShoppingCart size={15} />
                      ) : (
                        <Truck size={15} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 pt-1">
                      <div className="truncate text-sm font-black">
                        {activity.title}
                      </div>

                      <div className="mt-1 text-xs text-[var(--muted)]">
                        {activity.description}
                      </div>

                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 text-[10px] text-[var(--muted)]">
                          <Clock3 size={10} />

                          {formatDate(activity.createdAt)}

                          {" • "}

                          {formatTime(activity.createdAt)}
                        </span>

                        <span className="text-xs font-black">
                          {money(activity.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="فعالیتی ثبت نشده است." />
            )}
          </div>
        </article>
      </section>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

type SnapshotProps = {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  warning?: boolean;
  danger?: boolean;
};

function Snapshot({
  icon: Icon,
  label,
  value,
  warning,
  danger,
}: SnapshotProps) {
  return (
    <div className="flex min-h-[96px] items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <span
        className={`grid size-13 shrink-0 place-items-center rounded-xl ${
          danger
            ? "bg-red-500/10 text-red-500"
            : warning
              ? "bg-amber-500/10 text-amber-500"
              : "bg-[var(--surface-2)] text-[var(--primary)]"
        }`}
      >
        <Icon size={21} />
      </span>

      <div className="min-w-0">
        <p className="text-xs font-bold text-[var(--muted)]">{label}</p>

        <p
          className={`mt-2 truncate text-base font-black ${
            danger ? "text-red-500" : warning ? "text-amber-500" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

type SectionTitleProps = {
  icon: typeof LayoutDashboard;
  title: string;
  description: string;
};

function SectionTitle({ icon: Icon, title, description }: SectionTitleProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
        <Icon size={21} />
      </span>

      <div className="min-w-0">
        <h2 className="text-lg font-black lg:text-xl">{title}</h2>

        <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>
      </div>
    </div>
  );
}

type PerformanceBoxProps = {
  label: string;
  value: string;
  icon: typeof ShoppingCart;
};

function PerformanceBox({ label, value, icon: Icon }: PerformanceBoxProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
      <div className="flex items-center gap-2 text-xs font-bold text-[var(--muted)]">
        <Icon size={16} />
        {label}
      </div>

      <div className="mt-3 truncate text-xl font-black">{value}</div>
    </div>
  );
}

type FinancialRowProps = {
  label: string;
  count: number;
  amount: number;
  color: "green" | "yellow" | "blue" | "red";
  icon: typeof CheckCircle2;
};

function FinancialRow({
  label,
  count,
  amount,
  color,
  icon: Icon,
}: FinancialRowProps) {
  const styles = {
    green: "bg-emerald-500/10 text-emerald-500",
    yellow: "bg-amber-500/10 text-amber-500",
    blue: "bg-blue-500/10 text-blue-500",
    red: "bg-red-500/10 text-red-500",
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] p-4">
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl ${styles[color]}`}
      >
        <Icon size={18} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-black">{label}</div>

        <div className="mt-1 text-xs text-[var(--muted)]">
          {num(count)} فاکتور
        </div>
      </div>

      <div className="text-left text-sm font-black">{money(amount)}</div>
    </div>
  );
}

type ActionTileProps = {
  href: string;
  icon: typeof ShoppingCart;
  title: string;
  description: string;
};

function ActionTile({ href, icon: Icon, title, description }: ActionTileProps) {
  return (
    <Link
      href={href}
      className="group flex min-h-[105px] items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5 transition duration-200 hover:-translate-y-1 hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5"
    >
      <span className="grid size-13 shrink-0 place-items-center rounded-xl bg-[var(--surface)] text-[var(--primary)] shadow-sm">
        <Icon size={21} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-black">{title}</div>

        <div className="mt-1.5 text-xs text-[var(--muted)]">{description}</div>
      </div>

      <ChevronLeft
        size={18}
        className="text-[var(--muted)] transition group-hover:-translate-x-1 group-hover:text-[var(--primary)]"
      />
    </Link>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    PAID: "bg-emerald-500/10 text-emerald-500",
    PENDING_TRANSFER: "bg-amber-500/10 text-amber-500",
    PARTIAL: "bg-blue-500/10 text-blue-500",
    CANCELED: "bg-red-500/10 text-red-500",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black ${
        classes[status] || "bg-[var(--surface-2)] text-[var(--muted)]"
      }`}
    >
      {paymentLabels[status] || status}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="grid min-h-[240px] place-items-center p-8 text-center text-sm font-bold text-[var(--muted)]">
      {text}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div dir="rtl" className="mx-auto max-w-[1850px] space-y-6 pb-14">
      <div className="h-[120px] animate-pulse rounded-3xl bg-[var(--surface-2)]" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-2xl bg-[var(--surface-2)]"
          />
        ))}
      </div>

      <div className="h-[180px] animate-pulse rounded-3xl bg-[var(--surface-2)]" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_430px]">
        <div className="h-[620px] animate-pulse rounded-3xl bg-[var(--surface-2)]" />

        <div className="h-[620px] animate-pulse rounded-3xl bg-[var(--surface-2)]" />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[330px] animate-pulse rounded-[28px] bg-[var(--surface-2)]"
          />
        ))}
      </div>

      <div className="h-[620px] animate-pulse rounded-3xl bg-[var(--surface-2)]" />

      <div className="grid gap-6 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[500px] animate-pulse rounded-3xl bg-[var(--surface-2)]"
          />
        ))}
      </div>
    </div>
  );
}
