/**
 * Supplier / catalog synchronization adapter.
 *
 * This module is the ONLY place that should talk to an external product
 * supplier API. Keep it isolated so that swapping providers, or wiring up
 * real credentials, never touches route handlers, UI, or the database layer
 * directly.
 *
 * SECURITY: API_KEY and API_BASE_URL are read from server-only environment
 * variables (see .env.example). They must never be prefixed with
 * NEXT_PUBLIC_, imported into a "use client" file, or returned in an API
 * response.
 *
 * Until a specific provider is configured, every method below is a safe
 * no-op / clearly-labelled stub — nothing here fakes a successful sync.
 */

import { prisma } from "@/lib/prisma";

const API_KEY = process.env.API_KEY;
const API_BASE_URL = process.env.API_BASE_URL;

export function isSupplierConfigured() {
  return Boolean(API_KEY && API_BASE_URL);
}

interface SupplierProductDTO {
  externalId: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  stockQuantity: number;
  images: string[];
  category: string;
  brand?: string;
  specs?: Record<string, string>;
}

async function supplierFetch(path: string, init?: RequestInit) {
  if (!isSupplierConfigured()) {
    throw new Error(
      "Supplier API is not configured. Set API_KEY and API_BASE_URL in your environment."
    );
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    // Never cache calls that touch pricing/stock.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Supplier API request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetches the full product list from the supplier.
 * TODO(integration): replace the path + response mapping below once the
 * actual supplier's endpoint contract is known.
 */
export async function fetchSupplierProducts(): Promise<SupplierProductDTO[]> {
  const data = await supplierFetch("/products"); // TODO: confirm real path
  return data as SupplierProductDTO[]; // TODO: map to SupplierProductDTO shape
}

/**
 * Fetches live stock + price for a single SKU.
 * TODO(integration): confirm endpoint + response fields with the provider.
 */
export async function fetchSupplierInventory(sku: string) {
  return supplierFetch(`/inventory/${encodeURIComponent(sku)}`); // TODO: confirm real path
}

/**
 * Upserts supplier products into our local catalog. Safe to run repeatedly
 * (idempotent on SKU). Intended to be triggered from an authenticated admin
 * action or a scheduled job — never from an unauthenticated route.
 */
export async function syncSupplierCatalog() {
  if (!isSupplierConfigured()) {
    return {
      ran: false,
      reason:
        "Supplier API not configured. Add API_KEY and API_BASE_URL to enable live sync.",
      imported: 0,
      updated: 0,
    };
  }

  const products = await fetchSupplierProducts();
  let imported = 0;
  let updated = 0;

  for (const p of products) {
    const category = await prisma.category.upsert({
      where: { slug: p.category.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        name: p.category,
        slug: p.category.toLowerCase().replace(/\s+/g, "-"),
      },
    });

    const existing = await prisma.product.findUnique({ where: { sku: p.sku } });

    if (existing) {
      await prisma.product.update({
        where: { sku: p.sku },
        data: {
          price: p.price,
          stockQuantity: p.stockQuantity,
          description: p.description,
        },
      });
      updated++;
    } else {
      await prisma.product.create({
        data: {
          name: p.name,
          slug: p.name.toLowerCase().replace(/\s+/g, "-"),
          sku: p.sku,
          description: p.description,
          price: p.price,
          stockQuantity: p.stockQuantity,
          status: "DRAFT", // imported products start as drafts for admin review
          categoryId: category.id,
          images: {
            create: p.images.map((url, i) => ({ url, isPrimary: i === 0, position: i })),
          },
          specifications: p.specs
            ? {
                create: Object.entries(p.specs).map(([label, value], i) => ({
                  label,
                  value,
                  position: i,
                })),
              }
            : undefined,
        },
      });
      imported++;
    }
  }

  return { ran: true, imported, updated };
}
