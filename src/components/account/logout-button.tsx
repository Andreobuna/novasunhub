"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";

export function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    toast.success("Signed out");
    router.push("/");
    router.refresh();
  }
  return (
    <Button variant="outline" size="sm" onClick={handleLogout}>
      <LogOut size={14} /> Sign out
    </Button>
  );
}
