import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, withErrorHandling, ApiError } from "@/lib/api-response";

export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: { id: string } }) => {
    const user = await requireUser();
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true, address: true },
    });
    if (!order || (order.userId !== user.id && user.role !== "ADMIN")) {
      throw new ApiError("Order not found", 404);
    }
    return ok(order);
  }
);
