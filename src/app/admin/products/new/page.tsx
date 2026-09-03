import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text">Add product</h1>
      <p className="mt-1 text-sm text-muted">Fill in the details below — you can save as a draft and publish later.</p>
      <div className="mt-6 max-w-4xl">
        <ProductForm />
      </div>
    </div>
  );
}
