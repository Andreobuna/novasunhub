import clsx from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("skeleton rounded-xl", className)} aria-hidden="true" />;
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-3">
      <Skeleton className="mb-3 aspect-square w-full" />
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="mb-3 h-4 w-1/2" />
      <Skeleton className="h-9 w-full rounded-full" />
    </div>
  );
}
