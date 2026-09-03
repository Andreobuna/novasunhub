import { Skeleton } from "@/components/ui/skeleton";
import { SolarLoader } from "@/components/ui/solar-loader";

export default function AdminLoading() {
  return (
    <div className="p-6">
      <div className="flex justify-center py-6">
        <SolarLoader label="Loading dashboard" size={56} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="mt-6 h-96 w-full" />
    </div>
  );
}
