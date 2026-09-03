import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { categorySchema } from "@/lib/validation";
import { ok, fail, withErrorHandling, ApiError } from "@/lib/api-response";

export const PATCH = withErrorHandling(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const body = await req.json();
    const parsed = categorySchema.partial().safeParse(body);
    if (!parsed.success) return fail("Invalid category data", 422, parsed.error.flatten());

    const existing = await prisma.category.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError("Category not found", 404);

    const category = await prisma.category.update({ where: { id: params.id }, data: parsed.data as any });
    return ok(category);
  }
);

export const DELETE = withErrorHandling(
  async (_req: NextRequest, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const inUse = await prisma.product.findFirst({ where: { categoryId: params.id } });
    if (inUse) throw new ApiError("Cannot delete a category that still has products. Reassign products first.", 409);
    await prisma.category.delete({ where: { id: params.id } });
    return ok({ deleted: true });
  }
);
