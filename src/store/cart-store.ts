"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
  stockQuantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => { ok: boolean; message?: string };
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => { ok: boolean; message?: string };
  clear: () => void;
  subtotal: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === item.productId);
        const desiredQty = (existing?.quantity ?? 0) + quantity;

        if (desiredQty > item.stockQuantity) {
          return { ok: false, message: `Only ${item.stockQuantity} unit(s) of ${item.name} left in stock.` };
        }

        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === item.productId ? { ...i, quantity: desiredQty, stockQuantity: item.stockQuantity } : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity }] });
        }
        return { ok: true };
      },

      removeItem: (productId) => set({ items: get().items.filter((i) => i.productId !== productId) }),

      setQuantity: (productId, quantity) => {
        const items = get().items;
        const item = items.find((i) => i.productId === productId);
        if (!item) return { ok: false, message: "Item not found in cart." };
        if (quantity < 1) return { ok: false, message: "Quantity must be at least 1." };
        if (quantity > item.stockQuantity) {
          return { ok: false, message: `Only ${item.stockQuantity} unit(s) left in stock.` };
        }
        set({ items: items.map((i) => (i.productId === productId ? { ...i, quantity } : i)) });
        return { ok: true };
      },

      clear: () => set({ items: [] }),

      subtotal: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "nsh-cart" }
  )
);
