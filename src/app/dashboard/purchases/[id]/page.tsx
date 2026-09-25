import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  CircleDollarSign,
  ClipboardList,
  FileText,
  Hash,
  Package,
  Receipt,
  ShoppingBag,
  Store,
  UserRound,
  WalletCards,
} from "lucide-react";

import { getJson } from "@/lib/github";
import type { Product, Purchase, PurchaseItem, CheckRecord } from "@/lib/types";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const fa = (value: number) => value.toLocaleString("fa-IR");

const toman = (value: number) => `${fa(value)} تومان`;

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Tehran",
    hour12: false,
  }).format(date);
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    dateStyle: "medium",
    timeZone: "Asia/Tehran",
  }).format(date);
};

function InfoBox({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-[var(--muted)]">
            {label}
          </p>

          <div className="mt-1 break-words text-sm font-black text-[var(--text)]">
            {value}
          </div>

          {description && (
            <p className="mt-1 text-[10px] text-[var(--muted)]">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentBadge({ method }: { method: string }) {
  const isCheck = method === "CHECK";

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black",
        isCheck
          ? "bg-amber-500/10 text-amber-600"
          : "bg-emerald-500/10 text-emerald-600",
      ].join(" ")}
    >
      {isCheck ? <WalletCards size={15} /> : <Banknote size={15} />}

      {isCheck ? "پرداخت چکی" : "پرداخت نقدی"}
    </span>
  );
}

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--bg-secondary)] text-[var(--primary)]">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-black text-[var(--text)]">{title}</h2>

          {description && (
            <p className="mt-1 text-[10px] text-[var(--muted)]">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function PurchaseDetail({ params }: PageProps) {
  const { id } = await params;

  const [purchasesFile, itemsFile, productsFile, checksFile] =
    await Promise.all([
      getJson<Purchase[]>("purchases.json", []),
      getJson<PurchaseItem[]>("purchase-items.json", []),
      getJson<Product[]>("products.json", []),
      getJson<CheckRecord[]>("checks.json", []),
    ]);

  const purchase = purchasesFile.data.find((item) => item.id === id);

  if (!purchase) {
    return (
      <main
        dir="rtl"
        className="mx-auto flex min-h-[60vh] w-full max-w-5xl items-center justify-center px-4"
      >
        <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-sm">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-red-500/10 text-red-500">
            <Receipt size={28} />
          </div>

          <h1 className="mt-5 text-2xl font-black text-[var(--text)]">
            خرید پیدا نشد
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            سند خرید موردنظر وجود ندارد یا شناسه آن اشتباه است.
          </p>

          <Link
            href="/dashboard/purchases"
            className="btn btn-primary mt-6 inline-flex items-center gap-2"
          >
            <ArrowRight size={16} />
            بازگشت به خریدها
          </Link>
        </div>
      </main>
    );
  }

  const productMap = new Map(
    productsFile.data.map((product) => [product.id, product]),
  );

  const rows = itemsFile.data.filter((item) => item.purchaseId === id);

  const check = checksFile.data.find((item) => item.id === purchase.checkId);

  const totalQuantity = rows.reduce(
    (sum, row) => sum + Number(row.quantity || 0),
    0,
  );

  const calculatedTotal = rows.reduce(
    (sum, row) => sum + Number(row.total || 0),
    0,
  );

  const paymentIsCheck = purchase.paymentMethod === "CHECK";

  return (
    <main
      dir="rtl"
      className="mx-auto w-full max-w-[1500px] space-y-5 px-3 pb-8 sm:px-5"
    >
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
        <Link
          href="/dashboard"
          className="transition hover:text-[var(--primary)]"
        >
          داشبورد
        </Link>

        <ChevronLeft size={13} />

        <Link
          href="/dashboard/purchases"
          className="transition hover:text-[var(--primary)]"
        >
          خریدها
        </Link>

        <ChevronLeft size={13} />

        <span className="font-bold text-[var(--text)]">جزئیات سند</span>
      </div>

      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-[#18232d] p-5 text-white shadow-sm sm:p-7">
        <div className="absolute -left-24 -top-28 size-80 rounded-full bg-[#00adb5]/15 blur-3xl" />

        <div className="absolute -bottom-32 right-1/3 size-72 rounded-full bg-[#00adb5]/10 blur-3xl" />

        <div className="relative">
          <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-lg bg-[#00adb5]/15 px-3 py-1.5 text-[10px] font-black text-[#80e1e3]">
                  <FileText size={14} />
                  سند خرید
                </span>

                <span className="rounded-lg border border-white/10 px-3 py-1.5 font-mono text-[10px] font-bold text-slate-300">
                  #{id.slice(0, 8)}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold text-emerald-300">
                  <CheckCircle2 size={13} />
                  ثبت‌شده
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-black sm:text-3xl">
                جزئیات خرید
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                اطلاعات کامل سند خرید، اقلام کالا، مبلغ پرداختی و وضعیت تسویه.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <PaymentBadge method={purchase.paymentMethod} />

              <Link
                href="/dashboard/purchases"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10"
              >
                <ArrowRight size={15} />
                بازگشت به خریدها
              </Link>
            </div>
          </div>

          {/* Header summary */}
          <div className="mt-7 grid grid-cols-2 gap-2 border-t border-white/10 pt-5 md:grid-cols-4">
            <div className="rounded-2xl bg-white/5 p-3">
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <UserRound size={13} />
                تأمین‌کننده
              </div>

              <p className="mt-2 truncate text-sm font-black text-white">
                {purchase.supplierName || "بدون تأمین‌کننده"}
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-3">
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <Package size={13} />
                تعداد اقلام
              </div>

              <p className="mt-2 text-sm font-black text-white">
                {fa(totalQuantity)}
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-3">
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <ShoppingBag size={13} />
                ردیف‌های کالا
              </div>

              <p className="mt-2 text-sm font-black text-white">
                {fa(rows.length)}
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-3">
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <CalendarDays size={13} />
                تاریخ ثبت
              </div>

              <p className="mt-2 text-xs font-black text-white">
                {formatDate(purchase.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main information */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <InfoBox
          icon={<Hash size={18} />}
          label="شناسه کامل سند"
          value={<span className="font-mono text-xs">{id}</span>}
          description="شناسه یکتای ثبت‌شده در سیستم"
        />

        <InfoBox
          icon={<Store size={18} />}
          label="تأمین‌کننده"
          value={purchase.supplierName || "بدون تأمین‌کننده"}
          description="طرف حساب ثبت‌شده برای این خرید"
        />

        <InfoBox
          icon={<CalendarDays size={18} />}
          label="تاریخ و ساعت ثبت"
          value={formatDateTime(purchase.createdAt)}
          description="بر اساس منطقه زمانی تهران"
        />
      </section>

      {/* Financial overview */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[var(--muted)]">مبلغ سند</p>

              <p className="mt-2 text-xl font-black text-[var(--text)]">
                {toman(Number(purchase.subtotal || 0))}
              </p>
            </div>

            <div className="grid size-11 place-items-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
              <CircleDollarSign size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[var(--muted)]">
                مجموع محاسبه‌شده اقلام
              </p>

              <p className="mt-2 text-xl font-black text-[var(--text)]">
                {toman(calculatedTotal)}
              </p>
            </div>

            <div className="grid size-11 place-items-center rounded-xl bg-violet-500/10 text-violet-600">
              <ClipboardList size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[var(--muted)]">
                تعداد کالا
              </p>

              <p className="mt-2 text-xl font-black text-[var(--text)]">
                {fa(totalQuantity)}
              </p>
            </div>

            <div className="grid size-11 place-items-center rounded-xl bg-blue-500/10 text-blue-600">
              <Package size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[var(--muted)]">
                روش پرداخت
              </p>

              <p className="mt-2 text-xl font-black text-[var(--text)]">
                {paymentIsCheck ? "چکی" : "نقدی"}
              </p>
            </div>

            <div
              className={[
                "grid size-11 place-items-center rounded-xl",
                paymentIsCheck
                  ? "bg-amber-500/10 text-amber-600"
                  : "bg-emerald-500/10 text-emerald-600",
              ].join(" ")}
            >
              {paymentIsCheck ? (
                <WalletCards size={21} />
              ) : (
                <Banknote size={21} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex flex-col justify-between gap-3 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center">
          <SectionTitle
            icon={<ShoppingBag size={19} />}
            title="اقلام خرید"
            description={`${fa(rows.length)} ردیف کالا در این سند`}
          />

          <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-[var(--bg-secondary)] px-3 py-2 text-xs font-bold text-[var(--muted)]">
            <Package size={14} />
            {fa(totalQuantity)} عدد کالا
          </div>
        </div>

        {rows.length > 0 ? (
          <>
            {/* Desktop header */}
            <div className="hidden grid-cols-[minmax(280px,1fr)_110px_180px_180px] gap-4 bg-[var(--bg-secondary)]/60 px-5 py-3 text-[10px] font-black text-[var(--muted)] md:grid">
              <span>محصول</span>
              <span>تعداد</span>
              <span>قیمت واحد</span>
              <span className="text-left">جمع</span>
            </div>

            <div>
              {rows.map((row, index) => {
                const product = productMap.get(row.productId);

                return (
                  <div
                    key={row.id}
                    className="border-t border-[var(--border)] px-4 py-4 transition hover:bg-[var(--bg-secondary)]/40 sm:px-5"
                  >
                    {/* Desktop */}
                    <div className="hidden grid-cols-[minmax(280px,1fr)_110px_180px_180px] items-center gap-4 md:grid">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                          <Package size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-[var(--text)]">
                            {product?.title || row.productId}
                          </p>

                          <p className="mt-1 text-[10px] text-[var(--muted)]">
                            ردیف {fa(index + 1)} · شناسه محصول {row.productId}
                          </p>
                        </div>
                      </div>

                      <div className="text-sm font-bold text-[var(--text)]">
                        {fa(row.quantity)}
                      </div>

                      <div className="text-sm font-bold text-[var(--text)]">
                        {toman(row.unitCost)}
                      </div>

                      <div className="text-left">
                        <p className="text-sm font-black text-[var(--text)]">
                          {fa(row.total)}
                        </p>

                        <p className="mt-1 text-[9px] text-[var(--muted)]">
                          تومان
                        </p>
                      </div>
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden">
                      <div className="flex items-start gap-3">
                        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                          <Package size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-black text-[var(--text)]">
                            {product?.title || row.productId}
                          </p>

                          <p className="mt-1 text-[10px] text-[var(--muted)]">
                            ردیف {fa(index + 1)}
                          </p>
                        </div>

                        <div className="text-left">
                          <p className="text-sm font-black text-[var(--text)]">
                            {fa(row.total)}
                          </p>

                          <p className="text-[9px] text-[var(--muted)]">
                            تومان
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-[var(--bg-secondary)] p-3">
                          <p className="text-[10px] text-[var(--muted)]">
                            تعداد
                          </p>

                          <p className="mt-1 text-xs font-black text-[var(--text)]">
                            {fa(row.quantity)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-[var(--bg-secondary)] p-3">
                          <p className="text-[10px] text-[var(--muted)]">
                            قیمت واحد
                          </p>

                          <p className="mt-1 text-xs font-black text-[var(--text)]">
                            {toman(row.unitCost)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="border-t border-[var(--border)] bg-[var(--bg-secondary)]/50 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold text-[var(--muted)]">
                    جمع نهایی سند
                  </p>

                  <p className="mt-1 text-[10px] text-[var(--muted)]">
                    مجموع مبلغ ثبت‌شده در سند خرید
                  </p>
                </div>

                <div className="text-right sm:text-left">
                  <p className="text-2xl font-black text-[var(--primary)]">
                    {toman(Number(purchase.subtotal || calculatedTotal || 0))}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--bg-secondary)] text-[var(--muted)]">
              <Package size={24} />
            </div>

            <p className="mt-4 font-black text-[var(--text)]">
              این سند فاقد اقلام ثبت‌شده است
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              برای این خرید هنوز محصولی در purchase-items ثبت نشده است.
            </p>
          </div>
        )}
      </section>

      {/* Bottom information */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_420px]">
        {/* Purchase information */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <SectionTitle
            icon={<Receipt size={19} />}
            title="اطلاعات سند"
            description="مشخصات اصلی ثبت‌شده برای این خرید"
          />

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[var(--bg-secondary)] p-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--muted)]">
                <Hash size={13} />
                شناسه سند
              </div>

              <p className="mt-2 break-all font-mono text-xs font-black text-[var(--text)]">
                {id}
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--bg-secondary)] p-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--muted)]">
                <UserRound size={13} />
                تأمین‌کننده
              </div>

              <p className="mt-2 text-sm font-black text-[var(--text)]">
                {purchase.supplierName || "بدون تأمین‌کننده"}
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--bg-secondary)] p-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--muted)]">
                <CalendarDays size={13} />
                تاریخ ثبت
              </div>

              <p className="mt-2 text-xs font-black text-[var(--text)]">
                {formatDate(purchase.createdAt)}
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--bg-secondary)] p-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--muted)]">
                <CircleDollarSign size={13} />
                مبلغ نهایی
              </div>

              <p className="mt-2 text-sm font-black text-[var(--text)]">
                {toman(Number(purchase.subtotal || 0))}
              </p>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <SectionTitle
            icon={
              paymentIsCheck ? (
                <WalletCards size={19} />
              ) : (
                <Banknote size={19} />
              )
            }
            title="اطلاعات پرداخت"
            description="وضعیت و روش تسویه سند"
          />

          <div className="mt-5 rounded-2xl bg-[var(--bg-secondary)] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] text-[var(--muted)]">روش پرداخت</p>

                <p className="mt-1 text-lg font-black text-[var(--text)]">
                  {paymentIsCheck ? "چکی" : "نقدی"}
                </p>
              </div>

              <div
                className={[
                  "grid size-12 place-items-center rounded-xl",
                  paymentIsCheck
                    ? "bg-amber-500/10 text-amber-600"
                    : "bg-emerald-500/10 text-emerald-600",
                ].join(" ")}
              >
                {paymentIsCheck ? (
                  <WalletCards size={21} />
                ) : (
                  <Banknote size={21} />
                )}
              </div>
            </div>

            <div className="my-4 h-px bg-[var(--border)]" />

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--muted)]">مبلغ سند</span>

              <span className="text-sm font-black text-[var(--text)]">
                {toman(Number(purchase.subtotal || 0))}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--muted)]">وضعیت</span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black text-emerald-600">
                <CheckCircle2 size={12} />
                ثبت‌شده
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Check information */}
      {check && (
        <section className="overflow-hidden rounded-3xl border border-amber-500/20 bg-[var(--surface)]">
          <div className="border-b border-amber-500/15 bg-amber-500/[0.04] p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
                  <WalletCards size={21} />
                </div>

                <div>
                  <h2 className="text-sm font-black text-[var(--text)]">
                    اطلاعات چک
                  </h2>

                  <p className="mt-1 text-[10px] text-[var(--muted)]">
                    جزئیات پرداخت چکی این سند
                  </p>
                </div>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-[10px] font-black text-amber-600">
                <CircleDollarSign size={14} />
                پرداخت چکی
              </span>
            </div>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
            <InfoBox
              icon={<Hash size={18} />}
              label="شماره چک"
              value={check.number || "—"}
            />

            <InfoBox
              icon={<Banknote size={18} />}
              label="بانک"
              value={check.bank || "—"}
            />

            <InfoBox
              icon={<CalendarDays size={18} />}
              label="تاریخ سررسید"
              value={check.dueDate || "—"}
            />

            <InfoBox
              icon={<CircleDollarSign size={18} />}
              label="مبلغ"
              value={toman(Number(purchase.subtotal || 0))}
            />
          </div>

          <div className="border-t border-[var(--border)] px-5 py-4">
            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <CheckCircle2 size={15} className="text-emerald-500" />
              اطلاعات چک به این سند خرید متصل شده است.
            </div>
          </div>
        </section>
      )}

      {/* Footer navigation */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-black text-[var(--text)]">
            پایان جزئیات سند
          </p>

          <p className="mt-1 text-[10px] text-[var(--muted)]">
            تمام اطلاعات ثبت‌شده این خرید در این صفحه نمایش داده می‌شود.
          </p>
        </div>

        <Link
          href="/dashboard/purchases"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs font-black text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
        >
          <ArrowRight size={15} />
          بازگشت به فهرست خریدها
        </Link>
      </div>
    </main>
  );
}
