import slugify from "slugify";
import { prisma } from "./prisma";

export async function uniqueProductSlug(name: string, ignoreId?: string) {
  const base = slugify(name, { lower: true, strict: true });
  let candidate = base;
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === ignoreId) return candidate;
    candidate = `${base}-${++i}`;
  }
}

export async function uniqueCategorySlug(name: string, ignoreId?: string) {
  const base = slugify(name, { lower: true, strict: true });
  let candidate = base;
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === ignoreId) return candidate;
    candidate = `${base}-${++i}`;
  }
}
