import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ابزار احمدی | فروشگاه ابزار و تجهیزات ساختمانی",
    short_name: "ابزار احمدی",
    description: "خرید آنلاین ابزار و تجهیزات ساختمانی با قیمت شفاف و پیگیری سفارش.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    dir: "rtl",
    lang: "fa",
    background_color: "#ffffff",
    theme_color: "#00adb5",
    icons: [
      { src: "/images/logo/abzar-ahmadi-logo-light.png", sizes: "1000x1000", type: "image/png", purpose: "any" },
    ],
  };
}
