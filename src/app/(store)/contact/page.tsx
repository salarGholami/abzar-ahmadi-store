import type { Metadata } from "next";
import StaticPage from "@/shared/layout/StaticPage";
import { getJson } from "@/lib/github";
import type { StoreSettings } from "@/lib/types";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: "راه‌های ارتباط با پشتیبانی و تیم فروش فروشگاه ابزار احمدی.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const settings = await getJson<StoreSettings[]>("settings.json", []).then((file) => file.data[0]).catch(() => undefined);
  return (
    <StaticPage title="تماس با ما" intro="برای پیگیری سفارش، خرید عمده یا مشاوره‌ی انتخاب ابزار با ما در ارتباط باشید.">
      <p>
        <b>{settings?.storeName || "ابزار احمدی"}</b>
      </p>
      {settings?.storePhone && (
        <p>
          تلفن پشتیبانی: <a className="font-black text-[var(--primary)]" href={`tel:${settings.storePhone}`}>{settings.storePhone}</a>
        </p>
      )}
      <p>ساعت پاسخ‌گویی: شنبه تا پنجشنبه، ۹ صبح تا ۶ عصر.</p>
    </StaticPage>
  );
}
