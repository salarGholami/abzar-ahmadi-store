import { Star } from "lucide-react";

export default function RatingStars({ rating, reviewCount, size = 14 }: { rating?: number; reviewCount?: number; size?: number }) {
  if (!rating) return null;
  const rounded = Math.round(rating);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={size} className={i < rounded ? "fill-amber-400 text-amber-400" : "text-[var(--border)]"} />
        ))}
      </div>
      <span className="text-xs font-black">{rating.toLocaleString("fa-IR")}</span>
      {typeof reviewCount === "number" && <span className="text-xs text-[var(--muted)]">({reviewCount.toLocaleString("fa-IR")} نظر)</span>}
    </div>
  );
}
