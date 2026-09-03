import clsx from "clsx";

const tones = {
  default: "bg-surface-2 text-muted border-border",
  brand: "bg-brand-500/15 text-brand-300 border-brand-500/30",
  success: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  danger: "bg-red-500/15 text-red-500 border-red-500/30",
};

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
