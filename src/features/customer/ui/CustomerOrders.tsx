"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, RefreshCw } from "lucide-react";

type Order = {
  id: string;
  netAmount?: number;
  paymentStatus?: string;
  shippingStatus?: string;
  createdAt?: string;
};

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/account/orders", { cache: "no-store" });
      const j = await r.json();
      if (!j.success)
        throw new Error(j.error?.message || "خطا در دریافت سفارش‌ها");
      setOrders(Array.isArray(j.data) ? j.data : []);
    } catch (e: any) {
      setError(e?.message || "خطا");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black">سفارش‌های من</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            لیست سفارش‌های ثبت‌شده
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="btn btn-secondary"
        >
          <RefreshCw size={16} />
          بروزرسانی
        </button>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-sm text-[var(--muted)]">
          در حال بارگذاری...
        </div>
      ) : error ? (
        <div className="card p-8 text-center text-sm text-red-600">{error}</div>
      ) : orders.length === 0 ? (
        <div className="card p-8 text-center text-sm text-[var(--muted)]">
          <Package className="mx-auto mb-3 opacity-50" size={32} />
          سفارشی ثبت نشده است.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/customer/orders/${o.id}`}
              className="card flex items-center justify-between gap-4 p-4 transition hover:border-[var(--primary)]"
            >
              <div>
                <div className="text-sm font-bold">
                  سفارش #{String(o.id).slice(0, 8)}
                </div>
                <div className="mt-1 text-xs text-[var(--muted)]">
                  {o.createdAt
                    ? new Date(o.createdAt).toLocaleString("fa-IR")
                    : "—"}
                </div>
              </div>
              <div className="text-left text-sm font-black">
                {(o.netAmount ?? 0).toLocaleString("fa-IR")} تومان
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
