import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling, ApiError } from "@/lib/api-response";

export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: { slug: string } }) => {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        images: { orderBy: { position: "asc" } },
        specifications: { orderBy: { position: "asc" } },
        category: true,
        brand: true,
        reviews: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!product || product.status !== "PUBLISHED") {
      throw new ApiError("Product not found", 404);
    }

    const related = await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      take: 4,
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    });

    return ok({ product, related });
  }
);
