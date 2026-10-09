type SkeletonProps = {
  className?: string;
};

/** Generic pulse skeleton block */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[var(--surface-2)] ${className}`}
      aria-hidden
    />
  );
}

/** Product card skeleton matching ProductCard layout */
export function ProductCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] sm:rounded-[22px]"
      aria-hidden
    >
      <Skeleton className={`w-full rounded-none ${compact ? "aspect-[1.1]" : "aspect-square"}`} />
      <div className="flex flex-1 flex-col gap-2.5 p-3 sm:p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="mt-auto flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="size-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/** Grid of product card skeletons */
export function ProductGridSkeleton({
  count = 8,
}: {
  count?: number;
}) {
  return (
    <ul
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
      aria-busy="true"
      aria-label="در حال بارگذاری محصولات"
    >
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="min-w-0">
          <ProductCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

export default Skeleton;
