import "./globals.css";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import Providers from "./providers";
import JsonLd from "@/shared/seo/JsonLd";
import { SITE_NAME, SITE_TAGLINE, getSiteUrl } from "@/lib/seo";

const vazirmatn = localFont({
  src: "../../public/fonts/Vazirmatn[wght].woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-vazirmatn",
  display: "swap",
  preload: true,
});

const siteUrl = getSiteUrl();

const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: SITE_NAME,
      url: siteUrl,
      logo: `${siteUrl}/images/logo/abzar-ahmadi-logo-light.png`,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: ["fa"],
        url: `${siteUrl}/contact`,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: SITE_NAME,
      url: siteUrl,
      inLanguage: "fa-IR",
      publisher: { "@id": `${siteUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/products?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1114" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "خرید ابزار و تجهیزات ساختمانی با مشخصات کامل، قیمت شفاف و امکان پیگیری سفارش از ابزار احمدی.",
  applicationName: SITE_NAME,
  keywords: ["ابزار ساختمانی", "خرید ابزار", "ابزار احمدی", "ابزارآلات", "تجهیزات ساختمانی"],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: "فروشگاه تخصصی ابزار و تجهیزات ساختمانی ابزار احمدی.",
    url: "/",
    images: [{ url: "/images/logo/abzar-ahmadi-logo-light.png", width: 1000, height: 1000, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: "فروشگاه تخصصی ابزار و تجهیزات ساختمانی ابزار احمدی.",
    images: ["/images/logo/abzar-ahmadi-logo-light.png"],
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={vazirmatn.variable}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("abzar-ahmadi-theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.remove("light","dark");r.classList.add(d?"dark":"light");r.style.colorScheme=d?"dark":"light"}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${vazirmatn.className} antialiased`}>
        <JsonLd data={siteStructuredData} />
        <Providers>
          {children}
        </Providers>

        <noscript>
          برای استفاده کامل از فروشگاه ابزار احمدی، لطفاً JavaScript مرورگر خود
          را فعال کنید.
        </noscript>
      </body>
    </html>
  );
}
