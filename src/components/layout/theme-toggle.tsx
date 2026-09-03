"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text transition hover:border-brand-400/60 hover:text-brand-400"
    >
      <Sun size={18} className={theme === "dark" ? "hidden" : "block"} />
      <Moon size={18} className={theme === "dark" ? "block" : "hidden"} />
    </button>
  );
}
