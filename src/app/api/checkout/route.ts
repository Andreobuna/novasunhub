import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validation";
import { generateOrderNumber } from "@/lib/order-number";
import { initializePaystackTransaction, isPaystackConfigured } from "@/lib/integrations/paystack";
import { ok, fail, withErrorHandling, ApiError } from "@/lib/api-response";

const FLAT_SHIPPING_FEE = 5000; // NGN — simple flat-rate shipping for now

export const POST = withErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid checkout details", 422, parsed.error.flatten());
  const { address, contactEmail, contactPhone, notes, discountCode } = parsed.data;

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    throw new ApiError("Your cart is empty.", 400);
  }

  // Re-validate stock at time of purchase (never trust the client's snapshot).
  for (const item of cart.items) {
    if (item.product.status !== "PUBLISHED") {
      throw new ApiError(`${item.product.name} is no longer available.`, 409);
    }
    if (item.quantity > item.product.stockQuantity) {
      throw new ApiError(
        `Only ${item.product.stockQuantity} unit(s) of ${item.product.name} left in stock.`,
        409
      );
    }
  }

  let discount = null as Awaited<ReturnType<typeof prisma.discount.findUnique>> | null;
  if (discountCode) {
    discount = await prisma.discount.findUnique({ where: { code: discountCode } });
    if (
      !discount ||
      !discount.isActive ||
      (discount.expiresAt && discount.expiresAt < new Date()) ||
      (discount.usageLimit && discount.timesUsed >= discount.usageLimit)
    ) {
      throw new ApiError("This discount code is invalid or has expired.", 400);
    }
  }

  const subtotal = cart.items.reduce((sum, item) => {
    const unitPrice = Number(item.product.salePrice ?? item.product.price);
    return sum + unitPrice * item.quantity;
  }, 0);

  const discountAmount = discount
    ? discount.type === "PERCENT"
      ? Math.round((subtotal * Number(discount.value)) / 100)
      : Math.min(Number(discount.value), subtotal)
    : 0;

  const shippingCost = FLAT_SHIPPING_FEE;
  const total = Math.max(0, subtotal - discountAmount) + shippingCost;

  const orderNumber = await generateOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    const createdAddress = await tx.address.create({
      data: { ...address, userId: user.id },
    });

    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId: user.id,
        addressId: createdAddress.id,
        subtotal,
        shippingCost,
        discountAmount,
        total,
        currency: "NGN",
        discountId: discount?.id,
        contactEmail,
        contactPhone,
        notes,
        status: "PENDING",
        paymentStatus: "UNPAID",
        items: {
          create: cart.items.map((item) => {
            const unitPrice = Number(item.product.salePrice ?? item.product.price);
            return {
              productId: item.productId,
              productName: item.product.name,
              productSku: item.product.sku,
              unitPrice,
              quantity: item.quantity,
              lineTotal: unitPrice * item.quantity,
            };
          }),
        },
      },
      include: { items: true },
    });

    // Reduce stock now that the order is placed (pending payment).
    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
    }

    if (discount) {
      await tx.discount.update({ where: { id: discount.id }, data: { timesUsed: { increment: 1 } } });
    }

    // Clear the cart now that it has become an order.
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  // Attempt to start a Paystack transaction if configured; otherwise the
  // order stays PENDING/UNPAID and the storefront shows a clear "payment
  // provider not yet configured" state instead of faking success.
  if (isPaystackConfigured()) {
    const paystackInit = await initializePaystackTransaction({
      email: contactEmail,
      amountKobo: Math.round(total * 100),
      reference: order.orderNumber,
      // Fall back to the request's own origin if NEXT_PUBLIC_SITE_URL isn't
      // set — otherwise this silently becomes the literal string
      // "undefined/orders/…" and Paystack's redirect breaks.
      callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin}/orders/${order.id}`,
    });
    if (paystackInit.ok) {
      // Persist the reference now so the webhook/verify endpoints can find
      // this order later purely from Paystack's callback — nothing else
      // marks an order PAID.
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { paymentRef: paystackInit.reference, paymentProvider: "paystack" },
        include: { items: true },
      });
      return ok(
        { order: updated, payment: { provider: "paystack", authorizationUrl: paystackInit.authorizationUrl } },
        201
      );
    }
  }

  return ok(
    {
      order,
      payment: {
        provider: null,
        message:
          "Payment provider is not yet configured. Your order has been created as PENDING — an admin can mark it PAID once payment is confirmed.",
      },
    },
    201
  );
});
