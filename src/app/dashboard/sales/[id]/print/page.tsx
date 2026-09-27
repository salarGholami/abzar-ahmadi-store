import { notFound } from "next/navigation";

import PrintButton from "@/components/dashboard/PrintButton";
import { getJson } from "@/lib/github";
import { requirePermission } from "@/lib/permissions";
import type { Product, Sale, SaleItem, ShippingStatus } from "@/lib/types";

const shippingLabels: Record<ShippingStatus, string> = {
  PENDING: "در انتظار ارسال",
  PROCESSING: "در حال آماده‌سازی",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل شده",
  CANCELED: "لغو شده",
};

const paymentLabels: Record<string, string> = {
  PAID: "پرداخت شده",
  PENDING_TRANSFER: "در انتظار انتقال",
  PARTIAL: "پرداخت ناقص",
  CANCELED: "لغو شده",
};

function formatPrice(value: number) {
  return Number(value || 0).toLocaleString("fa-IR");
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("fa-IR");
}

export default async function SalePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("sales.read");

  const { id } = await params;

  const [sales, items, products] = await Promise.all([
    getJson<Sale[]>("sales.json", []),
    getJson<SaleItem[]>("sale-items.json", []),
    getJson<Product[]>("products.json", []),
  ]);

  const sale = sales.data.find((item) => item.id === id);

  if (!sale) {
    notFound();
  }

  const saleItems = items.data.filter((item) => item.saleId === sale.id);

  const productMap = new Map(
    products.data.map((product) => [product.id, product]),
  );

  const shippingStatus = sale.shippingStatus ?? "PENDING";

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-white
        p-6
        text-slate-900
        print:p-0
      "
    >
      {/* Print action */}

      <div className="no-print mx-auto mb-5 flex max-w-3xl justify-end">
        <PrintButton />
      </div>

      <article
        className="
          mx-auto
          max-w-3xl
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-7
          print:max-w-none
          print:rounded-none
          print:border-0
          print:p-0
        "
      >
        {/* Header */}

        <header className="flex items-start justify-between gap-6 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-black">فاکتور فروش</h1>

            <p className="mt-1 text-sm text-slate-500">ابزار احمدی</p>
          </div>

          <div className="text-left text-sm">
            <div>
              شماره: <b dir="ltr">{sale.id}</b>
            </div>

            <div className="mt-1">
              تاریخ: <b>{formatDate(sale.createdAt)}</b>
            </div>
          </div>
        </header>

        {/* Customer */}

        <section className="grid gap-3 border-b border-slate-200 py-5 text-sm sm:grid-cols-2">
          <div>
            خریدار: <b>{sale.buyerName || "فروش حضوری"}</b>
          </div>

          {sale.buyerPhone && (
            <div>
              موبایل: <b dir="ltr">{sale.buyerPhone}</b>
            </div>
          )}

          <div>
            وضعیت پرداخت:{" "}
            <b>{paymentLabels[sale.paymentStatus] ?? sale.paymentStatus}</b>
          </div>

          <div>
            وضعیت ارسال: <b>{shippingLabels[shippingStatus]}</b>
          </div>
        </section>

        {/* Shipping */}

        {(sale.trackingCode || sale.shippingCompany || sale.shippingMethod) && (
          <section className="border-b border-slate-200 py-5">
            <h2 className="mb-3 text-sm font-black">اطلاعات ارسال</h2>

            <div className="grid gap-3 text-sm sm:grid-cols-2">
              {sale.shippingCompany && (
                <div>
                  شرکت حمل: <b>{sale.shippingCompany}</b>
                </div>
              )}

              {sale.shippingMethod && (
                <div>
                  روش ارسال: <b>{sale.shippingMethod}</b>
                </div>
              )}

              {sale.trackingCode && (
                <div>
                  کد رهگیری: <b dir="ltr">{sale.trackingCode}</b>
                </div>
              )}

              {sale.shippedAt && (
                <div>
                  تاریخ ارسال: <b>{formatDate(sale.shippedAt)}</b>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Products */}

        <section className="mt-5">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50">
                <th className="p-3">محصول</th>

                <th className="p-3">تعداد</th>

                <th className="p-3">قیمت واحد</th>

                <th className="p-3">جمع</th>
              </tr>
            </thead>

            <tbody>
              {saleItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-500">
                    آیتمی برای این فروش ثبت نشده است.
                  </td>
                </tr>
              ) : (
                saleItems.map((item) => {
                  const product = productMap.get(item.productId);

                  return (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="p-3">
                        {product?.title || item.productId}
                      </td>

                      <td className="p-3">
                        {Number(item.quantity).toLocaleString("fa-IR")}
                      </td>

                      <td className="p-3">{formatPrice(item.unitPrice)}</td>

                      <td className="p-3 font-bold">
                        {formatPrice(item.total)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>

        {/* Totals */}

        <section className="mt-6 ml-auto max-w-xs space-y-3 text-sm">
          <div className="flex justify-between gap-6">
            <span>جمع کالاها</span>

            <b>{formatPrice(sale.subtotal)} تومان</b>
          </div>

          <div className="flex justify-between gap-6">
            <span>تخفیف</span>

            <b>{formatPrice(sale.discount)} تومان</b>
          </div>

          <div className="flex justify-between gap-6 border-t border-slate-200 pt-3 text-base">
            <span className="font-bold">مبلغ نهایی</span>

            <b>{formatPrice(sale.netAmount)} تومان</b>
          </div>
        </section>

        {/* Receipt */}

        {(sale.receipt?.url || sale.receiptImage) && (
          <section className="mt-7 border-t border-slate-200 pt-5">
            <div className="mb-3 text-xs font-bold">رسید پرداخت</div>

            <img
              src={sale.receipt?.url || sale.receiptImage || ""}
              alt="رسید پرداخت"
              className="
                max-h-72
                w-full
                object-contain
              "
            />
          </section>
        )}

        {/* Footer */}

        <footer className="mt-8 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
          با تشکر از خرید شما از ابزار احمدی
        </footer>
      </article>
    </main>
  );
}
