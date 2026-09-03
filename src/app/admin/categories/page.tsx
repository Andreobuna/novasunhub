"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  _count?: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await apiFetch<Category[]>("/api/admin/categories");
      setCategories(res);
    } catch (err: any) {
      toast.error(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing({ id: "", name: "", slug: "", description: "", image: "", sortOrder: categories.length });
    setModalOpen(true);
  }
  function openEdit(cat: Category) {
    setEditing(cat);
    setModalOpen(true);
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await apiFetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
      toast.success("Category deleted");
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">Categories</h1>
          <p className="mt-1 text-sm text-muted">Organize your catalog into shoppable categories.</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} /> Add category</Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <p className="text-sm text-muted">Loading categories…</p>}
        {!loading && categories.map((cat) => (
          <div key={cat.id} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-sm font-semibold text-text">{cat.name}</h3>
                <p className="mt-1 text-xs text-muted">/{cat.slug}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(cat)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-brand-400"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(cat)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
            {cat.description && <p className="mt-2 text-sm text-muted line-clamp-2">{cat.description}</p>}
            <p className="mt-3 text-xs text-muted">{cat._count?.products ?? 0} products</p>
          </div>
        ))}
      </div>

      {modalOpen && editing && (
        <CategoryModal
          category={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); load(); }}
        />
      )}
    </div>
  );
}

function CategoryModal({ category, onClose, onSaved }: { category: Category; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(category);
  const [saving, setSaving] = useState(false);
  const isNew = !category.id;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, description: form.description || undefined, image: form.image || undefined, sortOrder: form.sortOrder };
      if (isNew) {
        await apiFetch("/api/admin/categories", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Category created");
      } else {
        await apiFetch(`/api/admin/categories/${category.id}`, { method: "PATCH", body: JSON.stringify(payload) });
        toast.success("Category updated");
      }
      onSaved();
    } catch (err: any) {
      toast.error(err.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-text">{isNew ? "Add category" : "Edit category"}</h2>
          <button onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="catName">Name</Label>
            <Input id="catName" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="catDesc" hint="Optional">Description</Label>
            <Textarea id="catDesc" rows={3} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="catImage" hint="Optional">Image URL</Label>
            <Input id="catImage" value={form.image || ""} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
