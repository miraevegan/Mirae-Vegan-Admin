"use client";

import { useState } from "react";
import api from "@/lib/api";
import { saveToken } from "@/lib/auth";
import { AxiosError } from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      saveToken(data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;

      setError(
        error.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-sm"
      >
        <h1 className="text-2xl mb-2 font-brand">Mirae Admin</h1>
        <p className="text-sm text-text-secondary mb-6">
          Luxury. Precision. Control.
        </p>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-3 rounded-lg border border-border bg-transparent focus:outline-none focus:ring-1 focus:ring-focus"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-3 rounded-lg border border-border bg-transparent focus:outline-none focus:ring-1 focus:ring-focus"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-sm text-error mb-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-brand-primary text-text-inverse hover:bg-hover transition disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-xs text-center text-text-secondary mt-6">
          Developed by Monish Ranjan
        </p>
      </form>
    </div>
  );
}
