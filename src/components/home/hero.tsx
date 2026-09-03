"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { HeroScene } from "@/components/three/hero-scene";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="aurora-bg" />
      <div className="noise-overlay" />
      <div className="solar-grid absolute inset-0 opacity-70" />
      <div className="glow-orb absolute -left-40 top-10 h-96 w-96 rounded-full" />
      <div className="glow-orb absolute -right-32 top-40 h-72 w-72 rounded-full opacity-70" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3.5 py-1.5 text-xs font-medium text-muted">
            <Zap size={13} className="text-solar-500" />
            Engineered for Nigeria's grid — panels to complete systems
          </span>

          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-text sm:text-5xl lg:text-[3.4rem]">
            <span className="gradient-text">Independence</span> from the grid, engineered to last decades.
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            NovaSunHub designs and ships complete solar systems — panels, hybrid
            inverters and lithium storage — sized correctly the first time, backed
            by real warranties and a team that answers the phone.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink href="/products" size="lg">
              Shop solar systems
              <ArrowRight size={16} />
            </ButtonLink>
            <ButtonLink href="/products?category=solar-kits" size="lg" variant="outline">
              Explore complete kits
            </ButtonLink>
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-6">
            {[
              ["25 yr", "Panel performance warranty"],
              ["4.9★", "Average customer rating"],
              ["12k+", "Systems shipped"],
            ].map(([value, label]) => (
              <div key={label as string}>
                <dt className="font-display text-2xl font-semibold text-text">{value}</dt>
                <dd className="mt-1 text-xs leading-snug text-muted">{label}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          className="relative mx-auto aspect-square w-full max-w-md"
        >
          <HeroArt />
        </motion.div>
      </div>
    </section>
  );
}

function HeroArt() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <HeroScene />
      <div className="absolute h-[85%] w-[85%] animate-spin-slow rounded-full border border-dashed border-border" />
      <div className="absolute h-[62%] w-[62%] rounded-full border border-border" />

      <div className="gradient-border glass relative flex h-52 w-52 flex-col items-center justify-center rounded-3xl shadow-glow-lg sm:h-64 sm:w-64">
        <span className="animate-pulse-ring absolute h-full w-full rounded-3xl border border-brand-400/60" />
        <Zap size={40} className="text-solar-500" />
        <p className="mt-3 font-display text-2xl font-semibold text-text">8.4 kW</p>
        <p className="text-xs text-muted">Live system output</p>
      </div>

      {[
        { label: "Panels", pos: "top-2 left-4", delay: 0 },
        { label: "Battery 92%", pos: "bottom-6 right-0", delay: 0.5 },
        { label: "Grid: Off", pos: "bottom-2 left-2", delay: 1 },
      ].map((chip) => (
        <motion.div
          key={chip.label}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, delay: chip.delay, ease: "easeInOut" }}
          className={`glass absolute ${chip.pos} rounded-full px-3 py-1.5 text-xs font-medium text-text shadow-card`}
        >
          {chip.label}
        </motion.div>
      ))}
    </div>
  );
}
