import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, withErrorHandling } from "@/lib/api-response";

export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true, address: true },
  });
  return ok(orders);
});
