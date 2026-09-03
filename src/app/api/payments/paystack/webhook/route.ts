import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaystackWebhookSignature } from "@/lib/integrations/paystack";

// Paystack sends events for many things (transfers, subscriptions, etc.) —
// we only act on the two that matter for a one-off checkout charge.
const HANDLED_EVENTS = new Set(["charge.success", "charge.failed"]);

interface PaystackWebhookPayload {
  event: string;
  data: {
    id?: number | string;
    reference?: string;
    status?: string;
  };
}

/**
 * POST /api/payments/paystack/webhook
 *
 * This route is intentionally NOT behind auth or the /admin, /account
 * middleware matchers — Paystack's servers call it directly and can't send
 * a session cookie. Trust comes entirely from the HMAC signature check
 * below, which is why that check has to run before anything else.
 *
 * Every signature-valid delivery is logged to WebhookEvent, keyed on
 * Paystack's own transaction id, before any order mutation happens. That
 * gives two things "staged" webhooks need: an audit trail you can actually
 * inspect, and a hard idempotency guarantee — Paystack retries deliveries
 * on anything less than a prompt 200, so the same event arriving twice must
 * never double-apply (e.g. double-restock a failed charge).
 */
export async function POST(req: NextRequest) {
  // Read the raw text body — signature verification needs the exact bytes
  // Paystack sent, not a re-serialized JSON object.
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyPaystackWebhookSignature(rawBody, signature)) {
    console.error("[PAYSTACK_WEBHOOK] Invalid or missing signature — rejecting.");
    return NextResponse.json({ received: false }, { status: 401 });
  }

  let event: PaystackWebhookPayload;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  const reference = event.data?.reference;
  // Paystack always includes `data.id` on real transaction events; fall
  // back to the reference for anything unusual rather than crashing on a
  // missing field.
  const providerEventId = event.data?.id ? String(event.data.id) : `${event.event}:${reference ?? "unknown"}:${Date.now()}`;

  // Always ack quickly for events we don't act on, so Paystack doesn't keep
  // retrying delivery of something we'll never process.
  if (!HANDLED_EVENTS.has(event.event)) {
    return NextResponse.json({ received: true });
  }

  try {
    // Claim this event id up front. If it's already been logged, a retried
    // delivery stops here — nothing below runs twice for the same event.
    const alreadyProcessed = await prisma.webhookEvent.findUnique({ where: { providerEventId } });
    if (alreadyProcessed) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (!reference) {
      await prisma.webhookEvent.create({
        data: { provider: "paystack", eventType: event.event, providerEventId, status: "ignored", error: "Missing reference" },
      });
      return NextResponse.json({ received: true });
    }

    const order = await prisma.order.findFirst({ where: { paymentRef: reference } });
    if (!order) {
      // Nothing to reconcile against — ack anyway so Paystack stops
      // retrying; this can legitimately happen for test-mode events against
      // old references.
      console.warn(`[PAYSTACK_WEBHOOK] No order found for reference ${reference}`);
      await prisma.webhookEvent.create({
        data: {
          provider: "paystack",
          eventType: event.event,
          providerEventId,
          reference,
          status: "ignored",
          error: "No matching order",
        },
      });
      return NextResponse.json({ received: true });
    }

    // Order-status transitions are themselves idempotent (guarded by
    // paymentStatus checks) as a second line of defense, in case two
    // different event ids ever arrive for the same underlying charge.
    if (event.event === "charge.success") {
      if (order.paymentStatus !== "PAID") {
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: "PAID", status: order.status === "PENDING" ? "PAID" : order.status },
        });
      }
    } else if (event.event === "charge.failed") {
      if (order.paymentStatus === "UNPAID") {
        const items = await prisma.orderItem.findMany({ where: { orderId: order.id } });
        await prisma.$transaction([
          prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } }),
          ...items.map((item) =>
            prisma.product.update({
              where: { id: item.productId },
              data: { stockQuantity: { increment: item.quantity } },
            })
          ),
        ]);
      }
    }

    await prisma.webhookEvent.create({
      data: { provider: "paystack", eventType: event.event, providerEventId, reference, status: "processed" },
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    // Log the failure for the audit trail, but still return 200. A 500 here
    // makes Paystack retry — which is fine for a transient DB blip, but if
    // the failure is deterministic (a bug), retrying forever just spams
    // logs. Better to record it once and let it surface in WebhookEvent for
    // manual follow-up than to get stuck in a retry loop either way.
    console.error("[PAYSTACK_WEBHOOK] Unexpected error processing event", err);
    try {
      await prisma.webhookEvent.create({
        data: {
          provider: "paystack",
          eventType: event.event,
          providerEventId,
          reference,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error",
        },
      });
    } catch {
      // If even the audit-log write fails, there's nothing more we can do
      // here — surface it in the response body for whoever's watching logs.
    }
    return NextResponse.json({ received: true, error: "Processed with errors — see server logs." });
  }
}

// Paystack only ever sends POST. A GET here almost always means someone
// pasted the webhook URL into a browser — respond clearly instead of a
// generic 404.
export async function GET() {
  return NextResponse.json(
    { message: "This endpoint only accepts POST requests from Paystack." },
    { status: 405 }
  );
}
