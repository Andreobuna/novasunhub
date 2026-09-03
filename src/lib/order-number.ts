/** Generates order numbers like NSH-20260901-0001, unique per day. */
import { prisma } from "./prisma";

export async function generateOrderNumber(): Promise<string> {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const countToday = await prisma.order.count({
    where: { createdAt: { gte: startOfDay, lt: endOfDay } },
  });

  const sequence = String(countToday + 1).padStart(4, "0");
  return `NSH-${datePart}-${sequence}`;
}
