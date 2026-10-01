"use client";

import Link from "next/link";
import {
  Boxes,
  ClipboardList,
  FileText,
  Package,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { useSupplierOverview } from "../hooks";
import {
  EmptyState,
  PageHeader,
  Panel,
  QuickLink,
  StatCard,
  faDate,
  money,
} from "@/features/portal/ui/PortalUI";

export default function SupplierOverview({ name }: { name: string }) {
  const { data, isLoading: loading, error, refetch } = useSupplierOverview();

  const load = () => {
    void refetch();
  };

  const errorMessage = error
    ? error instanceof Error
      ? error.message
      : String(error)
    : null;

  return (
    <div className="space-y-5">
      <PageHeader
        title={`سلام، ${data?.supplier?.name || name}`}
        description="نمای کلی همکاری شما با فروشگاه ابزار احمدی — محصولات تخصیص‌یافته، خریدها و وضعیت مالی."
        actions={
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-bold"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            بروزرسانی
          </button>
        }
      />

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="محصولات تخصیص‌یافته"
          value={data ? money(data.stats.productCount) : "—"}
          note="اقلام قابل مشاهده در پنل"
          icon={Package}
        />

        <StatCard
          label="سفارش‌های خرید"
          value={data ? money(data.stats.orderCount) : "—"}
          note="ثبت‌شده توسط مدیر"
          icon={ClipboardList}
        />

        <StatCard
          label="جمع خریدها"
          value={data ? money(data.stats.totalPurchaseAmount) : "—"}
          note="تومان"
          icon={Wallet}
        />

        <StatCard
          label="تعداد اقلام"
          value={data ? money(data.stats.totalUnits) : "—"}
          note="مجموع واحدهای خرید"
          icon={Boxes}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Panel
          title="سفارش‌های اخیر"
          action={
            <Link
              href="/supplier/orders"
              className="text-xs font-bold text-[var(--primary)]"
            >
              مشاهده همه
            </Link>
          }
        >
          {!data || loading ? (
            <EmptyState message="در حال بارگذاری..." />
          ) : !data.recentOrders.length ? (
            <EmptyState message="هنوز سفارش خریدی برای شما ثبت نشده است." />
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {data.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <div className="text-sm font-black">
                      #{order.id.slice(0, 8)}
                    </div>

                    <div className="mt-1 text-xs text-[var(--muted)]">
                      {faDate(order.createdAt)} · {money(order.itemCount)} قلم ·{" "}
                      {order.paymentMethod === "CHECK" ? "چک" : "نقدی"}
                    </div>
                  </div>

                  <div className="text-sm font-black tabular-nums">
                    {money(order.subtotal)} ت
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="دسترسی سریع">
          <div className="grid gap-3">
            <QuickLink
              href="/supplier/products"
              title="محصولات من"
              desc="اقلام تخصیص‌یافته"
              icon={Package}
            />

            <QuickLink
              href="/supplier/orders"
              title="سفارش‌های خرید"
              desc="جزئیات و اقلام"
              icon={ClipboardList}
            />

            <QuickLink
              href="/supplier/invoices"
              title="فاکتورها"
              desc="اسناد خرید"
              icon={FileText}
            />

            <QuickLink
              href="/supplier/finance"
              title="حساب مالی"
              desc="جمع و روش پرداخت"
              icon={Wallet}
            />
          </div>
        </Panel>
      </section>
    </div>
  );
}
