import { Star } from "lucide-react";

export default function RatingStars({
  rating,
  reviewCount,
  size = 15,
}: {
  rating?: number;
  reviewCount?: number;
  size?: number;
}) {
  if (!rating) return null;

  const rounded = Math.round(rating);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            size={size}
            strokeWidth={2.5}
            className={
              index < rounded
                ? "fill-amber-400 text-amber-400"
                : "text-[var(--border)]"
            }
          />
        ))}
      </div>

      <span className="text-sm font-black">
        {rating.toLocaleString("fa-IR")}
      </span>

      {typeof reviewCount === "number" && (
        <>
          <span className="size-1 rounded-full bg-[var(--border)]" />

          <span className="text-xs font-bold text-[var(--muted)]">
            {reviewCount.toLocaleString("fa-IR")} نظر
          </span>
        </>
      )}
    </div>
  );
}
