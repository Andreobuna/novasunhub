import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPaystackConfigured } from "@/lib/integrations/paystack";

/**
 * GET /api/health
 *
 * Unauthenticated on purpose (standard for uptime checks / load balancers).
 * Deliberately reports config *presence*, never secret values — this is a
 * "is everything wired up" check, not a debug dump.
 */
export async function GET() {
  const checks: Record<string, boolean> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch {
    checks.database = false;
  }

  checks.paystackConfigured = isPaystackConfigured();
  checks.siteUrlConfigured = Boolean(process.env.NEXT_PUBLIC_SITE_URL);

  const healthy = checks.database; // only DB connectivity is load-bearing
  return NextResponse.json({ healthy, checks }, { status: healthy ? 200 : 503 });
}
