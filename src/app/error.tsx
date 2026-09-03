"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-24 sm:px-6">
      <EmptyState
        icon={<AlertTriangle size={40} />}
        title="Something went wrong"
        description="An unexpected error occurred. You can try again, or head back to the homepage."
        action={<Button onClick={reset}>Try again</Button>}
      />
    </div>
  );
}
