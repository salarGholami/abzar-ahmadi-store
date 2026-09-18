"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import StoreHeader from "@/components/layout/StoreHeader";
import { useCart } from "@/lib/cart-context";

type Session = { id: string; name: string; phone: string; role: string } | null;
type Settings = {
  storeName: string;
  storePhone: string;
  cardNumber: string;
  cardHolderName: string;
};
type Receipt = {
  id: string;
  url: string;
  path: string;
  fileName: string;
  uploadedAt: string;
};

export default function Cart() {
  const { lines, setQty, remove, clear, subtotal } = useCart();
  const [session, setSession] = useState<Session>(null);
  const [checked, setChecked] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => setSession(j.success ? j.data : null))
      .finally(() => setChecked(true));

    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((j) => j.success && setSettings(j.data))
      .catch(() => {});
  }, []);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget; // ذخیره قبل از await
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setResult({
        ok: false,
        message: "حجم رسید نباید بیشتر از ۵ مگابایت باشد.",
      });
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/sales/receipt", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok || !j.success) {
        throw new Error(j.error?.message || "آپلود رسید انجام نشد.");
      }
      setReceipt({
        id: crypto.randomUUID(),
        ...j.data,
        uploadedAt: new Date().toISOString(),
      });
    } catch (err) {
      setResult({
        ok: false,
        message: err instanceof Error ? err.message : "آپلود رسید انجام نشد.",
      });
    } finally {
      setUploading(false);
      input.value = ""; // استفاده از input ذخیره‌شده
    }
  }

  async function submitOrder() {
    if (!session) return;
    if (!receipt) {
      setResult({
        ok: false,
        message: "برای ثبت سفارش، تصویر فیش واریزی الزامی است.",
      });
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const r = await fetch("/api/sales/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saleId: crypto.randomUUID(),
          items: lines.map((l) => ({
            productId: l.productId,
            quantity: l.qty,
          })),
          receiptImage: receipt.url,
          receipt: {
            id: receipt.id,
            url: receipt.url,
            fileName: receipt.fileName,
            uploadedAt: receipt.uploadedAt,
          },
        }),
      });

      const j = await r.json();
      if (!r.ok || !j.success) {
        throw new Error(j.error?.message || "ثبت سفارش انجام نشد.");
      }

      setResult({
        ok: true,
        message: "سفارش ثبت شد و فیش برای بررسی مدیر ذخیره شد.",
      });
      clear();
      setReceipt(null);
    } catch (err) {
      setResult({
        ok: false,
        message: err instanceof Error ? err.message : "خطا در ارتباط با سرور.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-[1100px] px-4 py-14 lg:px-6">
        <h1 className="text-3xl font-black">سبد خرید</h1>

        {lines.length === 0 && !result ? (
          <div className="mt-8 card p-10 text-center">
            <div className="text-5xl">🛒</div>
            <h2 className="mt-4 text-xl font-black">سبد خرید شما خالی است</h2>
            <Link href="/products" className="btn btn-primary mt-6">
              مشاهده محصولات
            </Link>
          </div>
        ) : result && lines.length === 0 ? (
          <div className="mt-8 card p-10 text-center">
            <div className="text-5xl">{result.ok ? "✅" : "⚠️"}</div>
            <h2 className="mt-4 text-xl font-black">
              {result.ok ? "سفارش ثبت شد" : "ثبت سفارش ناموفق بود"}
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{result.message}</p>
            <Link href="/products" className="btn btn-primary mt-6">
              بازگشت به فروشگاه
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_360px]">
            {/* لیست محصولات */}
            <div className="card divide-y divide-[var(--border)] overflow-hidden">
              {lines.map((l) => (
                <div key={l.productId} className="flex items-center gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold">{l.title}</div>
                    <div className="mt-1 text-xs text-[var(--muted)]">
                      {l.sku}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setQty(l.productId, l.qty - 1)}
                      className="grid size-7 place-items-center rounded-lg border border-[var(--border)]"
                    >
                      <Minus size={13} />
                    </button>
                    <b className="w-7 text-center">{l.qty}</b>
                    <button
                      type="button"
                      onClick={() => setQty(l.productId, l.qty + 1)}
                      className="grid size-7 place-items-center rounded-lg border border-[var(--border)]"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <b className="w-28 text-left">
                    {(l.unitPrice * l.qty).toLocaleString("fa-IR")} تومان
                  </b>

                  <button
                    type="button"
                    onClick={() => remove(l.productId)}
                    className="text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* خلاصه و ثبت سفارش */}
            <div className="card h-fit p-5">
              <h3 className="font-black">تکمیل خرید</h3>

              <div className="mt-5 flex justify-between text-sm">
                <span>قابل پرداخت</span>
                <b>{subtotal.toLocaleString("fa-IR")} تومان</b>
              </div>

              {!checked ? null : !session ? (
                <div className="mt-5 rounded-xl bg-[var(--surface-2)] p-3 text-sm">
                  برای تکمیل خرید وارد حساب شوید.
                  <Link
                    href="/account?next=/cart"
                    className="btn btn-primary mt-3 w-full"
                  >
                    ورود / ثبت‌نام
                  </Link>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {settings?.cardNumber && (
                    <div className="rounded-xl bg-[var(--surface-2)] p-3 text-xs leading-6">
                      <div>
                        مبلغ را واریز کرده و تصویر فیش را بارگذاری کنید.
                      </div>
                      <div className="mt-1 font-black">
                        {settings.cardNumber} — {settings.cardHolderName}
                      </div>
                    </div>
                  )}

                  <label className="block cursor-pointer rounded-2xl border border-dashed border-[var(--border)] p-4">
                    <div className="flex items-center gap-2 font-black">
                      <Upload size={17} />
                      {uploading
                        ? "در حال آپلود..."
                        : receipt
                          ? "فیش واریزی آماده است ✓"
                          : "آپلود فیش واریزی *"}
                    </div>
                    <div className="mt-1 text-xs text-[var(--muted)]">
                      JPG، PNG، WEBP یا GIF · حداکثر ۵MB
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={onFile}
                    />
                  </label>

                  {receipt && (
                    <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
                      <div className="relative aspect-[4/3]">
                        <img
                          src={receipt.url}
                          alt="پیش‌نمایش فیش واریزی"
                          className="size-full object-contain bg-[var(--surface-2)]"
                        />
                      </div>
                      <div className="flex items-center gap-2 p-3 text-xs font-bold text-[var(--success)]">
                        <CheckCircle2 size={15} />
                        فیش در Backend ذخیره شد
                      </div>
                    </div>
                  )}

                  {result && !result.ok && (
                    <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">
                      {result.message}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={submitting || uploading || !receipt}
                    onClick={() => void submitOrder()}
                    className="btn btn-primary w-full disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        در حال ثبت سفارش...
                      </>
                    ) : (
                      "ثبت سفارش"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
