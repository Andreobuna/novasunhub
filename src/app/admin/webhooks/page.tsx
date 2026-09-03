import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { isPaystackConfigured } from "@/lib/integrations/paystack";

const STATUS_TONE = {
  processed: "success",
  ignored: "warning",
  error: "danger",
} as const;

export const metadata = { title: "Webhooks — Admin" };

export default async function AdminWebhooksPage() {
  const events = await prisma.webhookEvent.findMany({
    orderBy: { receivedAt: "desc" },
    take: 50,
  });

  const configured = isPaystackConfigured();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-text">Webhooks</h1>
          <p className="mt-1 text-sm text-muted">
            Every signature-verified Paystack delivery lands here — this is the audit trail for payment confirmation.
          </p>
        </div>
        <Badge tone={configured ? "success" : "warning"}>
          {configured ? "Paystack configured" : "Paystack not configured"}
        </Badge>
      </div>

      {!configured && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          <code className="rounded bg-black/20 px-1.5 py-0.5">PAYSTACK_SECRET_KEY</code> isn't set, so no webhook
          deliveries can be verified yet — this table will stay empty until it's configured and Paystack's dashboard
          is pointed at <code className="rounded bg-black/20 px-1.5 py-0.5">/api/payments/paystack/webhook</code>.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-2 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {events.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  No webhook deliveries yet.
                </td>
              </tr>
            )}
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-surface-2/60">
                <td className="px-4 py-3 text-muted">{formatDateTime(event.receivedAt)}</td>
                <td className="px-4 py-3 font-mono text-xs text-text">{event.eventType}</td>
                <td className="px-4 py-3 font-mono text-xs text-text">{event.reference ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONE[event.status as keyof typeof STATUS_TONE] ?? "default"}>
                    {event.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted">{event.error ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
