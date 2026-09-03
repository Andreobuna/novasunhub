import Link from "next/link";
import { AlertTriangle, DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/order-status-badge";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  const [totalProducts, totalCustomers, totalOrders, pendingOrders, revenueAgg, recentOrders, allProducts] =
    await Promise.all([
      prisma.product.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { user: { select: { name: true, email: true } }, items: true },
      }),
      prisma.product.findMany({
        select: { id: true, name: true, sku: true, stockQuantity: true, lowStockThreshold: true },
      }),
    ]);

  const lowStock = allProducts.filter((p) => p.stockQuantity <= p.lowStockThreshold).slice(0, 6);

  return {
    totalProducts,
    totalCustomers,
    totalOrders,
    pendingOrders,
    revenue: Number(revenueAgg._sum.total || 0),
    recentOrders,
    lowStock,
  };
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  const cards = [
    { label: "Total revenue (paid)", value: formatCurrency(data.revenue), icon: DollarSign, tone: "text-emerald-500 bg-emerald-500/10" },
    { label: "Total orders", value: data.totalOrders, icon: ShoppingCart, tone: "text-brand-400 bg-brand-500/10" },
    { label: "Total products", value: data.totalProducts, icon: Package, tone: "text-solar-500 bg-solar-500/10" },
    { label: "Total customers", value: data.totalCustomers, icon: Users, tone: "text-purple-400 bg-purple-500/10" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">A quick pulse on products, orders and revenue.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card-spotlight rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-brand-400/40">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.tone}`}>
              <c.icon size={18} />
            </div>
            <p className="mt-4 font-display text-2xl font-semibold text-text">{c.value}</p>
            <p className="mt-1 text-xs text-muted">{c.label}</p>
          </div>
        ))}
      </div>

      {data.pendingOrders > 0 && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
          <AlertTriangle size={16} />
          {data.pendingOrders} order{data.pendingOrders === 1 ? " is" : "s are"} pending review.{" "}
          <Link href="/admin/orders?status=PENDING" className="font-medium underline">View pending orders</Link>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-text">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-medium text-brand-400 hover:underline">View all</Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="pb-2 pr-4 font-medium">Order</th>
                  <th className="pb-2 pr-4 font-medium">Customer</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4">
                      <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs text-brand-400 hover:underline">
                        {o.orderNumber}
                      </Link>
                      <p className="text-xs text-muted">{formatDate(o.createdAt)}</p>
                    </td>
                    <td className="py-3 pr-4 text-text">{o.user?.name || "—"}</td>
                    <td className="py-3 pr-4"><StatusBadge status={o.status} /></td>
                    <td className="py-3 text-right font-medium text-text">{formatCurrency(o.total)}</td>
                  </tr>
                ))}
                {data.recentOrders.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-muted">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-text">Low stock alerts</h2>
            <Link href="/admin/products" className="text-sm font-medium text-brand-400 hover:underline">Manage</Link>
          </div>
          <ul className="mt-4 space-y-3">
            {data.lowStock.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-text">{p.name}</p>
                  <p className="text-xs text-muted">SKU: {p.sku}</p>
                </div>
                <Badge tone={p.stockQuantity === 0 ? "danger" : "warning"}>{p.stockQuantity} left</Badge>
              </li>
            ))}
            {data.lowStock.length === 0 && <p className="text-sm text-muted">All products are well stocked.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
