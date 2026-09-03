"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Enter a valid email address");
      return;
    }
    setLoading(true);
    // TODO(integration): wire up to a mailing-list provider (Mailchimp, etc.)
    setTimeout(() => {
      setLoading(false);
      setEmail("");
      toast.success("You're on the list — welcome to NovaSunHub!");
    }, 600);
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm gap-2 sm:w-auto">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-brand-400/60"
      />
      <Button type="submit" disabled={loading} size="md">
        {loading ? "Joining…" : "Subscribe"}
      </Button>
    </form>
  );
}
