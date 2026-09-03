import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { addressSchema } from "@/lib/validation";
import { ok, created, fail, withErrorHandling } from "@/lib/api-response";

export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  const addresses = await prisma.address.findMany({ where: { userId: user.id }, orderBy: { isDefault: "desc" } });
  return ok(addresses);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const body = await req.json();
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid address", 422, parsed.error.flatten());

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  }

  const address = await prisma.address.create({ data: { ...parsed.data, userId: user.id } });
  return created(address);
});
