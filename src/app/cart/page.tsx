"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/format";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function CartPage() {
  const { items, removeItem, setQuantity, subtotal } = useCartStore();

  function changeQty(productId: string, quantity: number) {
    const result = setQuantity(productId, quantity);
    if (!result.ok && result.message) toast.error(result.message);
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <EmptyState
          icon={<ShoppingBag size={36} />}
          title="Your cart is empty"
          description="Browse the catalog and add a panel, battery or complete kit to get started."
          action={<ButtonLink href="/products">Shop products</ButtonLink>}
        />
      </div>
    );
  }

  const shippingEstimate = 5000;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-text">Your cart</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr,380px]">
        <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 p-4 sm:p-5">
              <Link href={`/products/${item.slug}`} className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-surface-2">
                {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/products/${item.slug}`} className="font-display text-sm font-semibold text-text hover:text-brand-400">
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-muted hover:text-red-500"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p className="mt-1 text-sm text-muted">{formatCurrency(item.unitPrice)} each</p>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center gap-1 rounded-lg border border-border p-1">
                    <button
                      onClick={() => changeQty(item.productId, item.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-surface-2"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => changeQty(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stockQuantity}
                      className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-surface-2 disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="font-display text-sm font-semibold text-text">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-display text-lg font-semibold text-text">Order summary</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="text-text">{formatCurrency(subtotal())}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Estimated shipping</dt>
              <dd className="text-text">{formatCurrency(shippingEstimate)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2.5 text-base font-semibold">
              <dt className="text-text">Total</dt>
              <dd className="text-text">{formatCurrency(subtotal() + shippingEstimate)}</dd>
            </div>
          </dl>
          <ButtonLink href="/checkout" size="lg" className="mt-6 w-full">
            Proceed to checkout
          </ButtonLink>
          <p className="mt-3 text-center text-xs text-muted">Discounts and final shipping are applied at checkout.</p>
        </div>
      </div>
    </div>
  );
}
