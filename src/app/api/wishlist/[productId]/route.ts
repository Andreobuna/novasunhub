import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, withErrorHandling } from "@/lib/api-response";

export const DELETE = withErrorHandling(
  async (_req: NextRequest, { params }: { params: { productId: string } }) => {
    const user = await requireUser();
    await prisma.wishlistItem.deleteMany({ where: { userId: user.id, productId: params.productId } });
    return ok({ deleted: true });
  }
);
