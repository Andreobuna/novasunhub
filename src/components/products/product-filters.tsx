"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Select } from "@/components/ui/input";

interface Category {
  id: string;
  name: string;
  slug: string;
}
interface Brand {
  id: string;
  name: string;
  slug: string;
}

export function ProductFilters({ categories, brands }: { categories: Category[]; brands: Brand[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const [minPrice, setMinPrice] = useState(params.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") || "");

  useEffect(() => {
    setMinPrice(params.get("minPrice") || "");
    setMaxPrice(params.get("maxPrice") || "");
  }, [params]);

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`/products?${next.toString()}`);
  }

  function applyPriceRange(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (minPrice) next.set("minPrice", minPrice);
    else next.delete("minPrice");
    if (maxPrice) next.set("maxPrice", maxPrice);
    else next.delete("maxPrice");
    next.delete("page");
    router.push(`/products?${next.toString()}`);
    setOpen(false);
  }

  function clearAll() {
    router.push("/products");
    setOpen(false);
  }

  const activeCount = ["category", "brand", "minPrice", "maxPrice", "inStock"].filter((k) => params.get(k)).length;

  const content = (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="mb-2 text-sm font-semibold text-text">Category</h4>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => update("category", null)}
            className={`rounded-lg px-2.5 py-1.5 text-left text-sm ${!params.get("category") ? "bg-brand-500/10 text-brand-400" : "text-muted hover:bg-surface-2"}`}
          >
            All categories
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => update("category", c.slug)}
              className={`rounded-lg px-2.5 py-1.5 text-left text-sm ${params.get("category") === c.slug ? "bg-brand-500/10 text-brand-400" : "text-muted hover:bg-surface-2"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-text">Brand</h4>
        <Select value={params.get("brand") || ""} onChange={(e) => update("brand", e.target.value || null)}>
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </Select>
      </div>

      <form onSubmit={applyPriceRange}>
        <h4 className="mb-2 text-sm font-semibold text-text">Price range (₦)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
        </div>
        <button type="submit" className="mt-2 text-sm font-medium text-brand-400 hover:underline">
          Apply price range
        </button>
      </form>

      <label className="flex items-center gap-2 text-sm text-text">
        <input
          type="checkbox"
          checked={params.get("inStock") === "true"}
          onChange={(e) => update("inStock", e.target.checked ? "true" : null)}
          className="h-4 w-4 rounded border-border accent-brand-500"
        />
        In stock only
      </label>

      {activeCount > 0 && (
        <button onClick={clearAll} className="text-sm font-medium text-muted hover:text-red-500">
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mb-4 flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-text lg:hidden"
      >
        <SlidersHorizontal size={15} /> Filters {activeCount > 0 && `(${activeCount})`}
      </button>

      <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0">{content}</aside>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto bg-bg p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-text">Filters</h3>
              <button onClick={() => setOpen(false)} aria-label="Close filters">
                <X size={20} />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
