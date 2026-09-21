import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Providers from "./providers";

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
  title: "ابزار احمدی | فروشگاه ابزار ساختمانی",
  description: "فروشگاه ابزار ساختمانی",
};

const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={vazirmatn.variable}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-vazirmatn antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
