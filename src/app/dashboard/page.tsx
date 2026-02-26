"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import clsx from "clsx";
import StatCard from "@/components/dashboard/StatCard";
import type { Product, VariantAttribute } from "@/types/product";

function formatVariantAttributes(attributes: VariantAttribute): string {
  const parts: string[] = [];

  if (attributes.color?.name) {
    parts.push(attributes.color.name);
  }

  if (attributes.size) {
    parts.push(attributes.size);
  }

  // Add any other attribute keys you want here if needed

  return parts.join(" / ") || "No attributes";
}

/* ------------------ */
/* Types */
/* ------------------ */

type Order = {
  _id: string;
  totalPrice: number;
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: string;
  createdAt: string;
  user?: { name?: string };
};

type DashboardData = {
  orders: Order[];
  products: Product[];
  usersCount: number;
};

/* ------------------ */
/* Page */
/* ------------------ */

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        api.get("/orders"),
        api.get("/products"),
        api.get("/admin/users"),
      ]);

      setData({
        orders: ordersRes.data.orders ?? [],
        products: productsRes.data.products ?? [],
        usersCount: usersRes.data.users.length,
      });

      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return <p className="text-sm text-text-secondary">Loading dashboard…</p>;
  }

  if (!data) return null;

  /* ------------------ */
  /* Derived Metrics */
  /* ------------------ */

  const paidOrders = data.orders.filter(o => o.paymentStatus === "paid");

  const pendingOrders = data.orders.filter(
    o => !["delivered", "cancelled"].includes(o.orderStatus)
  );

  const totalRevenue = paidOrders.reduce(
    (sum, o) => sum + o.totalPrice,
    0
  );

  const lowStockProducts = data.products.filter(p =>
    p.variants.some(v => v.stock <= 5)
  );

  const formattedRevenue = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 5,
  }).format(totalRevenue);

  return (
    <div className="space-y-12">
      {/* Header */}
      <header>
        <h1 className="font-brand text-2xl tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-text-secondary">
          Store overview & operational health
        </p>
      </header>

      {/* Stat Cards (KEEP THIS UI) */}
      <section className="grid grid-cols-1 tabular-nums sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenue"
          value={formattedRevenue}
        />
        <StatCard
          title="Total Orders"
          value={data.orders.length.toString()}
        />
        <StatCard
          title="Pending Orders"
          value={pendingOrders.length.toString()}
        />
        <StatCard
          title="Customers"
          value={data.usersCount.toString()}
        />
      </section>

      {/* Orders + Inventory Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-xs font-semibold tracking-widest text-text-secondary">
            RECENT ORDERS
          </h2>

          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-text-secondary">
                <tr>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>

              <tbody>
                {data.orders.slice(0, 6).map(order => (
                  <tr
                    key={order._id}
                    className="border-t border-border hover:bg-muted/30 transition"
                  >
                    <td className="px-4 py-3 font-medium">
                      #{order._id.slice(-6)}
                    </td>
                    <td className="px-4 py-3">
                      {order.user?.name ?? "Guest"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ₹{order.totalPrice}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={order.paymentStatus}>
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="status">
                        {order.orderStatus.replaceAll("_", " ")}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Alerts */}
        <div>
          <h2 className="mb-4 text-xs font-semibold tracking-widest text-text-secondary">
            INVENTORY ALERTS <span className="text-[10px] font-medium">(Stocks below 3)</span>
          </h2>

          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-text-secondary">
                All products sufficiently stocked 🎉
              </p>
            ) : (
              lowStockProducts.slice(0, 5).map(product => (
                <div
                  key={product._id}
                  className="rounded-xl border border-border p-4"
                >
                  <p className="font-medium">{product.name}</p>

                  <ul className="mt-2 space-y-1 text-xs text-text-secondary">
                    {product.variants
                      .filter(v => v.stock <= 3)
                      .map((variant, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{formatVariantAttributes(variant.attributes)}</span>
                          <span className="text-error font-semibold bg-red-100 border border-red-200 rounded-full px-2 py-0.5">{variant.stock} left</span>
                        </li>
                      ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ------------------ */
/* UI Atom */
/* ------------------ */

function Badge({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        variant === "paid" && "bg-green-500/10 text-green-600",
        variant === "pending" && "bg-yellow-500/10 text-yellow-600",
        variant === "failed" && "bg-red-500/10 text-red-600",
        variant === "status" && "bg-muted text-text-secondary"
      )}
    >
      {children}
    </span>
  );
}
