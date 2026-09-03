"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { useCartStore } from "@/store/cart-store";
import { useCurrentUser } from "@/lib/use-current-user";

const NAV_LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/products?category=solar-kits", label: "Solar Kits" },
  { href: "/products?featured=true", label: "Featured" },
  { href: "/about", label: "Why NovaSunHub" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const count = useCartStore((s) => s.count());
  const { user } = useCurrentUser();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/products${query ? `?q=${encodeURIComponent(query)}` : ""}`);
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "glass shadow-card" : "border-b border-transparent bg-bg/70 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="NovaSunHub home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-text"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden max-w-sm flex-1 items-center lg:flex">
          <div className="flex w-full items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 transition focus-within:border-brand-400/60">
            <Search size={16} className="text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search panels, inverters, batteries…"
              className="w-full bg-transparent text-sm text-text outline-none placeholder:text-muted/70"
              aria-label="Search products"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <ThemeToggle />

          <Link
            href={user ? "/account" : "/login"}
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text transition hover:border-brand-400/60 hover:text-brand-400 sm:flex"
            aria-label={user ? "Your account" : "Sign in"}
          >
            <User size={18} />
          </Link>

          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text transition hover:border-brand-400/60 hover:text-brand-400"
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
          >
            <ShoppingCart size={18} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-solar-500 px-1 text-[11px] font-bold text-black">
                {count}
              </span>
            )}
          </Link>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-border bg-bg lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              <form onSubmit={submitSearch} className="mb-2 flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5">
                <Search size={16} className="text-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products…"
                  className="w-full bg-transparent text-sm text-text outline-none"
                />
              </form>
              {NAV_LINKS.map((link) => (
                <Link key={link.label} href={link.href} className="rounded-lg px-3 py-2.5 text-sm font-medium text-text hover:bg-surface-2">
                  {link.label}
                </Link>
              ))}
              <Link href={user ? "/account" : "/login"} className="rounded-lg px-3 py-2.5 text-sm font-medium text-text hover:bg-surface-2">
                {user ? "My account" : "Sign in"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
