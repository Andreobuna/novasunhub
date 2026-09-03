import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { verifyPaystackTransaction } from "@/lib/integrations/paystack";
import { ok, fail, withErrorHandling, ApiError } from "@/lib/api-response";

/**
 * GET /api/payments/paystack/verify/[reference]
 *
 * Fallback for when a customer lands back on the order-confirmation page
 * before Paystack's webhook has landed (webhooks are usually near-instant
 * but aren't guaranteed to beat the redirect). Polls Paystack directly and
 * reconciles the order the same way the webhook does, so whichever arrives
 * first wins and the other becomes a no-op.
 */
export const GET = withErrorHandling(
  async (_req: NextRequest, { params }: { params: { reference: string } }) => {
    const user = await requireUser();

    const order = await prisma.order.findFirst({ where: { paymentRef: params.reference } });
    if (!order) throw new ApiError("Order not found", 404);
    if (order.userId !== user.id && user.role !== "ADMIN") {
      throw new ApiError("Order not found", 404);
    }

    // Already reconciled (most likely by the webhook) — nothing to do.
    if (order.paymentStatus !== "UNPAID") {
      return ok({ paymentStatus: order.paymentStatus, status: order.status });
    }

    const verification = await verifyPaystackTransaction(params.reference);
    if (!verification.ok) {
      return fail(verification.reason, 502);
    }

    if (verification.status === "success") {
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "PAID", status: order.status === "PENDING" ? "PAID" : order.status },
      });
      return ok({ paymentStatus: updated.paymentStatus, status: updated.status });
    }

    if (verification.status === "failed" || verification.status === "abandoned") {
      const items = await prisma.orderItem.findMany({ where: { orderId: order.id } });
      const [updated] = await prisma.$transaction([
        prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } }),
        ...items.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } },
          })
        ),
      ]);
      return ok({ paymentStatus: updated.paymentStatus, status: order.status });
    }

    // Still pending on Paystack's side (e.g. customer hasn't completed the
    // charge yet) — report as-is, no DB change.
    return ok({ paymentStatus: order.paymentStatus, status: order.status });
  }
);
