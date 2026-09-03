import type { Metadata } from "next";
import { ShieldCheck, Truck, Wrench, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Why NovaSunHub",
  description: "Learn how NovaSunHub sizes, warranties and ships solar systems across Nigeria.",
};

const FAQS = [
  { q: "How long does delivery take?", a: "Most orders ship within 2–4 business days and arrive within 3–10 days depending on your state." },
  { q: "Do you offer installation?", a: "Complete solar kits include an install guide, and we can refer you to a certified installer in your area on request." },
  { q: "What's covered under warranty?", a: "Coverage varies by product — panels typically carry 25-year performance warranties, batteries 10 years, and inverters 3–5 years. Full terms are listed on each product page." },
  { q: "Can I return a product?", a: "Unopened items can be returned within 14 days. Contact support to start a return." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-text">Why NovaSunHub</h1>
      <p className="mt-4 text-base leading-relaxed text-muted">
        NovaSunHub designs, specs and ships solar energy systems built for real-world conditions —
        unstable grids, tropical heat, and homes that can't afford to guess wrong on system sizing.
        Every product on our platform lists its actual technical specifications, and every complete
        kit is pre-matched to a realistic daily load.
      </p>

      <div id="installation" className="mt-12 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-3">
          <Truck className="text-brand-400" size={22} />
          <h2 className="font-display text-lg font-semibold text-text">Shipping & installation</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          We ship nationwide with tracked delivery. Complete solar kits include a step-by-step install
          guide, and our team can refer you to a vetted, certified installer in your state for full-system
          setups.
        </p>
      </div>

      <div id="warranty" className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-brand-400" size={22} />
          <h2 className="font-display text-lg font-semibold text-text">Warranty</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Every product page lists its specific warranty term. In general: solar panels carry up to a
          25-year performance warranty, lithium batteries up to 10 years, and inverters 3–5 years.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-3">
          <Wrench className="text-brand-400" size={22} />
          <h2 className="font-display text-lg font-semibold text-text">Correctly sized systems</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Our complete kits are matched against typical daily loads for homes and small businesses so
          you don't overpay for capacity you don't need — or run short during outages.
        </p>
      </div>

      <div id="faq" className="mt-12">
        <div className="flex items-center gap-3">
          <HelpCircle className="text-brand-400" size={22} />
          <h2 className="font-display text-lg font-semibold text-text">Frequently asked questions</h2>
        </div>
        <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface">
          {FAQS.map((f) => (
            <div key={f.q} className="p-5">
              <h3 className="text-sm font-semibold text-text">{f.q}</h3>
              <p className="mt-1.5 text-sm text-muted">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
