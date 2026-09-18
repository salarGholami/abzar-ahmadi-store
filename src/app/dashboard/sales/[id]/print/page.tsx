import { notFound } from "next/navigation";
import { getJson } from "@/lib/github";
import { requirePermission } from "@/lib/permissions";
import type { Product, Sale, SaleItem } from "@/lib/types";
import PrintButton from "@/components/dashboard/PrintButton";

export default async function SalePrintPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("sales.read");
  const { id } = await params;
  const [sales, items, products] = await Promise.all([
    getJson<Sale[]>("sales.json", []),
    getJson<SaleItem[]>("sale-items.json", []),
    getJson<Product[]>("products.json", []),
  ]);
  const sale = sales.data.find((item) => item.id === id);
  if (!sale) notFound();
  const saleItems = items.data.filter((item) => item.saleId === sale.id);

  return <main dir="rtl" className="min-h-screen bg-white p-6 text-slate-900 print:p-0">
    <div className="no-print mb-4 flex justify-end"><PrintButton /></div>
    <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 p-7 print:max-w-none print:border-0">
      <header className="flex items-start justify-between gap-6 border-b border-slate-200 pb-5">
        <div><h1 className="text-2xl font-black">فاکتور فروش</h1><p className="mt-1 text-sm text-slate-500">آچارستان</p></div>
        <div className="text-left text-sm"><div>شماره: <b>{sale.id}</b></div><div className="mt-1">تاریخ: <b>{new Date(sale.createdAt).toLocaleString("fa-IR")}</b></div></div>
      </header>
      <div className="grid gap-3 py-5 text-sm sm:grid-cols-2"><div>خریدار: <b>{sale.buyerName || "فروش حضوری"}</b></div>{sale.buyerPhone&&<div>موبایل: <b>{sale.buyerPhone}</b></div>}</div>
      <table className="w-full text-right text-sm"><thead><tr className="border-y border-slate-200 bg-slate-50"><th className="p-3">محصول</th><th className="p-3">تعداد</th><th className="p-3">قیمت واحد</th><th className="p-3">جمع</th></tr></thead><tbody>{saleItems.map(item=><tr key={item.id} className="border-b border-slate-100"><td className="p-3">{products.data.find(p=>p.id===item.productId)?.title||item.productId}</td><td className="p-3">{item.quantity}</td><td className="p-3">{item.unitPrice.toLocaleString("fa-IR")}</td><td className="p-3 font-bold">{item.total.toLocaleString("fa-IR")}</td></tr>)}</tbody></table>
      <div className="mt-6 ml-auto max-w-xs space-y-2 text-sm"><div className="flex justify-between"><span>جمع کالاها</span><b>{sale.subtotal.toLocaleString("fa-IR")} تومان</b></div><div className="flex justify-between"><span>تخفیف</span><b>{sale.discount.toLocaleString("fa-IR")} تومان</b></div><div className="flex justify-between border-t border-slate-200 pt-3 text-base"><span>مبلغ نهایی</span><b>{sale.netAmount.toLocaleString("fa-IR")} تومان</b></div></div>
      {sale.receiptImage&&<div className="mt-7 border-t border-slate-200 pt-5"><div className="mb-2 text-xs font-bold">رسید پرداخت</div><img src={sale.receiptImage} alt="رسید پرداخت" className="max-h-72 w-full object-contain"/></div>}
    </article>
  </main>;
}
