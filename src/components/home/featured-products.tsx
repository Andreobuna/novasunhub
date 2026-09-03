import { ProductCard, ProductCardData } from "@/components/products/product-card";
import { SectionHeading } from "./section-heading";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FeaturedProducts({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading
          eyebrow="Featured"
          title="Best-selling systems this month"
          description="The panels, batteries and kits our customers reorder most."
        />
        <ButtonLink href="/products?featured=true" variant="outline">
          View all featured <ArrowRight size={16} />
        </ButtonLink>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
