import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedProducts } from "@/components/home/featured-products";
import { StatsSection } from "@/components/home/stats-section";
import { WhyNovaSunHub } from "@/components/home/why-novasunhub";
import { PromoBanner } from "@/components/home/promo-banner";
import { Testimonials } from "@/components/home/testimonials";

export const revalidate = 60;

async function getHomeData() {
  const [categories, featured] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: { where: { status: "PUBLISHED" } } } } },
    }),
    prisma.product.findMany({
      where: { status: "PUBLISHED", isFeatured: true },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
    }),
  ]);
  return { categories, featured };
}

export default async function HomePage() {
  const { categories, featured } = await getHomeData();

  return (
    <>
      <Hero />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={featured as any} />
      <StatsSection />
      <WhyNovaSunHub />
      <PromoBanner />
      <Testimonials />
    </>
  );
}
