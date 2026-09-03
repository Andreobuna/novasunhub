import { Star } from "lucide-react";
import clsx from "clsx";

export function StarRating({ rating, count, size = 16 }: { rating: number; count?: number; size?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5" role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={clsx(
              i < Math.round(rating) ? "fill-solar-500 text-solar-500" : "fill-transparent text-border"
            )}
          />
        ))}
      </div>
      {typeof count === "number" && <span className="text-xs text-muted">({count})</span>}
    </div>
  );
}
