"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";

export function AdminShell({ userName, children }: { userName: string; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar className="hidden w-64 flex-shrink-0 lg:flex" />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72">
            <AdminSidebar className="h-full" />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-text"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar userName={userName} onMenuClick={() => setMobileOpen(true)} />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
