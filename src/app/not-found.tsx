import { PackageSearch } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 sm:px-6">
      <EmptyState
        icon={<PackageSearch size={40} />}
        title="Page not found"
        description="The page you're looking for doesn't exist or may have moved."
        action={<ButtonLink href="/">Back to home</ButtonLink>}
      />
    </div>
  );
}
