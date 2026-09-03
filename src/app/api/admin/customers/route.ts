import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, withErrorHandling } from "@/lib/api-response";

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requireAdmin();
  const params = req.nextUrl.searchParams;
  const q = params.get("q")?.trim();

  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(q
        ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      orders: { select: { id: true, total: true, status: true } },
    },
  });

  const withTotals = customers.map((c) => ({
    ...c,
    orderCount: c.orders.length,
    lifetimeValue: c.orders.reduce((sum, o) => sum + Number(o.total), 0),
    orders: undefined,
  }));

  return ok(withTotals);
});
