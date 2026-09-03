import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";

export const GET = withErrorHandling(async () => {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
  return ok(brands);
});
