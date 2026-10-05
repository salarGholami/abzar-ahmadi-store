import type { Metadata } from "next";
import { ContactPage } from "@/features/contact/ContactPage";

export const metadata: Metadata = {
  title: "تماس با ابزار احمدی | ارتباط با فروشگاه ابزار",
  description:
    "برای دریافت مشاوره، پیگیری سفارش و کسب اطلاعات بیشتر درباره محصولات با ابزار احمدی در ارتباط باشید.",
  keywords: [
    "تماس با ابزار احمدی",
    "تماس با ابزار",
    "پشتیبانی ابزار احمدی",
    "مشاوره خرید ابزار",
    "آدرس ابزار احمدی",
    "شماره تماس ابزار احمدی",
    "فروشگاه ابزار",
    "ابزار ساختمانی",
  ],

  alternates: {
    canonical: "/contact",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "fa_IR",

    title: "تماس با ابزار احمدی | ارتباط با فروشگاه ابزار",

    description:
      "برای دریافت مشاوره، پیگیری سفارش و کسب اطلاعات بیشتر با ابزار احمدی در ارتباط باشید.",

    url: "/contact",

    siteName: "ابزار احمدی",

    images: [
      {
        url: "/images/banners/contact/2.webp",
        width: 1200,
        height: 900,
        alt: "تماس با ابزار احمدی",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "تماس با ابزار احمدی | ارتباط با فروشگاه ابزار",

    description:
      "برای دریافت مشاوره، پیگیری سفارش و کسب اطلاعات بیشتر با ابزار احمدی در ارتباط باشید.",

    images: ["/images/banners/contact/2.webp"],
  },
};

export default function ContactRoute() {
  return <ContactPage />;
}
