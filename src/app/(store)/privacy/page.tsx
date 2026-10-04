import type { Metadata } from "next";
import StaticPage from "@/shared/layout/StaticPage";

export const metadata: Metadata = {
  title: "حریم خصوصی",
  description: "نحوه‌ی نگهداری و استفاده از اطلاعات کاربران در فروشگاه ابزار احمدی.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <StaticPage title="حریم خصوصی">
      <p>اطلاعات ثبت‌نام، آدرس و تصویر فیش واریزی فقط برای پردازش و ارسال سفارش و پشتیبانی نگهداری می‌شود و با اشخاص ثالث به اشتراک گذاشته نمی‌شود.</p>
      <p>برای بهبود تجربه‌ی کاربری، رفتار کلی کاربران در سایت (مانند بازدید محصول و افزودن به سبد) به‌صورت ناشناس ثبت می‌شود.</p>
    </StaticPage>
  );
}
