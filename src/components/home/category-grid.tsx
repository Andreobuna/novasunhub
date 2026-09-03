import Link from "next/link";
import { Battery, Cable, Cpu, Home as HomeIcon, Lightbulb, PanelTop, PlugZap, Zap } from "lucide-react";
import { SectionHeading } from "./section-heading";

const ICONS: Record<string, any> = {
  "solar-panels": PanelTop,
  inverters: PlugZap,
  "solar-batteries": Battery,
  "charge-controllers": Cpu,
  "solar-lighting": Lightbulb,
  "power-stations": Zap,
  "solar-kits": HomeIcon,
  "accessories-cables": Cable,
};

export function CategoryGrid({ categories }: { categories: { name: string; slug: string; _count?: { products: number } }[] }) {
  if (categories.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Categories"
        title="Everything you need for one system"
        description="Mix and match, or start from a complete kit — every category is stocked, specced and ready to ship."
      />
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => {
          const Icon = ICONS[cat.slug] || Zap;
          return (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-1 hover:border-brand-400/50 hover:shadow-glow"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                <Icon size={20} />
              </div>
              <h3 className="mt-4 font-display text-sm font-semibold text-text">{cat.name}</h3>
              {typeof cat._count?.products === "number" && (
                <p className="mt-1 text-xs text-muted">{cat._count.products} products</p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
