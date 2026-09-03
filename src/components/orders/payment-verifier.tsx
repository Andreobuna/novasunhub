"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

interface PaymentVerifierProps {
  paymentRef: string;
  paymentStatus: string;
}

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 6; // ~18s — the webhook is normally near-instant; this only covers the rare lag.

/**
 * Renders nothing once payment is confirmed elsewhere (webhook usually wins
 * the race). While an order is still UNPAID and has a Paystack reference,
 * this polls the verify endpoint a few times and refreshes the server
 * component tree the moment status changes, so the customer doesn't have to
 * manually reload to see "Paid" appear.
 */
export function PaymentVerifier({ paymentRef, paymentStatus }: PaymentVerifierProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(paymentStatus === "UNPAID");
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (paymentStatus !== "UNPAID") return;

    let cancelled = false;

    async function poll() {
      attemptsRef.current += 1;
      try {
        const result = await apiFetch<{ paymentStatus: string }>(
          `/api/payments/paystack/verify/${encodeURIComponent(paymentRef)}`
        );
        if (cancelled) return;
        if (result.paymentStatus !== "UNPAID") {
          setChecking(false);
          router.refresh();
          return;
        }
      } catch {
        // Transient errors (network blip, Paystack briefly unreachable) —
        // just let the retry loop try again rather than surfacing an error
        // for something the webhook will likely resolve anyway.
      }

      if (!cancelled && attemptsRef.current < MAX_ATTEMPTS) {
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } else if (!cancelled) {
        setChecking(false);
      }
    }

    let timer = setTimeout(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [paymentRef, paymentStatus, router]);

  if (!checking) return null;

  return (
    <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted">
      <Loader2 size={13} className="animate-spin" />
      Confirming payment with Paystack — this page will update automatically.
    </p>
  );
}
