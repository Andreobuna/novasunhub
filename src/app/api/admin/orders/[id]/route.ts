import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { orderStatusSchema } from "@/lib/validation";
import { ok, fail, withErrorHandling, ApiError } from "@/lib/api-response";

export const GET = withErrorHandling(
  async (_req: NextRequest, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true, address: true, user: { select: { name: true, email: true, phone: true } } },
    });
    if (!order) throw new ApiError("Order not found", 404);
    return ok(order);
  }
);

export const PATCH = withErrorHandling(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const body = await req.json();
    const parsed = orderStatusSchema.safeParse(body);
    if (!parsed.success) return fail("Invalid status update", 422, parsed.error.flatten());

    const existing = await prisma.order.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError("Order not found", 404);

    // If cancelling an order that was never fulfilled, restock the items.
    if (parsed.data.status === "CANCELLED" && existing.status !== "CANCELLED") {
      const items = await prisma.orderItem.findMany({ where: { orderId: params.id } });
      await prisma.$transaction(
        items.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } },
          })
        )
      );
    }

    const order = await prisma.order.update({ where: { id: params.id }, data: parsed.data });
    return ok(order);
  }
);
