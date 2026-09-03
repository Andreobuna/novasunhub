import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Logo } from "./logo";
import { NewsletterForm } from "@/components/home/newsletter-form";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "Solar Panels", href: "/products?category=solar-panels" },
      { label: "Inverters", href: "/products?category=inverters" },
      { label: "Solar Batteries", href: "/products?category=solar-batteries" },
      { label: "Power Stations", href: "/products?category=power-stations" },
      { label: "Complete Solar Kits", href: "/products?category=solar-kits" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Why NovaSunHub", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Track an order", href: "/account" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Shipping & installation", href: "/about#installation" },
      { label: "Warranty", href: "/about#warranty" },
      { label: "FAQs", href: "/about#faq" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border bg-surface">
      <div className="solar-grid pointer-events-none absolute inset-x-0 top-0 h-40 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr,1fr,1fr,1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Premium solar panels, batteries and complete power systems — engineered for
              dependable energy independence, wherever the grid falls short.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Follow NovaSunHub"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition hover:border-brand-400/60 hover:text-brand-400"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-semibold text-text">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-muted transition hover:text-brand-400">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 gradient-border rounded-2xl bg-surface-2/60 p-6 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h4 className="font-display text-lg font-semibold text-text">Stay ahead of the grid</h4>
              <p className="mt-1 text-sm text-muted">
                Get new product drops, install guides and seasonal offers — no spam.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} NovaSunHub. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-text">Privacy</Link>
            <Link href="/terms" className="hover:text-text">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
