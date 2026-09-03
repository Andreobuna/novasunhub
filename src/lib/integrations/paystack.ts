/**
 * Paystack payment adapter (server-side only).
 *
 * The secret key never leaves the server. The client only ever receives a
 * checkout authorization URL / reference — never PAYSTACK_SECRET_KEY.
 */
import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

export function isPaystackConfigured() {
  return Boolean(PAYSTACK_SECRET_KEY);
}

export async function initializePaystackTransaction(params: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl?: string;
}) {
  if (!isPaystackConfigured()) {
    return {
      ok: false as const,
      reason:
        "Paystack is not configured. Add PAYSTACK_SECRET_KEY to enable live payments.",
    };
  }

  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      callback_url: params.callbackUrl,
    }),
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok || !data.status) {
    return { ok: false as const, reason: data.message || "Paystack initialization failed" };
  }

  return {
    ok: true as const,
    authorizationUrl: data.data.authorization_url as string,
    accessCode: data.data.access_code as string,
    reference: data.data.reference as string,
  };
}

export async function verifyPaystackTransaction(reference: string) {
  if (!isPaystackConfigured()) {
    return { ok: false as const, reason: "Paystack is not configured." };
  }

  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      cache: "no-store",
    }
  );
  const data = await res.json();
  if (!res.ok || !data.status) {
    return { ok: false as const, reason: data.message || "Verification failed" };
  }
  return { ok: true as const, status: data.data.status as string, raw: data.data };
}

/**
 * Verifies the `x-paystack-signature` header on incoming webhook requests.
 *
 * Paystack signs the raw request body with HMAC-SHA512 using your secret
 * key. The signature MUST be checked against the raw (unparsed) body —
 * re-serializing parsed JSON can produce a different byte sequence and
 * silently break verification, so callers must pass the exact string Next.js
 * received on the wire (e.g. from `await req.text()`).
 */
export function verifyPaystackWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!PAYSTACK_SECRET_KEY || !signatureHeader) return false;

  const expected = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");

  // Constant-time comparison to avoid leaking timing information. Buffers
  // must be equal length for timingSafeEqual, so mismatched lengths are
  // treated as an immediate failure rather than throwing.
  const expectedBuf = Buffer.from(expected, "utf8");
  const signatureBuf = Buffer.from(signatureHeader, "utf8");
  if (expectedBuf.length !== signatureBuf.length) return false;

  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
}
