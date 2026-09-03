import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validation";
import { ok, fail, withErrorHandling, ApiError } from "@/lib/api-response";

export const GET = withErrorHandling(
  async (_req: NextRequest, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { images: { orderBy: { position: "asc" } }, specifications: { orderBy: { position: "asc" } }, category: true, brand: true },
    });
    if (!product) throw new ApiError("Product not found", 404);
    return ok(product);
  }
);

export const PATCH = withErrorHandling(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const body = await req.json();
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) return fail("Invalid product data", 422, parsed.error.flatten());
    const data = parsed.data;

    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError("Product not found", 404);

    if (data.sku && data.sku !== existing.sku) {
      const skuTaken = await prisma.product.findUnique({ where: { sku: data.sku } });
      if (skuTaken) return fail("A product with this SKU already exists", 409);
    }

    const product = await prisma.$transaction(async (tx) => {
      if (data.images) {
        await tx.productImage.deleteMany({ where: { productId: params.id } });
      }
      if (data.specifications) {
        await tx.productSpecification.deleteMany({ where: { productId: params.id } });
      }

      return tx.product.update({
        where: { id: params.id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.slug !== undefined ? { slug: data.slug } : {}),
          ...(data.sku !== undefined ? { sku: data.sku } : {}),
          ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
          ...(data.brandId !== undefined ? { brandId: data.brandId || null } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.shortDescription !== undefined ? { shortDescription: data.shortDescription } : {}),
          ...(data.price !== undefined ? { price: data.price } : {}),
          ...(data.salePrice !== undefined ? { salePrice: data.salePrice } : {}),
          ...(data.currency !== undefined ? { currency: data.currency } : {}),
          ...(data.stockQuantity !== undefined ? { stockQuantity: data.stockQuantity } : {}),
          ...(data.lowStockThreshold !== undefined ? { lowStockThreshold: data.lowStockThreshold } : {}),
          ...(data.status !== undefined ? { status: data.status } : {}),
          ...(data.isFeatured !== undefined ? { isFeatured: data.isFeatured } : {}),
          ...(data.warranty !== undefined ? { warranty: data.warranty } : {}),
          ...(data.weightKg !== undefined ? { weightKg: data.weightKg } : {}),
          ...(data.dimensions !== undefined ? { dimensions: data.dimensions } : {}),
          ...(data.voltage !== undefined ? { voltage: data.voltage } : {}),
          ...(data.wattage !== undefined ? { wattage: data.wattage } : {}),
          ...(data.batteryCapacity !== undefined ? { batteryCapacity: data.batteryCapacity } : {}),
          ...(data.inverterCapacity !== undefined ? { inverterCapacity: data.inverterCapacity } : {}),
          ...(data.compatibility !== undefined ? { compatibility: data.compatibility } : {}),
          ...(data.installationInfo !== undefined ? { installationInfo: data.installationInfo } : {}),
          ...(data.metaTitle !== undefined ? { metaTitle: data.metaTitle } : {}),
          ...(data.metaDescription !== undefined ? { metaDescription: data.metaDescription } : {}),
          ...(data.images
            ? { images: { create: data.images.map((img, i) => ({ url: img.url, altText: img.altText, isPrimary: img.isPrimary ?? i === 0, position: i })) } }
            : {}),
          ...(data.specifications
            ? { specifications: { create: data.specifications.map((s, i) => ({ label: s.label, value: s.value, position: i })) } }
            : {}),
        },
        include: { images: true, specifications: true, category: true },
      });
    });

    return ok(product);
  }
);

export const DELETE = withErrorHandling(
  async (_req: NextRequest, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError("Product not found", 404);

    const usedInOrders = await prisma.orderItem.findFirst({ where: { productId: params.id } });
    if (usedInOrders) {
      // Preserve order history integrity — archive instead of hard-deleting.
      await prisma.product.update({ where: { id: params.id }, data: { status: "ARCHIVED" } });
      return ok({ archived: true, message: "Product has past orders, so it was archived instead of deleted." });
    }

    await prisma.product.delete({ where: { id: params.id } });
    return ok({ deleted: true });
  }
);
