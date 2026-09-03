"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch, ClientApiError } from "@/lib/api-client";
import { Logo } from "@/components/layout/logo";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await apiFetch<{ role: string }>("/api/auth/login", { method: "POST", body: JSON.stringify(form) });
      toast.success("Welcome back!");
      router.push(user.role === "ADMIN" ? "/admin" : next);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ClientApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex"><Logo /></Link>
        <h1 className="mt-6 font-display text-2xl font-semibold text-text">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Sign in to manage your orders and addresses.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-surface p-6">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don't have an account?{" "}
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-medium text-brand-400 hover:underline">
          Create one
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-muted">
        Demo admin: admin@novasunhub.com / Admin@12345 · Demo customer: demo@novasunhub.com / Customer@12345
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
