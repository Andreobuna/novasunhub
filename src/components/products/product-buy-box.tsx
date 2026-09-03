"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { apiFetch } from "@/lib/api-client";

interface Props {
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  unitPrice: number;
  stockQuantity: number;
}

export function ProductBuyBox({ productId, name, slug, image, unitPrice, stockQuantity }: Props) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [wishlisting, setWishlisting] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const outOfStock = stockQuantity <= 0;

  function handleAdd() {
    const result = addItem({ productId, name, slug, image, unitPrice, stockQuantity }, qty);
    if (result.ok) toast.success(`${name} added to cart`);
    else toast.error(result.message || "Could not add to cart");
  }

  function handleBuyNow() {
    const result = addItem({ productId, name, slug, image, unitPrice, stockQuantity }, qty);
    if (result.ok) router.push("/cart");
    else toast.error(result.message || "Could not add to cart");
  }

  async function handleWishlist() {
    setWishlisting(true);
    try {
      await apiFetch("/api/wishlist", { method: "POST", body: JSON.stringify({ productId }) });
      toast.success("Saved to wishlist");
    } catch (err: any) {
      if (err.status === 401) {
        toast.error("Sign in to save items to your wishlist");
      } else {
        toast.error(err.message || "Could not save to wishlist");
      }
    } finally {
      setWishlisting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-1.5">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text hover:bg-surface-2"
          aria-label="Decrease quantity"
        >
          <Minus size={15} />
        </button>
        <span className="w-8 text-center text-sm font-medium text-text" aria-live="polite">
          {qty}
        </span>
        <button
          onClick={() => setQty((q) => Math.min(stockQuantity, q + 1))}
          disabled={qty >= stockQuantity}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text hover:bg-surface-2 disabled:opacity-40"
          aria-label="Increase quantity"
        >
          <Plus size={15} />
        </button>
        <span className="ml-auto pr-3 text-xs text-muted">{stockQuantity} in stock</span>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleAdd} disabled={outOfStock} size="lg" variant="secondary" className="flex-1">
          <ShoppingCart size={16} /> Add to cart
        </Button>
        <Button onClick={handleBuyNow} disabled={outOfStock} size="lg" className="flex-1">
          <Zap size={16} /> Buy now
        </Button>
        <Button onClick={handleWishlist} disabled={wishlisting} size="lg" variant="outline" aria-label="Save to wishlist">
          <Heart size={16} />
        </Button>
      </div>
    </div>
  );
}
