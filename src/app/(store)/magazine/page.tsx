import type { Metadata } from "next";
import { getJson } from "@/lib/github";
import type { StoreArticle } from "@/lib/types";
import MagazineBrowser from "@/features/magazine/ui/MagazineBrowser";

export const metadata: Metadata = {
  title: "مجله ابزار احمدی | راهنمای خرید، بررسی ابزار و آموزش تخصصی",
  description: "راهنمای تخصصی خرید ابزار ساختمانی، مقایسه دریل و ابزار برقی، آموزش نگهداری و نکات کاربردی برای کارگاه و پروژه‌های ساختمانی.",
  alternates: { canonical: "/magazine" },
  openGraph: {
    title: "مجله ابزار احمدی | دانش فنی برای انتخاب بهتر",
    description: "راهنماها، بررسی‌ها و آموزش‌های کاربردی دنیای ابزار.",
    type: "website",
    locale: "fa_IR",
  },
};

export default async function MagazinePage() {
  const result = await getJson<StoreArticle[]>("articles.json", [], { cache: false });
  const articles = result.data.filter((article) => article.active);
  return <MagazineBrowser articles={articles} />;
}
