"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Webhook,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/webhooks", label: "Webhooks", icon: Webhook },
];

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div className={clsx("flex h-full flex-col border-r border-border bg-surface", className)}>
      <div className="flex h-[72px] items-center border-b border-border px-6">
        <Link href="/admin"><Logo /></Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6">
        {LINKS.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                active ? "bg-brand-500/10 text-brand-400" : "text-muted hover:bg-surface-2 hover:text-text"
              )}
            >
              <link.icon size={17} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <Link href="/" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface-2 hover:text-text">
          <ExternalLink size={16} /> View storefront
        </Link>
      </div>
    </div>
  );
}
