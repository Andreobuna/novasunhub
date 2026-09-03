"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { apiFetch } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/order-status-badge";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: string;
  createdAt: string;
  user: { name: string; email: string };
  items: { id: string }[];
}

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <AdminOrdersPageInner />
    </Suspense>
  );
}

function AdminOrdersPageInner() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "15" });
      if (status) params.set("status", status);
      const res = await apiFetch<{ items: AdminOrder[]; pagination: { totalPages: number } }>(`/api/admin/orders?${params.toString()}`);
      setItems(res.items);
      setTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      toast.error(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page, status]);

  async function updateStatus(id: string, newStatus: string) {
    try {
      await apiFetch(`/api/admin/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status: newStatus }) });
      toast.success("Order status updated");
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to update order");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">Orders</h1>
          <p className="mt-1 text-sm text-muted">Track fulfillment and payment status across all orders.</p>
        </div>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-auto">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Payment</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Update</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-5 py-10 text-center text-muted">Loading orders…</td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-muted">No orders found</td></tr>}
            {!loading && items.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0 hover:bg-surface-2/60">
                <td className="px-5 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs text-brand-400 hover:underline">{o.orderNumber}</Link>
                  <p className="text-xs text-muted">{formatDate(o.createdAt)} · {o.items.length} item{o.items.length === 1 ? "" : "s"}</p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-text">{o.user?.name}</p>
                  <p className="text-xs text-muted">{o.user?.email}</p>
                </td>
                <td className="px-5 py-3 font-medium text-text">{formatCurrency(o.total)}</td>
                <td className="px-5 py-3"><StatusBadge status={o.paymentStatus} /></td>
                <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-5 py-3">
                  <Select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="w-auto py-1.5 text-xs">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="px-3 text-sm text-muted">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
