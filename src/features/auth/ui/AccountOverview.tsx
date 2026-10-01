"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FileImage, LogOut, ShieldCheck } from "lucide-react";
import type { Session } from "@/lib/auth";
import type { Sale } from "@/lib/types";

const labels: Record<string, string> = {
  PAID: "پرداخت تأیید شد",
  PENDING_TRANSFER: "در انتظار بررسی فیش",
  PENDING_PAYMENT: "در انتظار پرداخت آنلاین",
  PARTIAL: "پرداخت جزئی",
  CANCELED: "لغو شده",
};
export default function AccountOverview({
  session,
}: {
  session: Pick<Session, "id" | "name" | "phone" | "role">;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Sale[]>([]);
  const [paymentNotice, setPaymentNotice] = useState<{ ok: boolean; text: string } | null>(null);
  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("payment");
    if (status === "success") setPaymentNotice({ ok: true, text: "پرداخت شما با موفقیت تأیید شد." });
    else if (status === "failed" || status === "error" || status === "invalid") {
      setPaymentNotice({ ok: false, text: "پرداخت ناموفق بود یا لغو شد. در صورت کسر وجه با پشتیبانی تماس بگیرید." });
    }
  }, []);
  useEffect(() => {
    if (session.role !== "CUSTOMER") return;
    fetch("/api/account/orders", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => j.success && setOrders(j.data))
      .catch(() => {});
  }, [session.role]);
  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <div>
      <div className="text-sm font-bold text-[var(--primary)]">حساب کاربری</div>
      <h1 className="mt-2 text-2xl font-black">{session.name}</h1>
      <div className="mt-1 text-sm text-[var(--muted)]">{session.phone}</div>
      {paymentNotice && (
        <div
          role="status"
          className={`mt-4 rounded-xl p-3 text-xs font-bold ${paymentNotice.ok ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"}`}
        >
          {paymentNotice.text}
        </div>
      )}
      <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-2 text-xs font-bold text-[var(--primary)]">
        <ShieldCheck size={15} />
        {session.role === "ADMIN" ? "مدیر سیستم" : "مشتری"}
      </div>
      {session.role === "CUSTOMER" && (
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-black">سفارش‌های من</h2>
            <span className="text-xs text-[var(--muted)]">
              {orders.length.toLocaleString("fa-IR")} سفارش
            </span>
          </div>
          {!orders.length ? (
            <div className="mt-3 rounded-2xl bg-[var(--surface-2)] p-5 text-sm text-[var(--muted)]">
              هنوز سفارشی ثبت نکرده‌اید.
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-2xl border border-[var(--border)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-black">
                        سفارش #{order.id.slice(0, 8)}
                      </div>
                      <div className="mt-1 text-xs text-[var(--muted)]">
                        {new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
                          dateStyle: "medium",
                          timeZone: "Asia/Tehran",
                        }).format(new Date(order.createdAt))}
                      </div>
                    </div>
                    <span className="badge bg-[var(--surface-2)]">
                      {labels[order.paymentStatus] || order.paymentStatus}
                    </span>
                  </div>
                  <div className="mt-4 text-sm font-black">
                    {Number(order.netAmount).toLocaleString("fa-IR")} تومان
                  </div>
                  {order.receiptImage && (
                    <a
                      href={order.receiptImage}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[var(--primary)]"
                    >
                      <FileImage size={14} />
                      مشاهده فیش واریزی
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <a href="/customer/addresses" className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm font-bold transition hover:border-[var(--primary)]">آدرس‌های من</a>
        <a href="/customer/wishlist" className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm font-bold transition hover:border-[var(--primary)]">علاقه‌مندی‌ها</a>
        <a href="/customer/orders" className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm font-bold transition hover:border-[var(--primary)]">سفارش‌های من</a>
        <a href="/customer/notifications" className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm font-bold transition hover:border-[var(--primary)]">اعلان‌ها</a>
      </div>
      <div className="mt-7 space-y-2">
        {session.role === "SUPPLIER" && (
          <button
            onClick={() => router.push("/supplier")}
            className="btn btn-primary w-full"
          >
            ورود به پنل تأمین‌کننده
          </button>
        )}
        {session.role === "ADMIN" && (
          <button
            onClick={() => router.push("/dashboard")}
            className="btn btn-primary w-full"
            type="button"
          >
            ورود به پنل مدیریت
          </button>
        )}
        <button
          onClick={() => void logout()}
          disabled={loading}
          className="btn btn-danger w-full disabled:opacity-60"
          type="button"
        >
          <LogOut size={17} />
          {loading ? "در حال خروج..." : "خروج از حساب"}
        </button>
      </div>
    </div>
  );
}
