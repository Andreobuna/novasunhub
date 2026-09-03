import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { categorySchema } from "@/lib/validation";
import { uniqueCategorySlug } from "@/lib/slugify-unique";
import { ok, created, fail, withErrorHandling } from "@/lib/api-response";

export const GET = withErrorHandling(async () => {
  await requireAdmin();
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return ok(categories);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  await requireAdmin();
  const body = await req.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) return fail("Invalid category data", 422, parsed.error.flatten());

  const data = parsed.data;
  const slug = data.slug?.trim() || (await uniqueCategorySlug(data.name));

  const category = await prisma.category.create({
    data: { name: data.name, slug, description: data.description, image: data.image, sortOrder: data.sortOrder ?? 0 },
  });
  return created(category);
});
