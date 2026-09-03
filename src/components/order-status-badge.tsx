import { Badge } from "@/components/ui/badge";

const STATUS_TONES: Record<string, "default" | "brand" | "success" | "warning" | "danger"> = {
  PENDING: "warning",
  PAID: "brand",
  PROCESSING: "brand",
  SHIPPED: "success",
  DELIVERED: "success",
  CANCELLED: "danger",
  UNPAID: "warning",
  FAILED: "danger",
  REFUNDED: "default",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONES[status] || "default"}>{status.charAt(0) + status.slice(1).toLowerCase()}</Badge>;
}
