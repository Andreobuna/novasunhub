"use client";

import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LogoutButton } from "@/components/account/logout-button";

export function AdminTopbar({ userName, onMenuClick }: { userName: string; onMenuClick: () => void }) {
  return (
    <div className="sticky top-0 z-30 flex h-[72px] items-center gap-4 border-b border-border bg-surface/80 px-4 backdrop-blur sm:px-6">
      <button onClick={onMenuClick} className="flex h-9 w-9 items-center justify-center rounded-lg text-text lg:hidden" aria-label="Open menu">
        <Menu size={20} />
      </button>
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-sm text-muted sm:block">Signed in as <span className="font-medium text-text">{userName}</span></span>
        <ThemeToggle />
        <LogoutButton />
      </div>
    </div>
  );
}
