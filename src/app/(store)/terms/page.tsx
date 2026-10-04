import type { Metadata } from "next";
import StaticPage from "@/shared/layout/StaticPage";

export const metadata: Metadata = {
  title: "قوانین و مقررات",
  description: "شرایط خرید، پرداخت، ارسال و مرجوعی در فروشگاه ابزار احمدی.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <StaticPage title="قوانین و مقررات">
      <p>ثبت سفارش در سایت به معنی پذیرش قوانین فروشگاه است. قیمت و موجودی کالاها ممکن است بدون اطلاع قبلی تغییر کند و مبنای محاسبه، قیمت لحظه‌ی ثبت سفارش است.</p>
      <p>سفارش پس از تأیید پرداخت توسط فروشگاه پردازش می‌شود. در صورت ناموجود شدن کالا، سفارش لغو و وجه پرداختی بازگردانده می‌شود.</p>
      <p>شرایط مرجوعی کالا مطابق قوانین حمایت از مصرف‌کنندگان و پس از بررسی سالم‌بودن کالا و بسته‌بندی انجام می‌شود.</p>
    </StaticPage>
  );
}
