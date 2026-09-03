"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { apiFetch } from "@/lib/api-client";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/components/order-status-badge";
import { Select } from "@/components/ui/input";

const ORDER_STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const PAYMENT_STATUSES = ["UNPAID", "PAID", "FAILED", "REFUNDED"];

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: string;
  shippingCost: string;
  discountAmount: string;
  total: string;
  contactEmail: string;
  contactPhone: string | null;
  notes: string | null;
  createdAt: string;
  items: { id: string; productName: string; productSku: string; quantity: number; unitPrice: string; lineTotal: string }[];
  address: { fullName: string; phone: string; line1: string; line2: string | null; city: string; state: string; country: string } | null;
  user: { name: string; email: string; phone: string | null };
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    apiFetch<OrderDetail>(`/api/admin/orders/${params.id}`)
      .then(setOrder)
      .catch((err) => toast.error(err.message || "Failed to load order"))
      .finally(() => setLoading(false));
  }

  useEffect(load, [params.id]);

  async function updateStatus(field: "status" | "paymentStatus", value: string) {
    try {
      await apiFetch(`/api/admin/orders/${params.id}`, { method: "PATCH", body: JSON.stringify({ [field]: value }) });
      toast.success("Order updated");
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to update order");
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading order…</p>;
  if (!order) return <p className="text-sm text-muted">Order not found.</p>;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex gap-3">
          <div>
            <label className="mb-1 block text-xs text-muted">Order status</label>
            <Select value={order.status} onChange={(e) => updateStatus("status", e.target.value)} className="w-auto">
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Payment status</label>
            <Select value={order.paymentStatus} onChange={(e) => updateStatus("paymentStatus", e.target.value)} className="w-auto">
              {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-display text-base font-semibold text-text">Items</h2>
          <ul className="mt-4 divide-y divide-border">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between py-3 text-sm">
                <div>
                  <p className="text-text">{item.productName}</p>
                  <p className="text-xs text-muted">SKU: {item.productSku} · Qty {item.quantity} × {formatCurrency(item.unitPrice)}</p>
                </div>
                <span className="font-medium text-text">{formatCurrency(item.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="text-text">{formatCurrency(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd className="text-text">{formatCurrency(order.shippingCost)}</dd></div>
            {Number(order.discountAmount) > 0 && <div className="flex justify-between"><dt className="text-muted">Discount</dt><dd className="text-emerald-500">-{formatCurrency(order.discountAmount)}</dd></div>}
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><dt className="text-text">Total</dt><dd className="text-text">{formatCurrency(order.total)}</dd></div>
          </dl>

          {order.notes && (
            <div className="mt-4 rounded-xl bg-surface-2 p-3 text-sm text-muted">
              <p className="font-medium text-text">Order notes</p>
              {order.notes}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-display text-base font-semibold text-text">Customer</h2>
            <p className="mt-3 text-sm text-text">{order.user.name}</p>
            <p className="text-sm text-muted">{order.contactEmail}</p>
            {order.contactPhone && <p className="text-sm text-muted">{order.contactPhone}</p>}
          </div>

          {order.address && (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="font-display text-base font-semibold text-text">Shipping address</h2>
              <p className="mt-3 text-sm text-text">{order.address.fullName}</p>
              <p className="text-sm text-muted">
                {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city}, {order.address.state}, {order.address.country}
              </p>
              <p className="mt-1 text-sm text-muted">{order.address.phone}</p>
            </div>
          )}

          <div className="flex gap-2">
            <StatusBadge status={order.status} />
            <StatusBadge status={order.paymentStatus} />
          </div>
        </div>
      </div>
    </div>
  );
}
