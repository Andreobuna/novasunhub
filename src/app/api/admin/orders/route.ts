import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, withErrorHandling } from "@/lib/api-response";

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requireAdmin();
  const params = req.nextUrl.searchParams;
  const status = params.get("status") || undefined;
  const page = Math.max(1, Number(params.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(params.get("pageSize") || 20)));

  const where = status ? { status: status as any } : {};

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { items: true, user: { select: { name: true, email: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  return ok({ items, pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } });
});
