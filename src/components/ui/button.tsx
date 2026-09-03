import { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-400 shadow-glow hover:shadow-glow-lg disabled:hover:bg-brand-500",
  secondary:
    "bg-surface-2 text-text hover:bg-border border border-border",
  outline: "border border-border text-text hover:bg-surface-2",
  ghost: "text-text hover:bg-surface-2",
  danger: "bg-red-600 text-white hover:bg-red-500",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-[3.25rem] px-7 text-base", // 52px — h-13 isn't a real Tailwind class (scale jumps 12→14), was silently rendering with no explicit height
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

export const Button = forwardRef<HTMLButtonElement, BaseProps & ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <button ref={ref} className={clsx(base, variants[variant], sizes[size], className)} {...props} />
  )
);
Button.displayName = "Button";

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: BaseProps & React.ComponentProps<typeof Link>) {
  return (
    <Link href={href} className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  );
}
