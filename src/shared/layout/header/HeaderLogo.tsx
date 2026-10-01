import Image from "next/image";
import Link from "next/link";

const LIGHT_LOGO = "/images/logo/abzar-ahmadi-logo-light.png";
const DARK_LOGO = "/images/logo/abzar-ahmadi-logo-dark.png";

/**
 * Server component. Theme is resolved purely with CSS (`dark:`), so no client JS,
 * no MutationObserver and no logo flash. The hidden <img> is lazy and never downloads.
 */
export default function HeaderLogo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5 lg:w-[235px] lg:gap-3" aria-label="ابزار احمدی؛ صفحه اصلی">
      <span className="relative block h-11 w-12 shrink-0 lg:h-[60px] lg:w-[70px]">
        <Image src={LIGHT_LOGO} alt="لوگوی ابزار احمدی" fill sizes="70px" className="object-contain dark:hidden" />
        <Image src={DARK_LOGO} alt="" aria-hidden fill sizes="70px" className="hidden object-contain dark:block" />
      </span>
      <span className="flex min-w-0 flex-col justify-center text-right">
        <span className="whitespace-nowrap text-lg font-black leading-7 tracking-[-0.7px] lg:text-[21px]">
          <span className="text-[var(--primary)]">ابزار</span> <span className="text-[var(--text)]">احمدی</span>
        </span>
        <span className="mt-0.5 hidden whitespace-nowrap text-[9px] font-bold leading-4 text-[var(--muted)] sm:block">
          فروشگاه ابزار آلات ساختمانی
        </span>
      </span>
    </Link>
  );
}
