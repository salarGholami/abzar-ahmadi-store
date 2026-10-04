import { AboutPage } from "@/features/about/AboutPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "درباره ابزار احمدی | فروشگاه تخصصی ابزار ساختمانی",

  description:
    "با ابزار احمدی، فروشگاه تخصصی ابزار و تجهیزات ساختمانی آشنا شوید؛ با تمرکز بر اصالت کالا، قیمت شفاف، موجودی دقیق و تجربه خرید مطمئن.",

  keywords: [
    "ابزار احمدی",
    "درباره ابزار احمدی",
    "فروشگاه ابزار",
    "ابزار ساختمانی",
    "ابزار آلات ساختمانی",
    "خرید ابزار",
    "تجهیزات ساختمانی",
  ],

  alternates: {
    canonical: "/about",
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

    title: "درباره ابزار احمدی | فروشگاه تخصصی ابزار ساختمانی",

    description:
      "با ابزار احمدی، فروشگاه تخصصی ابزار و تجهیزات ساختمانی آشنا شوید.",

    url: "/about",

    siteName: "ابزار احمدی",

    images: [
      {
        url: "/images/banners/about/2.webp",
        width: 1200,
        height: 900,
        alt: "ابزار احمدی - فروشگاه تخصصی ابزار و تجهیزات ساختمانی",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "درباره ابزار احمدی | فروشگاه تخصصی ابزار ساختمانی",

    description:
      "با ابزار احمدی، فروشگاه تخصصی ابزار و تجهیزات ساختمانی آشنا شوید.",

    images: ["/images/banners/about/2.webp"],
  },
};

export default function AboutRoute() {
  return <AboutPage />;
}
