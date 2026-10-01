import type { Metadata } from "next";
import StaticPage from "@/shared/layout/StaticPage";

export const metadata: Metadata = {
  title: "درباره ما",
  description: "با فروشگاه ابزار احمدی، تأمین‌کننده ابزار و تجهیزات ساختمانی با قیمت شفاف و پیگیری سفارش آشنا شوید.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <StaticPage title="درباره ابزار احمدی" intro="فروشگاه تخصصی ابزار و تجهیزات ساختمانی برای پیمانکاران، تعمیرکاران و علاقه‌مندان به کارهای فنی.">
      <p>هدف ما ارائه‌ی ابزار اصیل با مشخصات دقیق، قیمت شفاف و موجودی به‌روز است. هر سفارش پس از ثبت، قابل پیگیری است و وضعیت پرداخت و ارسال آن را از حساب کاربری خود می‌بینید.</p>
      <p>برای خرید عمده، پیش‌فاکتور و مشاوره‌ی انتخاب ابزار، از صفحه‌ی تماس با ما با تیم فروش در ارتباط باشید.</p>
    </StaticPage>
  );
}
