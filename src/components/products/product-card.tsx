"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { toast } from "react-hot-toast";
import { formatCurrency } from "@/lib/format";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart-store";
import { useTilt } from "@/hooks/use-tilt";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  salePrice?: number | string | null;
  currency: string;
  stockQuantity: number;
  avgRating: number | string;
  reviewCount: number;
  images: { url: string; altText?: string | null }[];
  category?: { name: string } | null;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const addItem = useCartStore((s) => s.addItem);
  const reducedMotion = useReducedMotion();
  const tilt = useTilt<HTMLAnchorElement>({ max: 8, scale: 1.02, disabled: reducedMotion });
  const price = Number(product.price);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const image = product.images[0]?.url;
  const outOfStock = product.stockQuantity <= 0;

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    const result = addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: image ?? null,
        unitPrice: salePrice ?? price,
        stockQuantity: product.stockQuantity,
      },
      1
    );
    if (result.ok) toast.success(`${product.name} added to cart`);
    else toast.error(result.message || "Could not add to cart");
  }

  return (
    <Link
      ref={tilt.ref}
      href={`/products/${product.slug}`}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={{ transformStyle: "preserve-3d" }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,box-shadow] duration-150 ease-out will-change-transform hover:border-brand-400/50 hover:shadow-glow"
    >
      {/* Cursor-tracking sheen — purely decorative, ignored by reduced-motion users since the tilt handlers never fire for them. */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(280px circle at var(--tilt-x, 50%) var(--tilt-y, 50%), rgb(151 87 255 / 0.16), transparent 65%)",
        }}
      />
      <div className="relative aspect-square w-full overflow-hidden bg-surface-2">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">No image</div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {salePrice && <Badge tone="warning">Sale</Badge>}
          {outOfStock && <Badge tone="danger">Out of stock</Badge>}
        </div>

        <button
          onClick={quickAdd}
          disabled={outOfStock}
          aria-label={`Add ${product.name} to cart`}
          className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-brand-500 text-white opacity-0 shadow-glow transition-all duration-300 hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <ShoppingCart size={16} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.category && <p className="text-xs font-medium text-brand-400">{product.category.name}</p>}
        <h3 className="mt-1 line-clamp-2 font-display text-sm font-semibold leading-snug text-text">{product.name}</h3>
        <div className="mt-2">
          <StarRating rating={Number(product.avgRating)} count={product.reviewCount} size={13} />
        </div>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="font-display text-base font-semibold text-text">
            {formatCurrency(salePrice ?? price, product.currency)}
          </span>
          {salePrice && (
            <span className="text-xs text-muted line-through">{formatCurrency(price, product.currency)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
