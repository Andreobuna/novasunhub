"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch, ClientApiError } from "@/lib/api-client";
import { Logo } from "@/components/layout/logo";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(form) });
      toast.success("Account created — welcome to NovaSunHub!");
      router.push(next);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ClientApiError ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex"><Logo /></Link>
        <h1 className="mt-6 font-display text-2xl font-semibold text-text">Create your account</h1>
        <p className="mt-1 text-sm text-muted">Track orders, save addresses and check out faster.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-surface p-6">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="phone" hint="Optional">Phone number</Label>
          <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="password" hint="At least 8 characters">Password</Label>
          <Input id="password" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-medium text-brand-400 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
