import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { SolarLoader } from "@/components/ui/solar-loader";

export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex justify-center py-4">
        <SolarLoader label="Fetching products" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
