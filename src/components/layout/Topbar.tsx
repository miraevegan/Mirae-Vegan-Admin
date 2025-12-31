"use client";

import { logout } from "@/lib/auth";

export default function Topbar() {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-border">
      <h1 className="font-brand text-xl">Admin Panel</h1>

      <button
        onClick={logout}
        className="text-sm text-error hover:text-error transition"
      >
        Logout
      </button>
    </header>
  );
}
