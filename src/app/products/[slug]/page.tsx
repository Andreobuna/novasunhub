import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductBuyBox } from "@/components/products/product-buy-box";
import { ProductCard } from "@/components/products/product-card";
import { Truck, ShieldCheck, PackageCheck } from "lucide-react";

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      specifications: { orderBy: { position: "asc" } },
      category: true,
      brand: true,
      reviews: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!product || product.status !== "PUBLISHED") return null;

  const related = await prisma.product.findMany({
    where: { status: "PUBLISHED", categoryId: product.categoryId, id: { not: product.id } },
    take: 4,
    include: { images: { take: 1, orderBy: { position: "asc" } }, category: true },
  });

  return { product, related };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getProduct(params.slug);
  if (!data) return { title: "Product not found" };
  const { product } = data;
  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDescription || product.description.slice(0, 155),
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription || undefined,
      images: product.images[0] ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const data = await getProduct(params.slug);
  if (!data) notFound();
  const { product, related } = data;

  const price = Number(product.price);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;

  const specRows = [
    ["Wattage", product.wattage],
    ["Voltage", product.voltage],
    ["Battery capacity", product.batteryCapacity],
    ["Inverter capacity", product.inverterCapacity],
    ["Weight", product.weightKg ? `${product.weightKg} kg` : null],
    ["Dimensions", product.dimensions],
    ["Compatibility", product.compatibility],
    ["Warranty", product.warranty],
  ].filter(([, v]) => v);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-xs text-muted">
        <span>Shop</span> <span className="mx-1.5">/</span>
        <span>{product.category.name}</span> <span className="mx-1.5">/</span>
        <span className="text-text">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          {product.brand && <p className="text-sm font-medium text-brand-400">{product.brand.name}</p>}
          <h1 className="mt-1 font-display text-2xl font-semibold text-text sm:text-3xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <StarRating rating={Number(product.avgRating)} count={product.reviewCount} />
            <span className="text-xs text-muted">SKU: {product.sku}</span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl font-semibold text-text">
              {formatCurrency(salePrice ?? price, product.currency)}
            </span>
            {salePrice && (
              <>
                <span className="text-lg text-muted line-through">{formatCurrency(price, product.currency)}</span>
                <Badge tone="warning">Save {Math.round(((price - salePrice) / price) * 100)}%</Badge>
              </>
            )}
          </div>

          <p className="mt-1 text-sm">
            {product.stockQuantity > 0 ? (
              <span className="text-emerald-500">In stock — {product.stockQuantity} available</span>
            ) : (
              <span className="text-red-500">Out of stock</span>
            )}
          </p>

          {product.shortDescription && <p className="mt-4 text-sm leading-relaxed text-muted">{product.shortDescription}</p>}

          <div className="mt-6">
            <ProductBuyBox
              productId={product.id}
              name={product.name}
              slug={product.slug}
              image={product.images[0]?.url ?? null}
              unitPrice={salePrice ?? price}
              stockQuantity={product.stockQuantity}
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 border-t border-border pt-6 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-xs text-muted">
              <Truck size={16} className="text-brand-400" /> Nationwide delivery
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <ShieldCheck size={16} className="text-brand-400" /> {product.warranty || "Manufacturer warranty"}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <PackageCheck size={16} className="text-brand-400" /> Quality checked before dispatch
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-[2fr,1fr]">
        <div>
          <h2 className="font-display text-xl font-semibold text-text">Description</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">{product.description}</p>

          {product.installationInfo && (
            <>
              <h3 className="mt-8 font-display text-lg font-semibold text-text">Installation</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{product.installationInfo}</p>
            </>
          )}
        </div>

        {specRows.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-semibold text-text">Technical specifications</h2>
            <dl className="mt-3 divide-y divide-border rounded-xl border border-border bg-surface">
              {specRows.map(([label, value]) => (
                <div key={label as string} className="flex justify-between gap-4 px-4 py-3 text-sm">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-right font-medium text-text">{value}</dd>
                </div>
              ))}
            </dl>
            {product.specifications.length > 0 && (
              <dl className="mt-3 divide-y divide-border rounded-xl border border-border bg-surface">
                {product.specifications.map((s) => (
                  <div key={s.id} className="flex justify-between gap-4 px-4 py-3 text-sm">
                    <dt className="text-muted">{s.label}</dt>
                    <dd className="text-right font-medium text-text">{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-xl font-semibold text-text">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
