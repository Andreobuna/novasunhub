import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;

  const q = params.get("q")?.trim();
  const category = params.get("category") || undefined;
  const brand = params.get("brand") || undefined;
  const minPrice = params.get("minPrice") ? Number(params.get("minPrice")) : undefined;
  const maxPrice = params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined;
  const inStock = params.get("inStock") === "true";
  const featured = params.get("featured") === "true";
  const sort = params.get("sort") || "newest";
  const page = Math.max(1, Number(params.get("page") || 1));
  const pageSize = Math.min(48, Math.max(1, Number(params.get("pageSize") || 12)));

  const where: Prisma.ProductWhereInput = {
    status: "PUBLISHED",
    ...(category ? { category: { slug: category } } : {}),
    ...(brand ? { brand: { slug: brand } } : {}),
    ...(inStock ? { stockQuantity: { gt: 0 } } : {}),
    ...(featured ? { isFeatured: true } : {}),
    ...(minPrice || maxPrice
      ? {
          price: {
            ...(minPrice ? { gte: minPrice } : {}),
            ...(maxPrice ? { lte: maxPrice } : {}),
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { shortDescription: { contains: q, mode: "insensitive" } },
            { brand: { name: { contains: q, mode: "insensitive" } } },
            { category: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
      ? { price: "desc" }
      : sort === "name-asc"
      ? { name: "asc" }
      : sort === "rating"
      ? { avgRating: "desc" }
      : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        images: { orderBy: { position: "asc" } },
        category: true,
        brand: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return ok({
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
});
