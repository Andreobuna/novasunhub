"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

interface AdminProduct {
  id: string;
  name: string;
  sku: string;
  price: string;
  status: string;
  stockQuantity: number;
  images: { url: string }[];
  category: { name: string };
}

export default function AdminProductsPage() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "15" });
      if (q) params.set("q", q);
      if (status) params.set("status", status);
      const res = await apiFetch<{ items: AdminProduct[]; pagination: { totalPages: number } }>(
        `/api/admin/products?${params.toString()}`
      );
      setItems(res.items);
      setTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      toast.error(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    load();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone unless the product has past orders.`)) return;
    try {
      const result = await apiFetch<{ deleted?: boolean; archived?: boolean; message?: string }>(
        `/api/admin/products/${id}`,
        { method: "DELETE" }
      );
      toast.success(result.message || "Product deleted");
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">Products</h1>
          <p className="mt-1 text-sm text-muted">Manage your catalog, stock and pricing.</p>
        </div>
        <ButtonLink href="/admin/products/new">
          <Plus size={16} /> Add product
        </ButtonLink>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-3">
          <Search size={16} className="text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or SKU…"
            className="w-full bg-transparent py-2.5 text-sm outline-none"
          />
        </form>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-auto">
          <option value="">All statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </Select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Stock</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-muted">Loading products…</td></tr>
            )}
            {!loading && items.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10"><EmptyState title="No products found" description="Try a different search or add your first product." /></td></tr>
            )}
            {!loading && items.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface-2/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-surface-2">
                      {p.images[0] && <Image src={p.images[0].url} alt={p.name} fill className="object-cover" />}
                    </div>
                    <div>
                      <p className="font-medium text-text">{p.name}</p>
                      <p className="text-xs text-muted">SKU: {p.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted">{p.category?.name}</td>
                <td className="px-5 py-3 text-text">{formatCurrency(p.price)}</td>
                <td className="px-5 py-3">
                  <Badge tone={p.stockQuantity === 0 ? "danger" : p.stockQuantity <= 5 ? "warning" : "default"}>
                    {p.stockQuantity}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <Badge tone={p.status === "PUBLISHED" ? "success" : p.status === "DRAFT" ? "warning" : "default"}>
                    {p.status}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/products/${p.id}/edit`} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-brand-400" aria-label={`Edit ${p.name}`}>
                      <Pencil size={15} />
                    </Link>
                    <button onClick={() => handleDelete(p.id, p.name)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-500" aria-label={`Delete ${p.name}`}>
                      <Trash2 size={15} />
                    </button>
                  </div>
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
