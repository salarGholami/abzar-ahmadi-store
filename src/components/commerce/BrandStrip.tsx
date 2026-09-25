import Link from "next/link";
import type { Product } from "@/lib/types";
type BrandStripProps = { brands: string[] };
const BRAND_SET_REPEAT = 8;
function BrandItem({ brand }: { brand: string }) {
  return (
    <Link
      href={`/products?brand=${encodeURIComponent(brand)}`}
      className=" group relative flex h-20 w-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:bg-[var(--surface)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.07)] sm:h-24 sm:w-44 "
    >
      {" "}
      {/* Glow */}{" "}
      <span
        aria-hidden="true"
        className=" pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[var(--primary)] opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-10 "
      />{" "}
      {/* Top accent */}{" "}
      <span
        aria-hidden="true"
        className=" pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-[var(--primary)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 "
      />{" "}
      <span className=" relative z-10 text-center text-sm font-black tracking-wide text-[var(--muted)] transition-all duration-300 group-hover:scale-105 group-hover:text-[var(--foreground)] sm:text-base ">
        {" "}
        {brand}{" "}
      </span>{" "}
    </Link>
  );
}
function BrandSet({
  brands,
  ariaHidden = false,
}: {
  brands: string[];
  ariaHidden?: boolean;
}) {
  return (
    <div
      className="flex shrink-0 items-center gap-3 pr-3"
      aria-hidden={ariaHidden}
    >
      {" "}
      {brands.map((brand, index) => (
        <BrandItem key={`${brand}-${index}`} brand={brand} />
      ))}{" "}
    </div>
  );
}
export default function BrandStrip({ brands }: BrandStripProps) {
  if (!brands.length) return null;
  /* * We create a very long sequence first. * Then duplicate that exact sequence once. * * The animation moves exactly 50% of the total track, * which is exactly one complete sequence. * * Therefore the first and last frames are identical. */ const firstSequence =
    Array.from({ length: BRAND_SET_REPEAT }, (_, index) => (
      <BrandSet key={`first-${index}`} brands={brands} />
    ));
  const secondSequence = Array.from(
    { length: BRAND_SET_REPEAT },
    (_, index) => (
      <BrandSet key={`second-${index}`} brands={brands} ariaHidden />
    ),
  );
  return (
    <section
      className="overflow-hidden py-7 sm:py-9"
      aria-labelledby="brands-title"
    >
      {" "}
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        {" "}
        <div className=" relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] py-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] ">
          {" "}
          {/* Header */}{" "}
          <div className="relative z-20 mb-6 flex items-end justify-between px-5 sm:px-7">
            {" "}
            <div>
              {" "}
              <div className="mb-2 flex items-center gap-2">
                {" "}
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]"
                />{" "}
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--primary)]">
                  {" "}
                  Trusted Brands{" "}
                </span>{" "}
              </div>{" "}
              <h2
                id="brands-title"
                className="text-lg font-black tracking-tight text-[var(--foreground)] sm:text-xl"
              >
                {" "}
                محبوب ترین برندها{" "}
              </h2>{" "}
            </div>{" "}
            <Link
              href="/products"
              className=" hidden rounded-full border border-[var(--border)] px-4 py-2 text-xs font-bold text-[var(--muted)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary)] sm:block "
            >
              {" "}
              مشاهده همه برندها{" "}
            </Link>{" "}
          </div>{" "}
          {/* Infinite ticker */}{" "}
          <div className="relative overflow-hidden" dir="ltr">
            {" "}
            {/* Right fade */}{" "}
            <div
              aria-hidden="true"
              className=" pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-linear-to-l from-[var(--surface)] via-[var(--surface)] to-transparent sm:w-32 "
            />{" "}
            {/* Left fade */}{" "}
            <div
              aria-hidden="true"
              className=" pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-linear-to-r from-[var(--surface)] via-[var(--surface)] to-transparent sm:w-32 "
            />{" "}
            <div className="brand-ticker-track flex w-max">
              {" "}
              {/* Sequence A */}{" "}
              <div className="flex shrink-0"> {firstSequence} </div>{" "}
              {/* Sequence B — exact copy */}{" "}
              <div className="flex shrink-0" aria-hidden="true">
                {" "}
                {secondSequence}{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          {/* Mobile action */}{" "}
          <div className="mt-5 px-5 sm:hidden">
            {" "}
            <Link
              href="/products"
              className=" flex h-11 items-center justify-center rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--muted)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] "
            >
              {" "}
              مشاهده همه برندها{" "}
            </Link>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </section>
  );
}
export function topBrandsFromProducts(
  products: Product[],
  limit = 8,
): string[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    if (!product.brand) continue;
    counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([brand]) => brand);
}
