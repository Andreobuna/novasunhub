import { requireAdmin } from "@/lib/auth";
import { syncSupplierCatalog } from "@/lib/integrations/supplier";
import { ok, withErrorHandling } from "@/lib/api-response";

export const POST = withErrorHandling(async () => {
  await requireAdmin();
  const result = await syncSupplierCatalog();
  return ok(result);
});
