"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, motion } from "framer-motion";

const STATS = [
  { value: 12400, suffix: "+", label: "Solar systems shipped" },
  { value: 480, suffix: "MW", label: "Cumulative capacity installed" },
  { value: 99.4, suffix: "%", label: "On-time delivery rate", decimals: 1 },
  { value: 36, suffix: "", label: "States covered" },
];

function Counter({ value, suffix, decimals = 0 }: { value: number; suffix: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <span ref={ref} className="font-display text-4xl font-semibold text-text sm:text-5xl">
      {display.toFixed(decimals)}
      <span className="text-brand-400">{suffix}</span>
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-8 rounded-3xl border border-border bg-surface p-8 sm:p-12 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="text-center"
          >
            <Counter value={s.value} suffix={s.suffix} decimals={s.decimals} />
            <p className="mt-2 text-sm text-muted">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
