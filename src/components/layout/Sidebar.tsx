"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Products", href: "/dashboard/products" },
  { name: "Orders", href: "/dashboard/orders" },
  { name: "Users", href: "/dashboard/users" },
  { name: "Reviews", href: "/dashboard/reviews" },
  { name: "Coupons", href: "/dashboard/coupons" },
  { name: "Newsletter", href: "/dashboard/newsletter" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-surface border-r border-border px-6 py-8 flex flex-col">
      {/* ---------- LOGO ---------- */}
      <div className="mb-4">
        <h2 className="font-brand text-4xl text-brand-primary">Miraé</h2>
      </div>

      {/* ---------- NAV ---------- */}
      <nav className="flex flex-col gap-1 border-t-2 border-border pt-4">
        {links.map((link) => {
          const isDashboard = link.href === "/dashboard";

          const isActive = isDashboard
            ? pathname === "/dashboard"
            : pathname.startsWith(link.href);

          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                "relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200",
                isActive
                  ? "bg-brand-primary text-background"
                  : "text-text-secondary hover:bg-surface-accent hover:text-text-primary"
              )}
            >
              {/* Text */}
              <span className="relative z-10">
                {link.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ---------- FOOTER ---------- */}
      <div className="mt-auto pt-6 text-xs text-text-secondary">
        © {new Date().getFullYear()} Mirae
      </div>
    </aside>
  );
}
