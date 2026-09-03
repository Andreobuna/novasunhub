import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validation";
import { uniqueProductSlug } from "@/lib/slugify-unique";
import { ok, created, fail, withErrorHandling } from "@/lib/api-response";

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requireAdmin();
  const params = req.nextUrl.searchParams;
  const q = params.get("q")?.trim();
  const status = params.get("status") || undefined;
  const page = Math.max(1, Number(params.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(params.get("pageSize") || 20)));

  const where = {
    ...(status ? { status: status as any } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { sku: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { images: { take: 1, orderBy: { position: "asc" } }, category: true },
    }),
    prisma.product.count({ where }),
  ]);

  return ok({ items, pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } });
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  await requireAdmin();
  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid product data", 422, parsed.error.flatten());

  const data = parsed.data;
  const slug = data.slug?.trim() || (await uniqueProductSlug(data.name));

  const skuTaken = await prisma.product.findUnique({ where: { sku: data.sku } });
  if (skuTaken) return fail("A product with this SKU already exists", 409);

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      sku: data.sku,
      categoryId: data.categoryId,
      brandId: data.brandId || undefined,
      description: data.description,
      shortDescription: data.shortDescription,
      price: data.price,
      salePrice: data.salePrice ?? undefined,
      currency: data.currency,
      stockQuantity: data.stockQuantity,
      lowStockThreshold: data.lowStockThreshold ?? 5,
      status: data.status,
      isFeatured: data.isFeatured ?? false,
      warranty: data.warranty,
      weightKg: data.weightKg ?? undefined,
      dimensions: data.dimensions,
      voltage: data.voltage,
      wattage: data.wattage,
      batteryCapacity: data.batteryCapacity,
      inverterCapacity: data.inverterCapacity,
      compatibility: data.compatibility,
      installationInfo: data.installationInfo,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      images: {
        create: data.images.map((img, i) => ({
          url: img.url,
          altText: img.altText,
          isPrimary: img.isPrimary ?? i === 0,
          position: i,
        })),
      },
      specifications: {
        create: data.specifications.map((s, i) => ({ label: s.label, value: s.value, position: i })),
      },
    },
    include: { images: true, specifications: true, category: true },
  });

  return created(product);
});
