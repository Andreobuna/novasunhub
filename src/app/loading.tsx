import { Skeleton } from "@/components/ui/skeleton";
import { SolarLoader } from "@/components/ui/solar-loader";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex justify-center py-6">
        <SolarLoader />
      </div>
      <Skeleton className="h-10 w-64" />
      <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
      </div>
    </div>
  );
}
