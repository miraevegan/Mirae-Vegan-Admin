"use client";

import { useEffect, useState } from "react";
import { getToken, logout } from "@/lib/auth";
import api from "@/lib/api";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = getToken();

      if (!token) {
        logout();
        return;
      }

      try {
        // verify token + role
        const { data } = await api.get("/auth/profile");

        if (data.user.role !== "admin") {
          logout();
          return;
        }

        setLoading(false);
      } catch {
        logout();
      }
    };

    verifyAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary">Checking access…</p>
      </div>
    );
  }

  return <>{children}</>;
}
