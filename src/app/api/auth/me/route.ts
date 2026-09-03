import { getCurrentUser } from "@/lib/auth";
import { ok, withErrorHandling } from "@/lib/api-response";

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async () => {
  const user = await getCurrentUser();
  if (!user) return ok(null);
  return ok({ id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone });
});
