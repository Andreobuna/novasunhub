import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductGrid } from "@/components/products/product-grid";

export const metadata: Metadata = {
  title: "Shop Solar Panels, Inverters & Batteries",
  description: "Browse NovaSunHub's full catalog of solar panels, inverters, batteries, power stations and complete solar kits.",
};

export const revalidate = 60;

async function getFilterData() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true, slug: true } }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } }),
  ]);
  return { categories, brands };
}

export default async function ProductsPage() {
  const { categories, brands } = await getFilterData();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-text">Shop the full catalog</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Panels, inverters, batteries, controllers, lighting, power stations and complete kits — every product ships with real specs and stock levels.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <Suspense>
          <ProductFilters categories={categories} brands={brands} />
        </Suspense>
        <Suspense>
          <ProductGrid />
        </Suspense>
      </div>
    </div>
  );
}
