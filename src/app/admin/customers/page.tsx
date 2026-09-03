"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Search } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  orderCount: number;
  lifetimeValue: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      const res = await apiFetch<Customer[]>(`/api/admin/customers?${params.toString()}`);
      setCustomers(res);
    } catch (err: any) {
      toast.error(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text">Customers</h1>
      <p className="mt-1 text-sm text-muted">View registered customers, order counts and lifetime value.</p>

      <form
        onSubmit={(e) => { e.preventDefault(); load(); }}
        className="mt-6 flex max-w-sm items-center gap-2 rounded-xl border border-border bg-surface px-3"
      >
        <Search size={16} className="text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email…" className="w-full bg-transparent py-2.5 text-sm outline-none" />
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Registered</th>
              <th className="px-5 py-3 font-medium">Orders</th>
              <th className="px-5 py-3 font-medium">Lifetime value</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="px-5 py-10 text-center text-muted">Loading customers…</td></tr>}
            {!loading && customers.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-muted">No customers found</td></tr>}
            {!loading && customers.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3">
                  <p className="text-text">{c.name}</p>
                  <p className="text-xs text-muted">{c.email}</p>
                </td>
                <td className="px-5 py-3 text-muted">{formatDate(c.createdAt)}</td>
                <td className="px-5 py-3 text-text">{c.orderCount}</td>
                <td className="px-5 py-3 text-text">{formatCurrency(c.lifetimeValue)}</td>
                <td className="px-5 py-3"><Badge tone={c.status === "ACTIVE" ? "success" : "danger"}>{c.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
