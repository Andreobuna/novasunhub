import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, fail, withErrorHandling, ApiError } from "@/lib/api-response";

export const PATCH = withErrorHandling(
  async (req: NextRequest, { params }: { params: { productId: string } }) => {
    const user = await requireUser();
    const { quantity } = await req.json();
    if (typeof quantity !== "number" || quantity < 1) return fail("quantity must be at least 1", 422);

    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) throw new ApiError("Cart not found", 404);

    const product = await prisma.product.findUnique({ where: { id: params.productId } });
    if (!product) throw new ApiError("Product not found", 404);
    if (quantity > product.stockQuantity) return fail(`Only ${product.stockQuantity} unit(s) left in stock`, 409);

    await prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId: params.productId } },
      data: { quantity },
    });

    const updated = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: { include: { images: { take: 1 } } } } } },
    });
    return ok(updated);
  }
);

export const DELETE = withErrorHandling(
  async (_req: NextRequest, { params }: { params: { productId: string } }) => {
    const user = await requireUser();
    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) throw new ApiError("Cart not found", 404);

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId: params.productId } });

    const updated = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: { include: { images: { take: 1 } } } } } },
    });
    return ok(updated);
  }
);
