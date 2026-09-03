import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, withErrorHandling, ApiError } from "@/lib/api-response";

export const DELETE = withErrorHandling(
  async (_req: NextRequest, { params }: { params: { id: string } }) => {
    const user = await requireUser();
    const address = await prisma.address.findUnique({ where: { id: params.id } });
    if (!address || address.userId !== user.id) throw new ApiError("Address not found", 404);
    await prisma.address.delete({ where: { id: params.id } });
    return ok({ deleted: true });
  }
);
