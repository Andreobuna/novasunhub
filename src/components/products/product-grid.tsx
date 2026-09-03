"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { ProductCard, ProductCardData } from "./product-card";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";

interface ProductsResponse {
  items: ProductCardData[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export function ProductGrid() {
  const router = useRouter();
  const params = useSearchParams();
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    apiFetch<ProductsResponse>(`/api/products?${params.toString()}`)
      .then((res) => active && setData(res))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [params]);

  function updateSort(value: string) {
    const next = new URLSearchParams(params.toString());
    next.set("sort", value);
    next.delete("page");
    router.push(`/products?${next.toString()}`);
  }

  function goToPage(page: number) {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(page));
    router.push(`/products?${next.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex-1">
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {loading ? "Loading products…" : data ? `${data.pagination.total} product${data.pagination.total === 1 ? "" : "s"}` : ""}
        </p>
        <Select
          value={params.get("sort") || "newest"}
          onChange={(e) => updateSort(e.target.value)}
          className="w-auto"
          aria-label="Sort products"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="name-asc">Name: A–Z</option>
        </Select>
      </div>

      {error && (
        <EmptyState title="Couldn't load products" description={error} />
      )}

      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && !error && data && data.items.length === 0 && (
        <EmptyState
          icon={<PackageSearch size={36} />}
          title="No products match your filters"
          description="Try widening your price range or clearing a filter."
        />
      )}

      {!loading && !error && data && data.items.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {data.pagination.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.pagination.page <= 1}
                onClick={() => goToPage(data.pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="px-3 text-sm text-muted">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={data.pagination.page >= data.pagination.totalPages}
                onClick={() => goToPage(data.pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
