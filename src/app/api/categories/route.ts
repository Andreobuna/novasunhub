import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";

export const GET = withErrorHandling(async () => {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { status: "PUBLISHED" } } } } },
  });
  return ok(categories);
});
