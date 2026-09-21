"use client";

import {
  Check,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  Loader2,
  Package,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { Sale, ShippingMethod, ShippingStatus } from "@/lib/types";
import { useUpdateShipping } from "@/features/admin/hooks";

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

type ApiResult<T> = ApiSuccess<T> | ApiFailure;

type ShippingManagerProps = {
  sale: Sale;
  onUpdated?: (sale: Sale) => void;
};

const statusOptions: {
  value: ShippingStatus;
  label: string;
}[] = [
  {
    value: "PENDING",
    label: "در انتظار ارسال",
  },
  {
    value: "PROCESSING",
    label: "در حال آماده‌سازی",
  },
  {
    value: "SHIPPED",
    label: "ارسال شده",
  },
  {
    value: "DELIVERED",
    label: "تحویل شده",
  },
  {
    value: "CANCELED",
    label: "لغو شده",
  },
];

const methodOptions: {
  value: ShippingMethod;
  label: string;
}[] = [
  {
    value: "POST",
    label: "پست",
  },
  {
    value: "TIPAX",
    label: "تیپاکس",
  },
  {
    value: "SNAPP",
    label: "اسنپ",
  },
  {
    value: "COURIER",
    label: "پیک",
  },
  {
    value: "PICKUP",
    label: "تحویل حضوری",
  },
  {
    value: "OTHER",
    label: "سایر",
  },
];

function isApiFailure<T>(result: ApiResult<T>): result is ApiFailure {
  return result.success === false;
}

async function readApi<T>(response: Response): Promise<ApiResult<T>> {
  try {
    return (await response.json()) as ApiResult<T>;
  } catch {
    return {
      success: false,
      error: {
        code: "INVALID_RESPONSE",
        message: "پاسخ نامعتبر از سرور دریافت شد.",
      },
    };
  }
}

export default function ShippingManager({
  sale,
  onUpdated,
}: ShippingManagerProps) {
  const [shippingStatus, setShippingStatus] = useState<ShippingStatus>(
    sale.shippingStatus ?? "PENDING",
  );

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | "">(
    sale.shippingMethod ?? "",
  );

  const [trackingCode, setTrackingCode] = useState(sale.trackingCode ?? "");

  const [shippingCompany, setShippingCompany] = useState(
    sale.shippingCompany ?? "",
  );

  const [trackingUrl, setTrackingUrl] = useState(sale.trackingUrl ?? "");

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);
  const updateShipping = useUpdateShipping();

  useEffect(() => {
    setShippingStatus(sale.shippingStatus ?? "PENDING");

    setShippingMethod(sale.shippingMethod ?? "");

    setTrackingCode(sale.trackingCode ?? "");

    setShippingCompany(sale.shippingCompany ?? "");

    setTrackingUrl(sale.trackingUrl ?? "");
  }, [sale]);

  async function save() {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const result = await updateShipping.mutateAsync({
        saleId: sale.id,
        payload: {
          shippingStatus,
          shippingMethod: shippingMethod || null,
          trackingCode: trackingCode.trim() || null,
          shippingCompany: shippingCompany.trim() || null,
          trackingUrl: trackingUrl.trim() || null,
        },
      });
      setMessage("اطلاعات ارسال با موفقیت ذخیره شد.");
      onUpdated?.(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "خطا در ذخیره اطلاعات ارسال.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function copyTrackingCode() {
    if (!trackingCode.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(trackingCode.trim());

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch {
      setError("کپی کد رهگیری انجام نشد.");
    }
  }

  return (
    <section className="card overflow-hidden">
      <div className="border-b border-[var(--border)] p-5">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-[var(--primary-light)]
              text-[var(--primary)]
            "
          >
            <Truck className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-black text-[var(--text)]">مدیریت ارسال</h2>

            <p className="mt-1 text-xs text-[var(--muted)]">
              اطلاعات ارسال و کد رهگیری سفارش
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {error && (
          <div
            className="
              rounded-xl
              border
              border-red-200
              bg-red-50
              p-3
              text-sm
              text-red-700
              dark:border-red-900
              dark:bg-red-950/30
              dark:text-red-300
            "
          >
            {error}
          </div>
        )}

        {message && (
          <div
            className="
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-emerald-200
              bg-emerald-50
              p-3
              text-sm
              text-emerald-700
              dark:border-emerald-900
              dark:bg-emerald-950/30
              dark:text-emerald-300
            "
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />

            {message}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field-label">
            وضعیت ارسال
            <select
              value={shippingStatus}
              onChange={(event) =>
                setShippingStatus(event.target.value as ShippingStatus)
              }
              className="input mt-2 w-full"
              disabled={saving}
            >
              {statusOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field-label">
            روش ارسال
            <select
              value={shippingMethod}
              onChange={(event) =>
                setShippingMethod(event.target.value as ShippingMethod | "")
              }
              className="input mt-2 w-full"
              disabled={saving}
            >
              <option value="">انتخاب نشده</option>

              {methodOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field-label">
          شرکت حمل
          <input
            value={shippingCompany}
            onChange={(event) => setShippingCompany(event.target.value)}
            placeholder="مثلاً اداره پست"
            className="input mt-2 w-full"
            disabled={saving}
          />
        </label>

        <div>
          <label className="field-label">کد رهگیری</label>

          <div className="mt-2 flex gap-2">
            <input
              value={trackingCode}
              onChange={(event) => setTrackingCode(event.target.value)}
              placeholder="کد رهگیری مرسوله"
              className="input min-w-0 flex-1"
              disabled={saving}
              dir="ltr"
            />

            <button
              type="button"
              onClick={() => void copyTrackingCode()}
              disabled={saving || !trackingCode.trim()}
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-[var(--border)]
                bg-[var(--surface)]
                text-[var(--muted)]
                transition
                hover:border-[var(--primary)]
                hover:text-[var(--primary)]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              aria-label="کپی کد رهگیری"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Clipboard className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <label className="field-label">
          لینک پیگیری
          <input
            value={trackingUrl}
            onChange={(event) => setTrackingUrl(event.target.value)}
            placeholder="https://..."
            className="input mt-2 w-full"
            disabled={saving}
            dir="ltr"
          />
        </label>

        {sale.shippedAt && (
          <div
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-[var(--surface-2)]
              p-3
              text-sm
              text-[var(--muted)]
            "
          >
            <Package className="h-4 w-4" />
            تاریخ ارسال ثبت شده است.
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          {trackingUrl && (
            <a
              href={trackingUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
            >
              <ExternalLink className="h-4 w-4" />
              مشاهده پیگیری
            </a>
          )}

          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="btn btn-primary sm:mr-auto"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}

            {saving ? "در حال ذخیره..." : "ذخیره اطلاعات ارسال"}
          </button>
        </div>
      </div>
    </section>
  );
}
