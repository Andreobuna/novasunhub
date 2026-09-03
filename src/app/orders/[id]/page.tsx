import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/components/order-status-badge";
import { ButtonLink } from "@/components/ui/button";
import { PaymentVerifier } from "@/components/orders/payment-verifier";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/orders/${params.id}`);

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, address: true },
  });

  if (!order || (order.userId !== user.id && user.role !== "ADMIN")) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 size={28} />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold text-text">Order placed successfully</h1>
        <p className="mt-1 text-sm text-muted">
          Order <span className="font-mono text-text">{order.orderNumber}</span> · Placed {formatDateTime(order.createdAt)}
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <StatusBadge status={order.status} />
            <StatusBadge status={order.paymentStatus} />
          </div>
          <span className="text-sm text-muted">{order.contactEmail}</span>
        </div>

        <ul className="mt-6 divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-3 text-sm">
              <span className="text-text">
                {item.productName} <span className="text-muted">× {item.quantity}</span>
              </span>
              <span className="text-text">{formatCurrency(item.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="text-text">{formatCurrency(order.subtotal)}</dd>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted">Discount</dt>
              <dd className="text-emerald-500">-{formatCurrency(order.discountAmount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd className="text-text">{formatCurrency(order.shippingCost)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
            <dt className="text-text">Total</dt>
            <dd className="text-text">{formatCurrency(order.total)}</dd>
          </div>
        </dl>

        {order.address && (
          <div className="mt-6 border-t border-border pt-4 text-sm">
            <p className="font-medium text-text">Shipping to</p>
            <p className="mt-1 text-muted">
              {order.address.fullName}, {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city}, {order.address.state}, {order.address.country}
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <ButtonLink href="/account">View all orders</ButtonLink>
        <ButtonLink href="/products" variant="outline">
          Continue shopping
        </ButtonLink>
      </div>

      {order.paymentStatus === "UNPAID" && order.paymentProvider === "paystack" && order.paymentRef && (
        <PaymentVerifier paymentRef={order.paymentRef} paymentStatus={order.paymentStatus} />
      )}
      {order.paymentStatus === "UNPAID" && order.paymentProvider !== "paystack" && (
        <p className="mt-6 text-center text-xs text-muted">
          Payment provider isn't configured yet — this order is pending manual payment confirmation from our team.
        </p>
      )}
      <p className="mt-3 text-center">
        <Link href="/contact" className="text-xs text-muted hover:text-brand-400">Need help with this order? Contact us</Link>
      </p>
    </div>
  );
}
