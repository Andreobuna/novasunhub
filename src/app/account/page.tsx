import Link from "next/link";
import { redirect } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/order-status-badge";
import { LogoutButton } from "@/components/account/logout-button";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const [orders, addresses] = await Promise.all([
    prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { items: true } }),
    prisma.address.findMany({ where: { userId: user.id }, orderBy: { isDefault: "desc" } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-text">My account</h1>
          <p className="mt-1 text-sm text-muted">{user.name} · {user.email}</p>
        </div>
        <div className="flex gap-2">
          {user.role === "ADMIN" && <ButtonLink href="/admin" variant="outline">Admin dashboard</ButtonLink>}
          <LogoutButton />
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr,320px]">
        <div>
          <h2 className="font-display text-lg font-semibold text-text">Order history</h2>

          {orders.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={<PackageSearch size={32} />}
                title="No orders yet"
                description="Once you check out, your orders will show up here."
                action={<ButtonLink href="/products">Start shopping</ButtonLink>}
              />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link href={`/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-3 p-5 transition hover:bg-surface-2">
                    <div>
                      <p className="font-mono text-sm text-text">{order.orderNumber}</p>
                      <p className="mt-1 text-xs text-muted">
                        {formatDate(order.createdAt)} · {order.items.length} item{order.items.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.status} />
                      <span className="font-display text-sm font-semibold text-text">{formatCurrency(order.total)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-text">Saved addresses</h2>
          {addresses.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No saved addresses yet — one is saved automatically at checkout.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {addresses.map((a) => (
                <li key={a.id} className="rounded-xl border border-border bg-surface p-4 text-sm">
                  <p className="font-medium text-text">{a.fullName}</p>
                  <p className="mt-1 text-muted">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state}, {a.country}
                  </p>
                  <p className="mt-1 text-muted">{a.phone}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
