"use client";

import {
  Check,
  CheckCircle2,
  Clipboard,
  Clock3,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import type { ShippingStatus } from "@/lib/types";

type OrderTrackingProps = {
  shippingStatus: ShippingStatus;
  trackingCode?: string | null;
  shippingCompany?: string | null;
  shippedAt?: string | null;
  trackingUrl?: string | null;
};

const steps: {
  status: ShippingStatus;
  label: string;
  icon: typeof Package;
}[] = [
  {
    status: "PENDING",
    label: "ثبت سفارش",
    icon: CheckCircle2,
  },
  {
    status: "PROCESSING",
    label: "در حال پردازش",
    icon: Package,
  },
  {
    status: "SHIPPED",
    label: "ارسال شده",
    icon: Truck,
  },
  {
    status: "DELIVERED",
    label: "تحویل شده",
    icon: Check,
  },
];

const order: Record<ShippingStatus, number> = {
  PENDING: 0,
  PROCESSING: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  CANCELED: -1,
};

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

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

export default function OrderTracking({
  shippingStatus,
  trackingCode,
  shippingCompany,
  shippedAt,
  trackingUrl,
}: OrderTrackingProps) {
  const [copied, setCopied] = useState(false);

  async function copyTrackingCode() {
    if (!trackingCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(trackingCode);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Clipboard can be unavailable in some browsers.
    }
  }

  if (shippingStatus === "CANCELED") {
    return (
      <section className="card p-5">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-red-50
              text-red-600
              dark:bg-red-950/30
              dark:text-red-400
            "
          >
            <XCircle className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-black text-[var(--text)]">وضعیت سفارش</h2>

            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              این سفارش لغو شده است.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const currentIndex = order[shippingStatus];

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
            <h2 className="font-black text-[var(--text)]">وضعیت ارسال سفارش</h2>

            <p className="mt-1 text-xs text-[var(--muted)]">
              آخرین وضعیت مرسوله شما
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-[620px] items-start">
            {steps.map((step, index) => {
              const completed = currentIndex >= index;

              const active = currentIndex === index;

              const Icon = step.icon;

              return (
                <div
                  key={step.status}
                  className="relative flex flex-1 flex-col items-center"
                >
                  {index > 0 && (
                    <div
                      className={`
                        absolute
                        right-1/2
                        top-5
                        h-0.5
                        w-full
                        -translate-y-1/2
                        ${
                          currentIndex >= index
                            ? "bg-[var(--primary)]"
                            : "bg-[var(--border)]"
                        }
                      `}
                    />
                  )}

                  <div
                    className={`
                      relative
                      z-10
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      border-2
                      ${
                        completed
                          ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                          : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
                      }
                      ${active ? "ring-4 ring-[var(--primary-light)]" : ""}
                    `}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <span
                    className={`
                      mt-3
                      text-xs
                      font-bold
                      ${
                        completed
                          ? "text-[var(--primary)]"
                          : "text-[var(--muted)]"
                      }
                    `}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {trackingCode && (
          <div className="mt-6 rounded-2xl bg-[var(--surface-2)] p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-[var(--muted)]">کد رهگیری</p>

                <p
                  className="
                    mt-1
                    break-all
                    font-black
                    tracking-wider
                    text-[var(--text)]
                  "
                  dir="ltr"
                >
                  {trackingCode}
                </p>

                {shippingCompany && (
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    شرکت حمل: {shippingCompany}
                  </p>
                )}

                {shippedAt && (
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    تاریخ ارسال: {formatDate(shippedAt)}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => void copyTrackingCode()}
                  className="btn btn-secondary"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}

                  {copied ? "کپی شد" : "کپی کد"}
                </button>

                {trackingUrl && (
                  <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                  >
                    پیگیری مرسوله
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {!trackingCode && shippingStatus !== "DELIVERED" && (
          <div
            className="
                mt-6
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-[var(--border)]
                bg-[var(--surface-2)]
                p-4
                text-sm
                text-[var(--muted)]
              "
          >
            <Clock3 className="h-5 w-5 shrink-0" />
            کد رهگیری پس از ارسال سفارش ثبت خواهد شد.
          </div>
        )}
      </div>
    </section>
  );
}
