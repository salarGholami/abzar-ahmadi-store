"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";

type Session = { id: string; name: string; phone: string; role: string } | null;
type Settings = {
  storeName: string;
  storePhone: string;
  cardNumber: string;
  cardHolderName: string;
  paymentProvider?: string;
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
  const [coupon, setCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [shipping, setShipping] = useState<any[]>([]);
  const [shippingId, setShippingId] = useState("ship-post");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );
  const needsReceipt = !settings || settings.paymentProvider === undefined || settings.paymentProvider === "MANUAL_TRANSFER";
  const [address, setAddress] = useState({
    recipientName: "",
    phone: "",
    province: "",
    city: "",
    address: "",
    postalCode: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => setSession(j.success ? j.data : null))
      .finally(() => setChecked(true));

    fetch("/api/account/addresses")
      .then((r) => r.json())
      .then((j) => {
        const saved = j.success && Array.isArray(j.data) ? j.data[0] : null;
        if (saved) {
          setAddress((current) =>
            Object.values(current).some((value) => String(value).trim())
              ? current
              : {
                  recipientName: saved.recipientName || "",
                  phone: saved.phone || "",
                  province: saved.province || "",
                  city: saved.city || "",
                  address: saved.address || "",
                  postalCode: saved.postalCode || "",
                },
          );
        }
      })
      .catch(() => {});

    fetch("/api/shipping").then((r) => r.json()).then((j) => { if (j.success) setShipping(j.data || []); }).catch(() => {});

    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((j) => j.success && setSettings(j.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (lines.length > 0) trackEvent("CHECKOUT_STARTED", { path: "/cart" });
  }, [lines.length]);

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

  async function applyCoupon() {
    if (!coupon.trim()) return;
    const r = await fetch("/api/coupons/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: coupon, subtotal }) });
    const j = await r.json();
    if (!r.ok || !j.success) { setResult({ ok: false, message: j.error?.message || "کد تخفیف معتبر نیست." }); setCouponDiscount(0); return; }
    setCouponDiscount(Number(j.data.discount || 0)); setResult({ ok: true, message: `کد تخفیف ${j.data.code} اعمال شد.` });
  }

  async function submitOrder() {
    if (!session) return;
    if (needsReceipt && !receipt) {
      setResult({
        ok: false,
        message: "برای ثبت سفارش، تصویر فیش واریزی الزامی است.",
      });
      return;
    }

    if (Object.values(address).some((value) => !value.trim())) {
      setResult({
        ok: false,
        message: "اطلاعات کامل آدرس ارسال را وارد کنید.",
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
          receiptImage: receipt?.url ?? null,
          receipt: receipt
            ? {
                id: receipt.id,
                url: receipt.url,
                fileName: receipt.fileName,
                uploadedAt: receipt.uploadedAt,
              }
            : null,
          shippingAddress: address,
          couponCode: couponDiscount > 0 ? coupon : null,
          shippingCost: Number(shipping.find((x) => x.id === shippingId)?.price || 0),
        }),
      });

      const j = await r.json();
      if (!r.ok || !j.success) {
        throw new Error(j.error?.message || "ثبت سفارش انجام نشد.");
      }

      void fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...address, isDefault: true }),
      }).catch(() => {});

      const payment = j.data?.payment as { redirectUrl?: string | null; error?: string } | undefined;
      await clear();
      setReceipt(null);

      if (payment?.redirectUrl) {
        window.location.href = payment.redirectUrl;
        return;
      }

      setResult({
        ok: !payment?.error,
        message: payment?.error
          ? "سفارش شما ثبت شد اما اتصال به درگاه پرداخت انجام نشد. با پشتیبانی تماس بگیرید."
          : "سفارش ثبت شد و فیش برای بررسی مدیر ذخیره شد.",
      });
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
      <main className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6 lg:px-8">
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

              <div className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between"><span>جمع کالا</span><b>{subtotal.toLocaleString("fa-IR")} تومان</b></div>
                <div className="flex justify-between text-emerald-600"><span>تخفیف</span><b>{couponDiscount.toLocaleString("fa-IR")} تومان</b></div>
                <div className="flex justify-between"><span>ارسال</span><b>{Number(shipping.find((x) => x.id === shippingId)?.price || 0).toLocaleString("fa-IR")} تومان</b></div>
                <div className="flex justify-between border-t border-[var(--border)] pt-3 text-base"><span>قابل پرداخت</span><b>{Math.max(0, subtotal-couponDiscount+Number(shipping.find((x) => x.id === shippingId)?.price || 0)).toLocaleString("fa-IR")} تومان</b></div>
              </div>
              {session && <div className="mt-4 space-y-2"><div className="flex gap-2"><input className="input" value={coupon} onChange={(e)=>setCoupon(e.target.value)} placeholder="کد تخفیف"/><button type="button" onClick={()=>void applyCoupon()} className="btn btn-secondary shrink-0">اعمال</button></div></div>}
              {session && shipping.length > 0 && <div className="mt-4 rounded-2xl border border-[var(--border)] p-4"><div className="font-black">روش ارسال</div><div className="mt-3 space-y-2">{shipping.map((x)=><label key={x.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[var(--border)] p-3"><span className="flex items-center gap-2"><input type="radio" name="shipping" checked={shippingId===x.id} onChange={()=>setShippingId(x.id)}/><span><b className="block text-sm">{x.name}</b><small className="text-[var(--muted)]">{x.estimatedDays}</small></span></span><b>{Number(x.price).toLocaleString("fa-IR")} تومان</b></label>)}</div></div>}

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
                  <div className="rounded-2xl border border-[var(--border)] p-4">
                    <div className="font-black">آدرس ارسال</div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {[
                        ["recipientName", "نام گیرنده"],
                        ["phone", "شماره موبایل"],
                        ["province", "استان"],
                        ["city", "شهر"],
                        ["postalCode", "کد پستی"],
                      ].map(([key, label]) => (
                        <input
                          key={key}
                          value={address[key as keyof typeof address]}
                          onChange={(e) => setAddress((current) => ({ ...current, [key]: e.target.value }))}
                          placeholder={label}
                          className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none focus:border-[var(--primary)]"
                        />
                      ))}
                      <textarea
                        value={address.address}
                        onChange={(e) => setAddress((current) => ({ ...current, address: e.target.value }))}
                        placeholder="آدرس کامل"
                        rows={3}
                        className="sm:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                  </div>

                  {needsReceipt && settings?.cardNumber && (
                    <div className="rounded-xl bg-[var(--surface-2)] p-3 text-xs leading-6">
                      <div>
                        مبلغ را واریز کرده و تصویر فیش را بارگذاری کنید.
                      </div>
                      <div className="mt-1 font-black">
                        {settings.cardNumber} — {settings.cardHolderName}
                      </div>
                    </div>
                  )}

                  <label className={`${needsReceipt ? "block" : "hidden"} cursor-pointer rounded-2xl border border-dashed border-[var(--border)] p-4`}>
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
                    disabled={submitting || uploading || (needsReceipt && !receipt)}
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
