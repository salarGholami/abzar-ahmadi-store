import { notFound } from "next/navigation";
import { getJson } from "@/lib/github";
import { requirePermission } from "@/lib/permissions";
import type { Sale, SaleItem, Product, StoreSettings } from "@/lib/types";
import PrintButton from "@/components/dashboard/PrintButton";

export default async function PrintInvoice({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("sales.read");

  const [salesF, itemsF, productsF, settingsF] = await Promise.all([
    getJson<Sale[]>("sales.json", []),
    getJson<SaleItem[]>("sale-items.json", []),
    getJson<Product[]>("products.json", []),
    getJson<StoreSettings[]>("settings.json", [{ id: "store", storeName: "ابزارینو", storePhone: "", cardNumber: "", cardHolderName: "", lowStockThreshold: 5 }])
  ]);

  const sale = salesF.data.find((s) => s.id === id);
  if (!sale) notFound();
  const items = itemsF.data.filter((i) => i.saleId === id);
  const settings = settingsF.data[0];
  const isProforma = sale.paymentStatus !== "PAID";

  return (
    <div className="mx-auto max-w-2xl p-8 text-sm">
      <div className="no-print mb-4 flex justify-end"><PrintButton /></div>
      <div className="rounded-2xl border border-[var(--border)] p-8">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-5">
          <div>
            <div className="text-xl font-black">{settings.storeName}</div>
            <div className="text-xs text-[var(--muted)]">{settings.storePhone}</div>
          </div>
          <div className="text-left">
            <div className="text-lg font-black">{isProforma ? "پیش‌فاکتور فروش" : "فاکتور فروش"}</div>
            <div className="text-xs text-[var(--muted)]">شماره: {sale.id.slice(0, 8)}</div>
            <div className="text-xs text-[var(--muted)]">تاریخ: {new Date(sale.createdAt).toLocaleDateString("fa-IR")}</div>
          </div>
        </div>
        <div className="mt-5 flex justify-between text-xs text-[var(--muted)]">
          <div>خریدار: <b className="text-[var(--text)]">{sale.buyerName || "فروش حضوری"}</b></div>
          {sale.buyerPhone && <div>موبایل: <b className="text-[var(--text)]">{sale.buyerPhone}</b></div>}
        </div>
        <table className="mt-6 w-full text-right text-xs">
          <thead className="border-b border-[var(--border)] text-[var(--muted)]"><tr><th className="py-2">ردیف</th><th className="py-2">شرح کالا</th><th className="py-2">تعداد</th><th className="py-2">قیمت واحد</th><th className="py-2">جمع</th></tr></thead>
          <tbody>
            {items.map((it, idx) => {
              const p = productsF.data.find((x) => x.id === it.productId);
              return (
                <tr key={it.id} className="border-b border-[var(--border)]">
                  <td className="py-2">{idx + 1}</td>
                  <td className="py-2 font-bold">{p?.title || it.productId}</td>
                  <td className="py-2">{it.quantity}</td>
                  <td className="py-2">{it.unitPrice.toLocaleString("fa-IR")}</td>
                  <td className="py-2">{it.total.toLocaleString("fa-IR")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-6 space-y-1 text-left">
          <div className="flex justify-between text-xs"><span className="text-[var(--muted)]">جمع کل</span><span>{sale.subtotal.toLocaleString("fa-IR")} تومان</span></div>
          {sale.discount > 0 && <div className="flex justify-between text-xs"><span className="text-[var(--muted)]">تخفیف</span><span>{sale.discount.toLocaleString("fa-IR")} تومان</span></div>}
          <div className="flex justify-between text-base font-black"><span>مبلغ قابل پرداخت</span><span>{sale.netAmount.toLocaleString("fa-IR")} تومان</span></div>
        </div>
        {isProforma && <div className="mt-6 rounded-xl bg-[var(--surface-2)] p-3 text-[11px] text-[var(--muted)]">این سند پیش‌فاکتور است و پس از تایید پرداخت توسط فروشگاه، فاکتور نهایی صادر خواهد شد.</div>}
      </div>
    </div>
  );
}
