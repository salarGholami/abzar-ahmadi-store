"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as XLSX from "xlsx";
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import gregorian from "react-date-object/calendars/gregorian";
import persian_fa from "react-date-object/locales/persian_fa";

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowUpFromLine,
  BadgeCheck,
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  CircleDollarSign,
  ClipboardList,
  Download,
  FileSpreadsheet,
  LayoutDashboard,
  ListFilter,
  Package,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShoppingBag,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

import type { Purchase, Supplier } from "@/lib/types";
import Pagination from "@/shared/ui/Pagination";

type Props = {
  purchases: Purchase[];
  suppliers: Supplier[];
};

type PaymentFilter = "ALL" | "CASH" | "CHECK";

const PAGE_SIZE = 10;

const cn = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

const fa = (value: number) => new Intl.NumberFormat("fa-IR").format(value);

const toman = (value: number) => `${fa(value)} تومان`;

const str = (value: unknown) => String(value ?? "").trim();

const normalize = (value: unknown) =>
  str(value).toLocaleLowerCase("fa").replace(/\s+/g, " ");

const englishDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

const getId = (purchase: Purchase) =>
  str(
    (
      purchase as Purchase & {
        id?: string | number;
      }
    ).id,
  );

const getSupplierId = (purchase: Purchase) =>
  str(
    (
      purchase as Purchase & {
        supplierId?: string | number;
      }
    ).supplierId,
  );

const getSupplierName = (purchase: Purchase) =>
  str(
    (
      purchase as Purchase & {
        supplierName?: string;
      }
    ).supplierName,
  );

const getAmount = (purchase: Purchase) =>
  Number(
    (
      purchase as Purchase & {
        subtotal?: number | string;
      }
    ).subtotal ?? 0,
  ) || 0;

const getPayment = (purchase: Purchase): "CASH" | "CHECK" => {
  const value = normalize(
    (
      purchase as Purchase & {
        paymentMethod?: string;
      }
    ).paymentMethod,
  );

  return ["check", "چک", "چکی"].some((item) => value.includes(item))
    ? "CHECK"
    : "CASH";
};

const getDateValue = (purchase: Purchase) =>
  (
    purchase as Purchase & {
      createdAt?: string;
    }
  ).createdAt;

/**
 * نمایش تاریخ و ساعت در جدول:
 *
 * Gregorian / ISO
 * =>
 * ۶ مهر ۱۴۰۵، ۱۴:۳۵
 */
const formatDate = (value: unknown) => {
  if (!value) return "—";

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return str(value);
  }

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

/**
 * تاریخ و ساعت برای Excel
 *
 * خروجی:
 * ۱۴۰۵/۰۷/۰۶ ۱۴:۳۵
 */
const formatDateForExcel = (value: unknown) => {
  if (!value) return "";

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

/**
 * تبدیل DateObject شمسی انتخاب‌شده
 * به تاریخ Gregorian با فرمت YYYY-MM-DD
 */
const toGregorianDate = (value: DateObject | null): string => {
  if (!value) return "";

  const converted = value.convert(gregorian);

  const year = String(converted.year).padStart(4, "0");

  const month = String(converted.month.number).padStart(2, "0");

  const day = String(converted.day).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * تبدیل تاریخ ISO به کلید Gregorian
 * برای فیلتر کردن.
 */
const getDateKey = (value: unknown) => {
  if (!value) return "";

  const date = new Date(String(value));

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
};

/**
 * تبدیل تاریخ شمسی Excel به ISO.
 *
 * پشتیبانی:
 *
 * 1405/07/06
 * ۱۴۰۵/۰۷/۰۶
 * 1405-07-06
 * 2026-09-28
 * Date
 * Excel serial number
 *
 * همچنین اگر ساعت وجود داشته باشد:
 *
 * 1405/07/06 14:35
 *
 * ساعت هم حفظ می‌شود.
 */
const parseImportDate = (value: unknown) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);

    if (parsed) {
      return new Date(
        Date.UTC(
          parsed.y,
          parsed.m - 1,
          parsed.d,
          parsed.H,
          parsed.M,
          parsed.S,
        ),
      ).toISOString();
    }
  }

  const raw = str(value);

  if (!raw) {
    return new Date().toISOString();
  }

  const normalized = englishDigits(raw);

  /**
   * تاریخ + ساعت
   *
   * مثال:
   * 1405/07/06 14:35
   * 1405-07-06 14:35
   */
  const dateTimeMatch = normalized.match(
    /^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})(?:[ T]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
  );

  if (dateTimeMatch) {
    const year = Number(dateTimeMatch[1]);
    const month = Number(dateTimeMatch[2]);
    const day = Number(dateTimeMatch[3]);
    const hour = Number(dateTimeMatch[4] ?? 0);
    const minute = Number(dateTimeMatch[5] ?? 0);
    const second = Number(dateTimeMatch[6] ?? 0);

    if (
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59 ||
      second < 0 ||
      second > 59
    ) {
      throw new Error(`ساعت نامعتبر است: ${raw}`);
    }

    if (year >= 1200 && year <= 1600) {
      try {
        const persianDate = new DateObject({
          date: `${year}/${month}/${day}`,
          calendar: persian,
          locale: persian_fa,
        });

        const converted = persianDate.convert(gregorian);

        const jsDate = new Date(
          Date.UTC(
            converted.year,
            converted.month.number - 1,
            converted.day,
            hour,
            minute,
            second,
          ),
        );

        if (!Number.isNaN(jsDate.getTime())) {
          return jsDate.toISOString();
        }
      } catch {
        throw new Error(`تاریخ شمسی نامعتبر است: ${raw}`);
      }
    }

    if (year >= 1900 && year <= 2200) {
      const jsDate = new Date(
        Date.UTC(year, month - 1, day, hour, minute, second),
      );

      if (!Number.isNaN(jsDate.getTime())) {
        return jsDate.toISOString();
      }
    }
  }

  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`تاریخ نامعتبر است: ${raw}`);
  }

  return parsed.toISOString();
};

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

      {foot && (
        <div className="relative mt-3 flex items-center gap-1 border-t border-[var(--border)] pt-2 text-[10px] text-[var(--muted)]">
          <Activity size={12} />
          {foot}
        </div>
      )}
    </div>
  );
}

function MethodBadge({ method }: { method: "CASH" | "CHECK" }) {
  const check = method === "CHECK";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-extrabold",
        check
          ? "bg-amber-500/10 text-amber-600"
          : "bg-emerald-500/10 text-emerald-600",
      )}
    >
      {check ? <CalendarDays size={12} /> : <Banknote size={12} />}

      {check ? "چکی" : "نقدی"}
    </span>
  );
}

function PersianDateField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const pickerValue = useMemo(() => {
    if (!value) {
      return undefined;
    }

    try {
      const [year, month, day] = value.split("-").map(Number);

      if (!year || !month || !day) {
        return undefined;
      }

      const gregorianDate = new DateObject({
        date: `${year}/${month}/${day}`,
        calendar: gregorian,
        locale: persian_fa,
      });

      return gregorianDate.convert(persian);
    } catch {
      return undefined;
    }
  }, [value]);

  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-bold text-[var(--muted)]">
        {label}
      </span>

      <div className="relative">
        <DatePicker
          calendar={persian}
          locale={persian_fa}
          calendarPosition="bottom-right"
          value={pickerValue}
          onChange={(nextValue) => {
            if (!nextValue) {
              onChange("");
              return;
            }

            if (Array.isArray(nextValue)) {
              const first = nextValue[0];

              onChange(first ? toGregorianDate(first) : "");

              return;
            }

            onChange(toGregorianDate(nextValue));
          }}
          format="YYYY/MM/DD"
          placeholder={placeholder}
          inputClass="input w-full"
          containerClassName="w-full"
          editable={false}
          weekStartDayIndex={6}
          portal
          zIndex={9999}
        />
      </div>
    </label>
  );
}

export default function PurchasesBrowser({ purchases, suppliers }: Props) {
  const router = useRouter();

  const fileRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState<PaymentFilter>("ALL");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const supplierMap = useMemo(
    () =>
      new Map(
        suppliers.map((supplier) => [
          String(supplier.id),
          String(supplier.name ?? ""),
        ]),
      ),
    [suppliers],
  );

  const supplierOf = (purchase: Purchase) =>
    getSupplierName(purchase) ||
    supplierMap.get(getSupplierId(purchase)) ||
    "تأمین‌کننده نامشخص";

  const allAmount = purchases.reduce(
    (sum, purchase) => sum + getAmount(purchase),
    0,
  );

  const cashPurchases = useMemo(
    () => purchases.filter((purchase) => getPayment(purchase) === "CASH"),
    [purchases],
  );

  const checkPurchases = useMemo(
    () => purchases.filter((purchase) => getPayment(purchase) === "CHECK"),
    [purchases],
  );

  const cashAmount = cashPurchases.reduce(
    (sum, purchase) => sum + getAmount(purchase),
    0,
  );

  const checkAmount = checkPurchases.reduce(
    (sum, purchase) => sum + getAmount(purchase),
    0,
  );

  const filtered = useMemo(() => {
    const query = normalize(englishDigits(search));

    const min = minAmount
      ? Number(englishDigits(minAmount).replace(/[,\s٬]/g, ""))
      : null;

    const max = maxAmount
      ? Number(englishDigits(maxAmount).replace(/[,\s٬]/g, ""))
      : null;

    return purchases.filter((purchase) => {
      const amount = getAmount(purchase);

      const supplier = normalize(supplierOf(purchase));

      const id = normalize(getId(purchase));

      const date = getDateValue(purchase);

      const dateKey = getDateKey(date);

      const matchesSearch =
        !query || supplier.includes(query) || id.includes(query);

      const matchesPayment =
        payment === "ALL" || getPayment(purchase) === payment;

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
        matchesFrom &&
        matchesTo &&
        matchesMin &&
        matchesMax
      );
    });
  }, [
    purchases,
    search,
    payment,
    dateFrom,
    dateTo,
    minAmount,
    maxAmount,
    supplierMap,
  ]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const activePage = Math.min(page, pageCount);

  const visible = filtered.slice(
    (activePage - 1) * PAGE_SIZE,
    activePage * PAGE_SIZE,
  );

  const activeFilters = [
    Boolean(search),
    payment !== "ALL",
    Boolean(dateFrom),
    Boolean(dateTo),
    Boolean(minAmount),
    Boolean(maxAmount),
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch("");
    setPayment("ALL");
    setDateFrom("");
    setDateTo("");
    setMinAmount("");
    setMaxAmount("");
    setPage(1);
  };

  const exportExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const rows = filtered.map((purchase, index) => ({
        ردیف: index + 1,
        شناسه: getId(purchase),
        تأمین‌کننده: supplierOf(purchase),
        مبلغ: getAmount(purchase),
        پرداخت: getPayment(purchase) === "CHECK" ? "چکی" : "نقدی",
        تاریخ: formatDateForExcel(getDateValue(purchase)),
      }));

      const sheet = XLSX.utils.json_to_sheet(rows);

      sheet["!cols"] = [
        { wch: 8 },
        { wch: 22 },
        { wch: 30 },
        { wch: 18 },
        { wch: 14 },
        { wch: 25 },
      ];

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, sheet, "خریدها");

      XLSX.writeFile(
        workbook,
        `purchases-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );

      setMessage("فایل خروجی Excel ساخته شد.");

      setErrors([]);
    } catch {
      setMessage("ساخت فایل Excel ناموفق بود.");
    }
  };

  const downloadTemplate = async () => {
    const XLSX = await import("xlsx");
    const today = new DateObject({
      calendar: persian,
      locale: persian_fa,
    }).format("YYYY/MM/DD");

    const sheet = XLSX.utils.json_to_sheet([
      {
        "نام تأمین‌کننده": "",
        مبلغ: "",
        "روش پرداخت": "نقدی",
        "تاریخ ثبت": today,
      },
    ]);

    sheet["!cols"] = [{ wch: 28 }, { wch: 18 }, { wch: 18 }, { wch: 22 }];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, sheet, "قالب خرید");

    XLSX.writeFile(workbook, "purchases-template.xlsx");

    setMessage("قالب Excel با تاریخ شمسی آماده شد.");

    setErrors([]);
  };

  const cell = (row: Record<string, unknown>, names: string[]) => {
    for (const name of names) {
      const entry = Object.entries(row).find(
        ([key]) => normalize(key) === normalize(name),
      );

      if (
        entry &&
        entry[1] !== undefined &&
        entry[1] !== null &&
        entry[1] !== ""
      ) {
        return entry[1];
      }
    }

    return undefined;
  };

  const importExcel = async (file?: File) => {
    if (!file) return;

    setBusy(true);
    setMessage("");
    setErrors([]);

    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(await file.arrayBuffer(), {
        type: "array",
        cellDates: true,
      });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      if (!sheet) {
        throw new Error("برگه‌ای در فایل پیدا نشد.");
      }

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
      });

      if (!rows.length) {
        throw new Error("فایل ردیفی برای ثبت ندارد.");
      }

      let saved = 0;

      const failed: string[] = [];

      for (let index = 0; index < rows.length; index++) {
        try {
          const row = rows[index];

          const supplierName = str(
            cell(row, [
              "نام تأمین‌کننده",
              "تامین‌کننده",
              "supplierName",
              "supplier",
            ]),
          );

          const rawAmount = cell(row, ["مبلغ", "جمع", "subtotal", "amount"]);

          const amount = Number(
            englishDigits(String(rawAmount ?? "")).replace(/[,\s٬]/g, ""),
          );

          const rawPayment = cell(row, [
            "روش پرداخت",
            "پرداخت",
            "paymentMethod",
            "payment",
          ]);

          const rawDate = cell(row, [
            "تاریخ ثبت",
            "تاریخ",
            "createdAt",
            "date",
          ]);

          if (!supplierName) {
            throw new Error("نام تأمین‌کننده خالی است.");
          }

          if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error("مبلغ باید عددی بزرگ‌تر از صفر باشد.");
          }

          const response = await fetch("/api/admin/purchases", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              supplierName,
              subtotal: amount,
              paymentMethod: ["چک", "چکی", "check"].some((term) =>
                normalize(rawPayment).includes(term),
              )
                ? "CHECK"
                : "CASH",
              createdAt: parseImportDate(rawDate),
            }),
          });

          if (!response.ok) {
            const body = await response.json().catch(() => null);

            throw new Error(
              body?.message || body?.error || `خطای API (${response.status})`,
            );
          }

          saved++;
        } catch (error) {
          failed.push(
            `ردیف ${index + 2}: ${
              error instanceof Error ? error.message : "خطای نامشخص"
            }`,
          );
        }
      }

      setErrors(failed);

      setMessage(
        `${fa(saved)} خرید ثبت شد` +
          (failed.length ? `؛ ${fa(failed.length)} ردیف ناموفق بود.` : "."),
      );

      if (saved > 0) {
        router.refresh();
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "خواندن فایل ناموفق بود.",
      );
    } finally {
      setBusy(false);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  };

  return (
    <main dir="rtl" className="mx-auto w-full max-w-[1600px] space-y-4">
      {/* Top navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
          <LayoutDashboard size={15} />

          <span>داشبورد</span>

          <ChevronLeft size={13} />

          <span>انبار و تأمین</span>

          <ChevronLeft size={13} />

          <strong className="text-[var(--text)]">خریدها</strong>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            نمای داده‌های ثبت‌شده
          </span>

          <button
            type="button"
            onClick={() => router.refresh()}
            className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted)] hover:text-[var(--text)]"
            title="تازه‌سازی"
          >
            <RefreshCw size={15} />
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
              مرکز کنترل خرید و تأمین کالا
              <span className="rounded-md border border-white/15 px-2 py-1 text-[10px] text-slate-300">
                PURCHASE MANAGEMENT
              </span>
            </div>

            <h1 className="text-2xl font-black sm:text-3xl">
              مدیریت جامع خریدها
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              کنترل اسناد، پایش پرداخت‌ها، بررسی خریدهای تأمین‌کنندگان و مدیریت
              داده‌های مالی در یک فضای کاری واحد.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/purchases/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#00adb5] px-4 py-3 text-sm font-extrabold text-[#10242a] transition hover:bg-[#39c6cb]"
            >
              <Plus size={17} />
              ثبت سند خرید
            </Link>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              <ArrowUpFromLine size={16} />

              {busy ? "در حال ورود..." : "ورود فایل"}
            </button>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-2 border-t border-white/10 pt-4 sm:grid-cols-4">
          <div className="rounded-lg bg-white/5 px-3 py-2">
            <p className="text-[10px] text-slate-400">کل اسناد</p>

            <p className="mt-1 text-lg font-black tabular-nums">
              {fa(purchases.length)}
            </p>
          </div>

          <div className="rounded-lg bg-white/5 px-3 py-2">
            <p className="text-[10px] text-slate-400">تأمین‌کنندگان</p>

            <p className="mt-1 text-lg font-black tabular-nums">
              {fa(suppliers.length)}
            </p>
          </div>

          <div className="rounded-lg bg-white/5 px-3 py-2">
            <p className="text-[10px] text-slate-400">پرداخت نقدی</p>

            <p className="mt-1 text-lg font-black tabular-nums">
              {fa(cashAmount)}
            </p>
          </div>

          <div className="rounded-lg bg-white/5 px-3 py-2">
            <p className="text-[10px] text-slate-400">پرداخت چکی</p>

            <p className="mt-1 text-lg font-black tabular-nums">
              {fa(checkAmount)}
            </p>
          </div>
        </div>
      </section>

      {/* KPI */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          title="ارزش کل خریدها"
          value={toman(allAmount)}
          caption="مجموع مبلغ اسناد ثبت‌شده"
          icon={<CircleDollarSign size={20} />}
          color="bg-[#00adb5]/10 text-[#00adb5]"
          foot="مبنای محاسبه: فیلد مبلغ هر سند"
        />

        <StatCard
          title="مجموع خرید نقدی"
          value={toman(cashAmount)}
          caption="مبالغ با روش پرداخت نقدی"
          icon={<Wallet size={20} />}
          color="bg-emerald-500/10 text-emerald-600"
          foot={`${fa(cashPurchases.length)} سند نقدی`}
        />

        <StatCard
          title="مجموع خرید چکی"
          value={toman(checkAmount)}
          caption="مبالغ با روش پرداخت چکی"
          icon={<CalendarDays size={20} />}
          color="bg-amber-500/10 text-amber-600"
          foot={`${fa(checkPurchases.length)} سند چکی`}
        />

        <StatCard
          title="میانگین مبلغ سند"
          value={toman(
            purchases.length ? Math.round(allAmount / purchases.length) : 0,
          )}
          caption="میانگین محاسبه‌شده از کل اسناد"
          icon={<TrendingUp size={20} />}
          color="bg-violet-500/10 text-violet-600"
          foot="محاسبه بر اساس تعداد اسناد"
        />
      </section>

      {/* Control center */}
      <section className="overflow-visible rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex flex-col justify-between gap-3 border-b border-[var(--border)] p-4 xl:flex-row xl:items-center">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[var(--bg-secondary)] text-[var(--primary)]">
              <ListFilter size={19} />
            </div>

            <div>
              <h2 className="font-black text-[var(--text)]">
                مرکز کنترل اسناد
              </h2>

              <p className="mt-1 text-[11px] text-[var(--muted)]">
                جست‌وجو، فیلتر، ورود و خروج اطلاعات
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadTemplate}
              className="btn btn-secondary inline-flex items-center gap-2"
            >
              <FileSpreadsheet size={15} />
              قالب Excel
            </button>

            <button
              type="button"
              onClick={exportExcel}
              disabled={!filtered.length}
              className="btn btn-secondary inline-flex items-center gap-2"
            >
              <Download size={15} />
              خروجی ({fa(filtered.length)})
            </button>

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
              <ChevronDown
                size={14}
                className={cn(
                  "transition-transform",
                  showAdvanced && "rotate-180",
                )}
              />
            </button>
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
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="جست‌وجو: نام تأمین‌کننده، شناسه سند..."
              className="input w-full pr-10"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                aria-label="پاک کردن جست‌وجو"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-[var(--bg-secondary)] p-1">
            {(
              [
                ["ALL", "همه اسناد"],
                ["CASH", "نقدی"],
                ["CHECK", "چکی"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setPayment(value);
                  setPage(1);
                }}
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

        {showAdvanced && (
          <div className="grid grid-cols-1 gap-3 border-t border-[var(--border)] bg-[var(--bg-secondary)]/40 p-4 sm:grid-cols-2 xl:grid-cols-4">
            <PersianDateField
              label="از تاریخ"
              value={dateFrom}
              onChange={(value) => {
                setDateFrom(value);
                setPage(1);
              }}
              placeholder="انتخاب تاریخ شروع"
            />

            <PersianDateField
              label="تا تاریخ"
              value={dateTo}
              onChange={(value) => {
                setDateTo(value);
                setPage(1);
              }}
              placeholder="انتخاب تاریخ پایان"
            />

            <label className="space-y-1.5">
              <span className="text-xs font-bold text-[var(--muted)]">
                حداقل مبلغ
              </span>

              <input
                inputMode="numeric"
                value={minAmount}
                onChange={(event) => {
                  setMinAmount(event.target.value);
                  setPage(1);
                }}
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
                onChange={(event) => {
                  setMaxAmount(event.target.value);
                  setPage(1);
                }}
                placeholder="مثلاً 50000000"
                className="input w-full"
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-2 xl:col-span-4">
              <span className="text-xs text-[var(--muted)]">
                {fa(activeFilters)} فیلتر فعال · {fa(filtered.length)} نتیجه
              </span>

              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-bold text-[var(--muted)] hover:text-[var(--danger)]"
              >
                <X size={14} />
                پاک کردن همه فیلترها
              </button>
            </div>
          </div>
        )}

        {/* Table heading */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-y border-[var(--border)] bg-[var(--bg-secondary)]/60 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--text)]">
            <ClipboardList size={16} className="text-[var(--primary)]" />
            فهرست خریدها
          </div>

          <div className="flex items-center gap-3 text-[10px] text-[var(--muted)]">
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500" />
              نقدی
            </span>

            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-amber-500" />
              چکی
            </span>

            <span className="inline-flex items-center gap-1">
              <Package size={12} />
              {fa(filtered.length)} مورد
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-right">
            <thead>
              <tr className="bg-[var(--surface)] text-[10px] font-bold text-[var(--muted)]">
                <th className="px-4 py-3">ردیف</th>

                <th className="px-4 py-3">شناسه سند</th>

                <th className="px-4 py-3">تأمین‌کننده</th>

                <th className="px-4 py-3">تاریخ ثبت</th>

                <th className="px-4 py-3">روش پرداخت</th>

                <th className="px-4 py-3 text-left">مبلغ کل</th>

                <th className="px-4 py-3 text-center">وضعیت</th>

                <th className="px-4 py-3 text-center">جزئیات</th>
              </tr>
            </thead>

            <tbody>
              {visible.map((purchase, index) => {
                const id = getId(purchase);

                const method = getPayment(purchase);

                const amount = getAmount(purchase);

                const supplier = supplierOf(purchase);

                return (
                  <tr
                    key={id || `${activePage}-${index}`}
                    className="border-t border-[var(--border)] text-xs transition hover:bg-[var(--bg-secondary)]/50"
                  >
                    <td className="px-4 py-3.5 text-[var(--muted)]">
                      {fa((activePage - 1) * PAGE_SIZE + index + 1)}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-[var(--bg-secondary)] px-2 py-1 font-mono text-[10px] font-bold text-[var(--text)]">
                        {id || "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                          <ShoppingBag size={14} />
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[220px] truncate font-bold text-[var(--text)]">
                            {supplier}
                          </p>

                          <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                            تأمین کالا
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-[var(--muted)]">
                      <div className="whitespace-nowrap">
                        {formatDate(getDateValue(purchase))}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <MethodBadge method={method} />
                    </td>

                    <td className="px-4 py-3.5 text-left">
                      <div className="font-black tabular-nums text-[var(--text)]">
                        {fa(amount)}
                      </div>

                      <div className="mt-0.5 text-[9px] text-[var(--muted)]">
                        تومان
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-600">
                        <CheckCircle2 size={12} />
                        ثبت‌شده
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      {id ? (
                        <Link
                          href={`/dashboard/purchases/${encodeURIComponent(
                            id,
                          )}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 font-bold text-[var(--text)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                        >
                          مشاهده
                          <ArrowLeft size={12} />
                        </Link>
                      ) : (
                        <span className="text-[var(--muted)]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {visible.length === 0 && (
            <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
              <div className="mb-3 grid size-12 place-items-center rounded-xl bg-[var(--bg-secondary)] text-[var(--muted)]">
                <Search size={20} />
              </div>

              <p className="font-bold text-[var(--text)]">نتیجه‌ای یافت نشد</p>

              <p className="mt-1 text-xs text-[var(--muted)]">
                عبارت جست‌وجو یا فیلترهای انتخابی را تغییر بده.
              </p>

              {activeFilters > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 text-xs font-bold text-[var(--primary)]"
                >
                  پاک‌کردن فیلترها
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="bg-[var(--bg-secondary)]/30 px-4 py-3">
            <Pagination
              page={activePage}
              totalPages={pageCount}
              onPageChange={setPage}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              disabled={busy}
              className="border-t-0 pt-0"
            />
          </div>
        )}
      </section>

      {/* Import feedback */}
      {(message || errors.length > 0) && (
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              {errors.length ? (
                <AlertCircle size={17} className="mt-0.5 text-amber-600" />
              ) : (
                <BadgeCheck size={17} className="mt-0.5 text-emerald-600" />
              )}

              <div>
                <p className="text-sm font-bold text-[var(--text)]">
                  {message}
                </p>

                {errors.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-amber-600">
                    {errors.slice(0, 10).map((error) => (
                      <li key={error}>{error}</li>
                    ))}

                    {errors.length > 10 && (
                      <li>و {fa(errors.length - 10)} خطای دیگر...</li>
                    )}
                  </ul>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setMessage("");
                setErrors([]);
              }}
              className="text-[var(--muted)] hover:text-[var(--text)]"
              aria-label="بستن پیام"
            >
              <X size={16} />
            </button>
          </div>
        </section>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(event) => importExcel(event.target.files?.[0])}
      />
    </main>
  );
}
