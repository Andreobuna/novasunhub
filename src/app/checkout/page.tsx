"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useCartStore } from "@/store/cart-store";
import { useCurrentUser } from "@/lib/use-current-user";
import { apiFetch, ClientApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

const SHIPPING_FEE = 5000;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCartStore();
  const { user, loading: userLoading } = useCurrentUser();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    contactEmail: "",
    notes: "",
    discountCode: "",
  });

  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, fullName: f.fullName || user.name, contactEmail: f.contactEmail || user.email }));
    }
  }, [user]);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  if (!userLoading && !user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 sm:px-6">
        <EmptyState
          title="Sign in to check out"
          description="Create an account or sign in so we can attach this order, your shipping address and order history to your profile."
          action={
            <div className="flex gap-3">
              <ButtonLink href="/login?next=/checkout">Sign in</ButtonLink>
              <ButtonLink href="/register?next=/checkout" variant="outline">Create account</ButtonLink>
            </div>
          }
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 sm:px-6">
        <EmptyState title="Your cart is empty" description="Add a product before checking out." action={<ButtonLink href="/products">Shop products</ButtonLink>} />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await apiFetch<{ order: { id: string }; payment: { provider: string | null; authorizationUrl?: string; message?: string } }>(
        "/api/checkout",
        {
          method: "POST",
          body: JSON.stringify({
            address: {
              fullName: form.fullName,
              phone: form.phone,
              line1: form.line1,
              line2: form.line2 || undefined,
              city: form.city,
              state: form.state,
              postalCode: form.postalCode || undefined,
              country: "Nigeria",
              isDefault: true,
            },
            contactEmail: form.contactEmail,
            contactPhone: form.phone,
            notes: form.notes || undefined,
            discountCode: form.discountCode || undefined,
          }),
        }
      );

      clear();

      if (result.payment.provider === "paystack" && result.payment.authorizationUrl) {
        toast.success("Redirecting you to Paystack to complete payment…");
        window.location.href = result.payment.authorizationUrl;
        return;
      }

      toast.success("Order placed! We'll confirm payment shortly.");
      router.push(`/orders/${result.order.id}`);
    } catch (err) {
      const message = err instanceof ClientApiError ? err.message : "Checkout failed. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  const total = subtotal() + SHIPPING_FEE;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-text">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-10 lg:grid-cols-[1fr,380px]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-display text-lg font-semibold text-text">Contact information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="contactEmail">Email</Label>
                <Input id="contactEmail" type="email" required value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" type="tel" required value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-display text-lg font-semibold text-text">Shipping address</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="line1">Address line 1</Label>
                <Input id="line1" required value={form.line1} onChange={(e) => update("line1", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="line2" hint="Optional">Address line 2</Label>
                <Input id="line2" value={form.line2} onChange={(e) => update("line2", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" required value={form.city} onChange={(e) => update("city", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input id="state" required value={form.state} onChange={(e) => update("state", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="postalCode" hint="Optional">Postal code</Label>
                <Input id="postalCode" value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-display text-lg font-semibold text-text">Order notes</h2>
            <Textarea
              rows={3}
              placeholder="Delivery instructions, preferred install date, etc. (optional)"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              className="mt-3"
            />
          </section>
        </div>

        <div className="h-fit space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-display text-lg font-semibold text-text">Order summary</h2>
            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li key={item.productId} className="flex justify-between text-sm">
                  <span className="text-muted">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-text">{formatCurrency(item.unitPrice * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <Label htmlFor="discountCode" hint="Optional">Discount code</Label>
              <Input id="discountCode" value={form.discountCode} onChange={(e) => update("discountCode", e.target.value)} placeholder="e.g. SOLAR10" />
            </div>

            <dl className="mt-4 space-y-2.5 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="text-text">{formatCurrency(subtotal())}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className="text-text">{formatCurrency(SHIPPING_FEE)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2.5 text-base font-semibold">
                <dt className="text-text">Total</dt>
                <dd className="text-text">{formatCurrency(total)}</dd>
              </div>
            </dl>

            <Button type="submit" size="lg" disabled={submitting} className="mt-6 w-full">
              {submitting ? "Placing order…" : "Place order"}
            </Button>
            <p className="mt-3 text-center text-xs text-muted">
              Payment is processed securely. If a payment provider isn't yet configured, your order is created as pending for manual confirmation.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
