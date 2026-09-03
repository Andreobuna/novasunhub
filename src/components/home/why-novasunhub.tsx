import { BadgeCheck, HeadphonesIcon, ShieldCheck, Truck } from "lucide-react";
import { SectionHeading } from "./section-heading";

const REASONS = [
  {
    icon: ShieldCheck,
    title: "Engineered warranties",
    body: "Every panel, inverter and battery ships with a documented warranty — not a marketing promise.",
  },
  {
    icon: BadgeCheck,
    title: "Correctly sized systems",
    body: "We size every kit against your actual load, not a generic template, so you don't overpay or run short.",
  },
  {
    icon: Truck,
    title: "Nationwide delivery",
    body: "Tracked shipping to every state, with installer referrals for full-system orders.",
  },
  {
    icon: HeadphonesIcon,
    title: "Real support",
    body: "Talk to an engineer before and after you buy — not a ticket queue that goes nowhere.",
  },
];

export function WhyNovaSunHub() {
  return (
    <section className="relative border-y border-border bg-surface/60 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Why NovaSunHub" title="Solar that's engineered, not assembled" align="center" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((r) => (
            <div key={r.title} className="rounded-2xl border border-border bg-surface p-6 text-center transition hover:border-brand-400/40">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
                <r.icon size={22} />
              </div>
              <h3 className="mt-4 font-display text-sm font-semibold text-text">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
