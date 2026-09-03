import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, fail, withErrorHandling } from "@/lib/api-response";

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: { include: { images: { take: 1, orderBy: { position: "asc" } } } } },
      },
    },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: { product: { include: { images: { take: 1, orderBy: { position: "asc" } } } } },
        },
      },
    });
  }
  return cart;
}

export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  const cart = await getOrCreateCart(user.id);
  return ok(cart);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const { productId, quantity } = await req.json();
  if (!productId || !quantity || quantity < 1) return fail("productId and a positive quantity are required", 422);

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "PUBLISHED") return fail("Product not available", 404);
  if (product.stockQuantity < 1) return fail("This product is out of stock", 409);

  const cart = await getOrCreateCart(user.id);
  const existingItem = cart.items.find((i) => i.productId === productId);
  const desiredQty = (existingItem?.quantity || 0) + quantity;

  if (desiredQty > product.stockQuantity) {
    return fail(`Only ${product.stockQuantity} unit(s) left in stock`, 409);
  }

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: desiredQty },
    create: { cartId: cart.id, productId, quantity },
  });

  const updated = await getOrCreateCart(user.id);
  return ok(updated, 201);
});
