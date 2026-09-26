"use client";

import Link from "next/link";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Clock3,
  CreditCard,
  Package,
  Receipt,
  RefreshCw,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Sale } from "@/lib/types";

type LowStockItem = {
  title: string;
  stock: number;
  sku: string;
};

type SummaryResponse = {
  success?: boolean;
  data?: {
    lowStock?: LowStockItem[];
  };
};

type SalesResponse = {
  success?: boolean;
  data?: Sale[];
};

type NotificationType = "stock" | "payment" | "sale";

type DashboardNotification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  href: string;
};

type FilterType = "all" | NotificationType;

const READ_STORAGE_KEY = "abzarino-dashboard-notifications-read";

function formatMoney(value: number) {
  return `${Number(value || 0).toLocaleString("fa-IR")} تومان`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "تاریخ نامشخص";
  }

  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getIcon(type: NotificationType) {
  switch (type) {
    case "stock":
      return Package;

    case "payment":
      return CreditCard;

    case "sale":
      return Receipt;
  }
}

function loadReadIds(): string[] {
  try {
    const stored = window.localStorage.getItem(READ_STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

function saveReadIds(ids: string[]) {
  try {
    window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore localStorage errors.
  }
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);

  const [filter, setFilter] = useState<FilterType>("all");

  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);

  const [sales, setSales] = useState<Sale[]>([]);

  const [readIds, setReadIds] = useState<string[]>([]);

  const [hydrated, setHydrated] = useState(false);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  /*
   * ----------------------------------------
   * READ STATE
   * ----------------------------------------
   */

  useEffect(() => {
    setReadIds(loadReadIds());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveReadIds(readIds);
  }, [readIds, hydrated]);

  /*
   * ----------------------------------------
   * FETCH DATA
   * ----------------------------------------
   */

  const loadNotifications = useCallback(async () => {
    try {
      const [summaryResponse, salesResponse] = await Promise.all([
        fetch("/api/admin/reports/summary", {
          cache: "no-store",
        }),

        fetch("/api/admin/sales", {
          cache: "no-store",
        }),
      ]);

      if (summaryResponse.ok) {
        const summary = (await summaryResponse.json()) as SummaryResponse;

        const stock = summary.data?.lowStock;

        setLowStock(Array.isArray(stock) ? stock : []);
      }

      if (salesResponse.ok) {
        const salesPayload = (await salesResponse.json()) as SalesResponse;

        const salesData = salesPayload.data;

        setSales(Array.isArray(salesData) ? salesData : []);
      }
    } catch {
      /*
       * اگر API خطا داد، اطلاعات قبلی
       * پاک نمی‌شوند.
       */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  /*
   * ----------------------------------------
   * ESCAPE
   * ----------------------------------------
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  /*
   * ----------------------------------------
   * CLICK OUTSIDE
   * ----------------------------------------
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  /*
   * ----------------------------------------
   * NOTIFICATIONS
   * ----------------------------------------
   */

  const notifications = useMemo<DashboardNotification[]>(() => {
    const result: DashboardNotification[] = [];

    /*
     * Low stock
     */
    for (const product of lowStock) {
      result.push({
        id: `stock:${product.sku}`,
        type: "stock",
        title: "موجودی محصول کم است",
        description: `${product.title} فقط ${Number(
          product.stock || 0,
        ).toLocaleString("fa-IR")} عدد موجودی دارد.`,
        createdAt: "2099-01-01T00:00:00.000Z",
        href: "/dashboard/products",
      });
    }

    /*
     * Sales
     */
    for (const sale of sales) {
      if (sale.paymentStatus === "PENDING_TRANSFER") {
        result.push({
          id: `payment:${sale.id}`,
          type: "payment",
          title: "پرداخت در انتظار تأیید",
          description: `${sale.buyerName || "مشتری"} — ${formatMoney(
            Number(sale.netAmount || 0),
          )}`,
          createdAt: sale.createdAt,
          href: "/dashboard/sales",
        });
      }

      if (sale.paymentStatus !== "CANCELED") {
        result.push({
          id: `sale:${sale.id}`,
          type: "sale",
          title: "فروش جدید ثبت شد",
          description: `${sale.buyerName || "مشتری"} — ${formatMoney(
            Number(sale.netAmount || 0),
          )}`,
          createdAt: sale.createdAt,
          href: "/dashboard/sales",
        });
      }
    }

    return result
      .sort((a, b) => {
        const first = new Date(a.createdAt).getTime();

        const second = new Date(b.createdAt).getTime();

        return second - first;
      })
      .slice(0, 50);
  }, [lowStock, sales]);

  /*
   * ----------------------------------------
   * UNREAD
   * ----------------------------------------
   */

  const unreadNotifications = useMemo(() => {
    if (!hydrated) {
      return [];
    }

    const readSet = new Set(readIds);

    return notifications.filter(
      (notification) => !readSet.has(notification.id),
    );
  }, [notifications, readIds, hydrated]);

  /*
   * ----------------------------------------
   * FILTER
   * ----------------------------------------
   */

  const filteredNotifications = useMemo(() => {
    if (filter === "all") {
      return unreadNotifications.slice(0, 10);
    }

    return unreadNotifications
      .filter((notification) => notification.type === filter)
      .slice(0, 10);
  }, [filter, unreadNotifications]);

  /*
   * ----------------------------------------
   * COUNTS
   * ----------------------------------------
   */

  const counts = useMemo(
    () => ({
      all: unreadNotifications.length,

      sale: unreadNotifications.filter((item) => item.type === "sale").length,

      payment: unreadNotifications.filter((item) => item.type === "payment")
        .length,

      stock: unreadNotifications.filter((item) => item.type === "stock").length,
    }),
    [unreadNotifications],
  );

  /*
   * ----------------------------------------
   * ACTIONS
   * ----------------------------------------
   */

  function markAsRead(id: string) {
    setReadIds((current) => {
      if (current.includes(id)) {
        return current;
      }

      return [...current, id];
    });
  }

  function markAllAsRead() {
    setReadIds((current) => {
      const next = new Set(current);

      for (const notification of notifications) {
        next.add(notification.id);
      }

      return Array.from(next);
    });
  }

  async function handleRefresh() {
    if (refreshing) {
      return;
    }

    try {
      setRefreshing(true);

      await loadNotifications();
    } finally {
      setRefreshing(false);
    }
  }

  /*
   * ----------------------------------------
   * FILTERS
   * ----------------------------------------
   */

  const filters: Array<{
    id: FilterType;
    label: string;
    count: number;
  }> = [
    {
      id: "all",
      label: "همه",
      count: counts.all,
    },
    {
      id: "sale",
      label: "فروش",
      count: counts.sale,
    },
    {
      id: "payment",
      label: "پرداخت",
      count: counts.payment,
    },
    {
      id: "stock",
      label: "موجودی",
      count: counts.stock,
    },
  ];

  /*
   * ----------------------------------------
   * UI
   * ----------------------------------------
   */

  return (
    <div ref={containerRef} dir="rtl" className="relative z-[300]">
      {/* NOTIFICATION BUTTON */}

      <button
        type="button"
        aria-label="اعلان‌ها"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        className="relative z-[310] flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] outline-none transition-all duration-200 hover:border-[var(--primary)]/40 hover:bg-[var(--surface-2)] hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 active:scale-95"
      >
        {counts.all > 0 ? (
          <BellRing className="h-5 w-5" />
        ) : (
          <Bell className="h-5 w-5" />
        )}

        {counts.all > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-[var(--bg)] bg-[var(--danger)] px-1 text-[10px] font-black text-white">
            {counts.all > 99 ? "۹۹+" : counts.all.toLocaleString("fa-IR")}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* BACKDROP */}

          <button
            type="button"
            aria-label="بستن اعلان‌ها"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[280] cursor-default bg-black/20 md:bg-transparent"
          />

          {/* PANEL */}

          <section
            role="dialog"
            aria-label="مرکز اعلان‌ها"
            onClick={(event) => event.stopPropagation()}
            className="fixed inset-x-3 bottom-3 top-20 z-[350] flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_25px_80px_rgba(0,0,0,0.25)] md:absolute md:left-0 md:right-auto md:top-[calc(100%+12px)] md:bottom-auto md:h-[580px] md:w-[430px]"
          >
            {/* PANEL HEADER */}

            <header className="shrink-0 border-b border-[var(--border)] bg-[var(--surface)]">
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                    {counts.all > 0 ? (
                      <BellRing className="h-5 w-5" />
                    ) : (
                      <Bell className="h-5 w-5" />
                    )}
                  </div>

                  <div>
                    <h2 className="text-sm font-black text-[var(--text)]">
                      مرکز اعلان‌ها
                    </h2>

                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {loading
                        ? "در حال دریافت..."
                        : counts.all > 0
                          ? `${counts.all.toLocaleString("fa-IR")} اعلان جدید`
                          : "اعلان جدیدی ندارید"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => void handleRefresh()}
                    disabled={refreshing}
                    aria-label="بروزرسانی"
                    className="grid size-9 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--primary)] disabled:opacity-40"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="بستن"
                    className="grid size-9 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* FILTERS */}

              <div className="grid grid-cols-4 gap-1 px-3 pb-3">
                {filters.map((item) => {
                  const active = filter === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFilter(item.id)}
                      className={`rounded-lg px-2 py-2 text-xs font-bold transition ${
                        active
                          ? "bg-[var(--primary)] text-white"
                          : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)]"
                      }`}
                    >
                      {item.label}

                      <span className="mr-1">
                        {item.count.toLocaleString("fa-IR")}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* MARK ALL */}

              {counts.all > 0 && (
                <div className="border-t border-[var(--border)] px-3 py-2">
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-[var(--primary)] transition hover:bg-[var(--primary)]/10"
                  >
                    <CheckCheck className="h-4 w-4" />
                    خواندن همه
                  </button>
                </div>
              )}
            </header>

            {/* BODY */}

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {loading ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center">
                  <RefreshCw className="h-7 w-7 animate-spin text-[var(--primary)]" />

                  <p className="mt-4 text-xs font-bold text-[var(--muted)]">
                    در حال دریافت اعلان‌ها...
                  </p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                  <div className="grid size-16 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                    <CheckCheck className="h-8 w-8" />
                  </div>

                  <h3 className="mt-4 text-sm font-black text-[var(--text)]">
                    اعلان جدیدی نیست
                  </h3>

                  <p className="mt-2 max-w-[270px] text-xs leading-6 text-[var(--muted)]">
                    در حال حاضر اعلان خوانده‌نشده‌ای برای نمایش وجود ندارد.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => {
                    const Icon = getIcon(notification.type);

                    return (
                      <article
                        key={notification.id}
                        className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 transition hover:border-[var(--primary)]/30"
                      >
                        <div className="flex gap-3">
                          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="text-xs font-black text-[var(--text)]">
                                  {notification.title}
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                                  {notification.description}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => markAsRead(notification.id)}
                                aria-label="خوانده شد"
                                className="grid size-7 shrink-0 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                              <span className="flex items-center gap-1 text-[10px] text-[var(--muted)]">
                                <Clock3 className="h-3 w-3" />

                                {formatDate(notification.createdAt)}
                              </span>

                              <Link
                                href={notification.href}
                                onClick={() => markAsRead(notification.id)}
                                className="mr-auto rounded-lg px-2.5 py-1.5 text-[10px] font-black text-[var(--primary)] transition hover:bg-[var(--primary)]/10"
                              >
                                مشاهده
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {/* FOOTER */}

            <footer className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <p className="text-center text-[10px] text-[var(--muted)]">
                اعلان‌های خوانده‌شده دیگر نمایش داده نمی‌شوند.
              </p>
            </footer>
          </section>
        </>
      )}
    </div>
  );
}
