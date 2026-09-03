"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Mail, MapPin, Phone } from "lucide-react";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // TODO(integration): wire this to a support inbox / ticketing system.
    setTimeout(() => {
      setLoading(false);
      setForm({ name: "", email: "", message: "" });
      toast.success("Message sent — our team will reply within 1 business day.");
    }, 700);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-text">Contact us</h1>
      <p className="mt-3 max-w-xl text-sm text-muted">
        Questions about sizing a system, an existing order, or a warranty claim — reach out and a real
        person will get back to you.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr,1.2fr]">
        <div className="space-y-5">
          <div className="flex items-center gap-3 text-sm text-muted"><Mail size={16} className="text-brand-400" /> support@novasunhub.com</div>
          <div className="flex items-center gap-3 text-sm text-muted"><Phone size={16} className="text-brand-400" /> +234 800 000 0000</div>
          <div className="flex items-center gap-3 text-sm text-muted"><MapPin size={16} className="text-brand-400" /> Lagos, Nigeria</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-surface p-6">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" rows={5} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Sending…" : "Send message"}</Button>
        </form>
      </div>
    </div>
  );
}
