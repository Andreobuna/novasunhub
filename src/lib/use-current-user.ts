"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "./api-client";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  phone?: string | null;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiFetch<CurrentUser | null>("/api/auth/me")
      .then((u) => active && setUser(u))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { user, loading, setUser };
}
