"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, Upload } from "lucide-react";
import StoreHeader from "@/components/layout/StoreHeader";
import { useCart } from "@/lib/cart-context";

type Session = { name: string; phone: string; role: string } | null;
type Settings = { storeName: string; storePhone: string; cardNumber: string; cardHolderName: string };

export default function Cart() {
  const { lines, setQty, remove, clear, subtotal } = useCart();
  const [session, setSession] = useState<Session>(null);
  const [checkedSession, setCheckedSession] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((j) => setSession(j.success ? j.data : null)).finally(() => setCheckedSession(true));
    fetch("/api/settings/public").then((r) => r.json()).then((j) => j.success && setSettings(j.data)).catch(() => {});
  }, []);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("حجم فایل نباید بیشتر از ۲ مگابایت باشد"); return; }
    const reader = new FileReader();
    reader.onload = () => setReceiptImage(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function submitOrder() {
    if (!session) return;
    setSubmitting(true);
    setResult(null);
    try {
      const r = await fetch("/api/sales/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saleId: crypto.randomUUID(),
          items: lines.map((l) => ({ productId: l.productId, quantity: l.qty })),
          receiptImage
        })
      });
      const j = await r.json();
      if (!r.ok || !j.success) { setResult({ ok: false, message: j.error?.message || "خطا در ثبت سفارش" }); return; }
      setResult({ ok: true, message: "سفارش شما ثبت شد. پس از تایید واریزی توسط پشتیبانی، سفارش نهایی می‌شود." });
      clear();
      setReceiptImage(null);
    } catch {
      setResult({ ok: false, message: "خطا در ارتباط با سرور" });
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
            <p className="mt-2 text-sm text-[var(--muted)]">محصولات موردنیاز پروژه را به سبد اضافه کنید.</p>
            <Link href="/products" className="btn btn-primary mt-6">مشاهده محصولات</Link>
          </div>
        ) : result ? (
          <div className={`mt-8 card p-10 text-center ${result.ok ? "" : "border-red-300"}`}>
            <div className="text-5xl">{result.ok ? "✅" : "⚠️"}</div>
            <h2 className="mt-4 text-xl font-black">{result.ok ? "سفارش ثبت شد" : "ثبت سفارش ناموفق بود"}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{result.message}</p>
            <Link href="/products" className="btn btn-primary mt-6">بازگشت به فروشگاه</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="card divide-y divide-[var(--border)] overflow-hidden">
              {lines.map((l) => (
                <div key={l.productId} className="flex items-center gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold">{l.title}</div>
                    <div className="mt-1 text-xs text-[var(--muted)]">{l.sku}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setQty(l.productId, l.qty - 1)} className="grid size-7 place-items-center rounded-lg border border-[var(--border)]"><Minus size={13} /></button>
                    <b className="w-7 text-center">{l.qty}</b>
                    <button type="button" onClick={() => setQty(l.productId, l.qty + 1)} className="grid size-7 place-items-center rounded-lg border border-[var(--border)]"><Plus size={13} /></button>
                  </div>
                  <b className="w-28 text-left">{(l.unitPrice * l.qty).toLocaleString("fa-IR")} تومان</b>
                  <button type="button" onClick={() => remove(l.productId)} className="text-red-500"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>

            <div className="card h-fit p-5">
              <h3 className="font-black">خلاصه سفارش</h3>
              <div className="mt-5 flex justify-between text-sm"><span>جمع کالاها</span><b>{subtotal.toLocaleString("fa-IR")} تومان</b></div>
              <div className="mt-3 flex justify-between text-sm"><span>ارسال</span><b>هماهنگی تلفنی</b></div>
              <div className="my-5 border-t border-[var(--border)]" />
              <div className="flex justify-between text-lg font-black"><span>قابل پرداخت</span><span>{subtotal.toLocaleString("fa-IR")} تومان</span></div>

              {!checkedSession ? null : !session ? (
                <div className="mt-5 rounded-xl bg-[var(--surface-2)] p-3 text-sm">
                  برای تکمیل خرید ابتدا وارد حساب کاربری شوید.
                  <Link href="/account?next=/cart" className="btn btn-primary mt-3 w-full">ورود / ثبت‌نام</Link>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {settings?.cardNumber && (
                    <div className="rounded-xl bg-[var(--surface-2)] p-3 text-xs leading-6">
                      <div>مبلغ را به شماره کارت زیر واریز کرده و رسید را ضمیمه کنید:</div>
                      <div className="mt-1 font-black">{settings.cardNumber} — {settings.cardHolderName}</div>
                    </div>
                  )}
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[var(--border)] p-3 text-sm text-[var(--muted)]">
                    <Upload size={16} />{receiptImage ? "رسید انتخاب شد ✓" : "بارگذاری تصویر رسید (اختیاری)"}
                    <input type="file" accept="image/*" className="hidden" onChange={onFile} />
                  </label>
                  <button type="button" disabled={submitting} onClick={submitOrder} className="btn btn-primary w-full disabled:opacity-60">{submitting ? "در حال ثبت..." : "ثبت سفارش"}</button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
