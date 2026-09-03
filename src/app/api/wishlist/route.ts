import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, fail, withErrorHandling } from "@/lib/api-response";

export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    include: { product: { include: { images: { take: 1, orderBy: { position: "asc" } } } } },
  });
  return ok(items);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const { productId } = await req.json();
  if (!productId) return fail("productId is required", 422);
  const item = await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    update: {},
    create: { userId: user.id, productId },
  });
  return ok(item, 201);
});
