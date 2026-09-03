import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, withErrorHandling } from "@/lib/api-response";

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async () => {
  await requireAdmin();

  const [
    totalProducts,
    totalCustomers,
    totalOrders,
    pendingOrders,
    completedOrders,
    recentOrders,
    revenueAgg,
    allProducts,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { name: true, email: true } }, items: true },
    }),
    prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        stockQuantity: true,
        lowStockThreshold: true,
        images: { take: 1, orderBy: { position: "asc" } },
      },
    }),
  ]);

  const lowStock = allProducts.filter((p) => p.stockQuantity <= p.lowStockThreshold).slice(0, 10);

  let salesByDay: { day: string; total: number }[] = [];
  try {
    salesByDay = await prisma.$queryRawUnsafe<{ day: string; total: number }[]>(
      `SELECT to_char("createdAt", 'YYYY-MM-DD') as day, SUM(total)::float as total
       FROM "Order"
       WHERE "createdAt" > NOW() - INTERVAL '14 days'
       GROUP BY day ORDER BY day ASC`
    );
  } catch {
    salesByDay = [];
  }

  return ok({
    totals: {
      products: totalProducts,
      customers: totalCustomers,
      orders: totalOrders,
      revenue: Number(revenueAgg._sum.total || 0),
      pendingOrders,
      completedOrders,
    },
    lowStock,
    recentOrders,
    salesByDay,
  });
});
