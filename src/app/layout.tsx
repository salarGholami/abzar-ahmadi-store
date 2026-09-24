import "swiper/css";
import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";

import Providers from "./providers";
import StoreChrome from "@/components/layout/StoreChrome";

const vazirmatn = localFont({
  src: [
    {
      path: "../../public/fonts/Vazirmatn-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/fonts/Vazirmatn-ExtraLight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/fonts/Vazirmatn-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Vazirmatn-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Vazirmatn-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Vazirmatn-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Vazirmatn-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Vazirmatn-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ابزار احمدی | فروشگاه ابزار آلات ساختمانی",
  description: "فروشگاه تخصصی ابزار آلات ساختمانی ابزار احمدی",
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
      <body className="font-vazirmatn antialiased">
        <Providers>
          {children}
          <StoreChrome />
        </Providers>

        <noscript>
          برای استفاده کامل از فروشگاه ابزار احمدی، لطفاً JavaScript مرورگر خود
          را فعال کنید.
        </noscript>
      </body>
    </html>
  );
}
