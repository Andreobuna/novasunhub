"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Category { id: string; name: string; }
interface Brand { id: string; name: string; }

interface ImageRow { url: string; altText: string; isPrimary: boolean }
interface SpecRow { label: string; value: string }

export interface ProductFormValues {
  name: string;
  sku: string;
  categoryId: string;
  brandId: string;
  description: string;
  shortDescription: string;
  price: string;
  salePrice: string;
  stockQuantity: string;
  lowStockThreshold: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isFeatured: boolean;
  warranty: string;
  weightKg: string;
  dimensions: string;
  voltage: string;
  wattage: string;
  batteryCapacity: string;
  inverterCapacity: string;
  compatibility: string;
  installationInfo: string;
  metaTitle: string;
  metaDescription: string;
  images: ImageRow[];
  specifications: SpecRow[];
}

const EMPTY: ProductFormValues = {
  name: "", sku: "", categoryId: "", brandId: "", description: "", shortDescription: "",
  price: "", salePrice: "", stockQuantity: "0", lowStockThreshold: "5", status: "DRAFT",
  isFeatured: false, warranty: "", weightKg: "", dimensions: "", voltage: "", wattage: "",
  batteryCapacity: "", inverterCapacity: "", compatibility: "", installationInfo: "",
  metaTitle: "", metaDescription: "", images: [{ url: "", altText: "", isPrimary: true }],
  specifications: [{ label: "", value: "" }],
};

export function ProductForm({
  productId,
  initial,
}: {
  productId?: string;
  initial?: Partial<ProductFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>({ ...EMPTY, ...initial });
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<Category[]>("/api/categories").then(setCategories).catch(() => {});
    apiFetch<Brand[]>("/api/brands").then(setBrands).catch(() => {});
  }, []);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function updateImage(i: number, patch: Partial<ImageRow>) {
    set("images", values.images.map((img, idx) => (idx === i ? { ...img, ...patch } : img)));
  }
  function addImage() {
    set("images", [...values.images, { url: "", altText: "", isPrimary: false }]);
  }
  function removeImage(i: number) {
    set("images", values.images.filter((_, idx) => idx !== i));
  }

  function updateSpec(i: number, patch: Partial<SpecRow>) {
    set("specifications", values.specifications.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function addSpec() {
    set("specifications", [...values.specifications, { label: "", value: "" }]);
  }
  function removeSpec(i: number) {
    set("specifications", values.specifications.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent, statusOverride?: ProductFormValues["status"]) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: values.name,
        sku: values.sku,
        categoryId: values.categoryId,
        brandId: values.brandId || null,
        description: values.description,
        shortDescription: values.shortDescription || undefined,
        price: Number(values.price),
        salePrice: values.salePrice ? Number(values.salePrice) : null,
        currency: "NGN",
        stockQuantity: Number(values.stockQuantity),
        lowStockThreshold: Number(values.lowStockThreshold || 5),
        status: statusOverride || values.status,
        isFeatured: values.isFeatured,
        warranty: values.warranty || undefined,
        weightKg: values.weightKg ? Number(values.weightKg) : null,
        dimensions: values.dimensions || undefined,
        voltage: values.voltage || undefined,
        wattage: values.wattage || undefined,
        batteryCapacity: values.batteryCapacity || undefined,
        inverterCapacity: values.inverterCapacity || undefined,
        compatibility: values.compatibility || undefined,
        installationInfo: values.installationInfo || undefined,
        metaTitle: values.metaTitle || undefined,
        metaDescription: values.metaDescription || undefined,
        images: values.images.filter((i) => i.url.trim()).map((i) => ({ url: i.url, altText: i.altText || undefined, isPrimary: i.isPrimary })),
        specifications: values.specifications.filter((s) => s.label.trim() && s.value.trim()),
      };

      if (productId) {
        await apiFetch(`/api/admin/products/${productId}`, { method: "PATCH", body: JSON.stringify(payload) });
        toast.success("Product updated");
      } else {
        await apiFetch("/api/admin/products", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Product created");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Section title="Basic information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Product name" required>
            <Input required value={values.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="SKU" required>
            <Input required value={values.sku} onChange={(e) => set("sku", e.target.value)} />
          </Field>
          <Field label="Category" required>
            <Select required value={values.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Brand">
            <Select value={values.brandId} onChange={(e) => set("brandId", e.target.value)}>
              <option value="">No brand</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </Field>
          <Field label="Short description" className="sm:col-span-2">
            <Input value={values.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} placeholder="One-line summary shown on product cards" />
          </Field>
          <Field label="Full description" required className="sm:col-span-2">
            <Textarea required rows={5} value={values.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Pricing">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price (NGN)" required>
            <Input required type="number" min={0} step="0.01" value={values.price} onChange={(e) => set("price", e.target.value)} />
          </Field>
          <Field label="Sale price (NGN)" hint="Optional">
            <Input type="number" min={0} step="0.01" value={values.salePrice} onChange={(e) => set("salePrice", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Inventory">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Stock quantity" required>
            <Input required type="number" min={0} value={values.stockQuantity} onChange={(e) => set("stockQuantity", e.target.value)} />
          </Field>
          <Field label="Low stock threshold">
            <Input type="number" min={0} value={values.lowStockThreshold} onChange={(e) => set("lowStockThreshold", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Images">
        <div className="space-y-3">
          {values.images.map((img, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center">
              <Input placeholder="Image URL" value={img.url} onChange={(e) => updateImage(i, { url: e.target.value })} className="flex-1" />
              <Input placeholder="Alt text" value={img.altText} onChange={(e) => updateImage(i, { altText: e.target.value })} className="sm:w-56" />
              <label className="flex items-center gap-2 text-xs text-muted whitespace-nowrap">
                <input type="radio" name="primaryImage" checked={img.isPrimary} onChange={() => set("images", values.images.map((im, idx) => ({ ...im, isPrimary: idx === i })))} />
                Primary
              </label>
              <button type="button" onClick={() => removeImage(i)} className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-500">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addImage}><Plus size={14} /> Add image</Button>
        </div>
      </Section>

      <Section title="Specifications">
        <div className="space-y-3">
          {values.specifications.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input placeholder="Label (e.g. Wattage)" value={s.label} onChange={(e) => updateSpec(i, { label: e.target.value })} />
              <Input placeholder="Value (e.g. 550W)" value={s.value} onChange={(e) => updateSpec(i, { value: e.target.value })} />
              <button type="button" onClick={() => removeSpec(i)} className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-500">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addSpec}><Plus size={14} /> Add specification</Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Warranty"><Input value={values.warranty} onChange={(e) => set("warranty", e.target.value)} /></Field>
          <Field label="Voltage"><Input value={values.voltage} onChange={(e) => set("voltage", e.target.value)} /></Field>
          <Field label="Wattage"><Input value={values.wattage} onChange={(e) => set("wattage", e.target.value)} /></Field>
          <Field label="Battery capacity"><Input value={values.batteryCapacity} onChange={(e) => set("batteryCapacity", e.target.value)} /></Field>
          <Field label="Inverter capacity"><Input value={values.inverterCapacity} onChange={(e) => set("inverterCapacity", e.target.value)} /></Field>
          <Field label="Compatibility"><Input value={values.compatibility} onChange={(e) => set("compatibility", e.target.value)} /></Field>
        </div>
      </Section>

      <Section title="Shipping">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Weight (kg)"><Input type="number" min={0} step="0.1" value={values.weightKg} onChange={(e) => set("weightKg", e.target.value)} /></Field>
          <Field label="Dimensions"><Input placeholder="L × W × H mm" value={values.dimensions} onChange={(e) => set("dimensions", e.target.value)} /></Field>
          <Field label="Installation info" className="sm:col-span-2"><Textarea rows={3} value={values.installationInfo} onChange={(e) => set("installationInfo", e.target.value)} /></Field>
        </div>
      </Section>

      <Section title="SEO">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Meta title"><Input value={values.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} /></Field>
          <Field label="Meta description" className="sm:col-span-2"><Textarea rows={2} value={values.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} /></Field>
        </div>
      </Section>

      <Section title="Publishing">
        <div className="flex flex-wrap items-center gap-6">
          <Field label="Status">
            <Select value={values.status} onChange={(e) => set("status", e.target.value as any)}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          </Field>
          <label className="mt-6 flex items-center gap-2 text-sm text-text">
            <input type="checkbox" checked={values.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} className="h-4 w-4 rounded border-border accent-brand-500" />
            Feature on homepage
          </label>
        </div>
      </Section>

      <div className="flex justify-end gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : productId ? "Save changes" : "Create product"}</Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="font-display text-base font-semibold text-text">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, children, required, hint, className }: { label: string; children: React.ReactNode; required?: boolean; hint?: string; className?: string }) {
  return (
    <div className={className}>
      <Label hint={hint}>
        {label} {required && <span className="text-brand-400">*</span>}
      </Label>
      {children}
    </div>
  );
}
