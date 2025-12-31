"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import axios from "axios";
import type { Order } from "@/types/order";
import type { User } from "@/types/user";

/* ---------------- TYPES ---------------- */

interface UserDetailsModalProps {
  id: string;
  onClose: () => void;
}

/* ---------------- COMPONENT ---------------- */

export default function UserDetailsModal({ id, onClose }: UserDetailsModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* -------- Fetch User -------- */
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get(`admin/users/${id}`);
        setUser(data.user);
        setOrders(data.orders);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Failed to fetch user details");
        } else {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  /* ---------------- STATES ---------------- */

  if (loading) {
    return (
      <Backdrop>
        <p className="bg-surface rounded-xl px-6 py-4 shadow">
          Loading user details…
        </p>
      </Backdrop>
    );
  }

  if (error || !user) {
    return (
      <Backdrop>
        <div className="bg-surface rounded-3xl shadow-2xl max-w-md w-full p-6 text-center space-y-4">
          <p className="text-error">{error || "User not found"}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-brand-primary text-text-inverse"
          >
            Close
          </button>
        </div>
      </Backdrop>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <Backdrop>
      <div className="bg-surface w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden">

        {/* ---------- HEADER ---------- */}
        <div className="sticky top-0 z-10 bg-surface flex items-center justify-between px-8 py-6 border-b border-border">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-brand-primary text-text-inverse flex items-center justify-center font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-brand text-2xl">{user.name}</h2>
                {user.role == "admin" ? (
                  <Badge label="Admin" />
                ) : (
                  <Badge label="User" />
                )}
              </div>
              <p className="text-sm text-text-secondary">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-full border border-border hover:bg-surface-accent transition"
          >
            Close ✕
          </button>
        </div>

        {/* ---------- CONTENT ---------- */}
        <div className="p-8 max-h-[80vh] overflow-y-auto space-y-10">

          {/* ---------- USER INFO ---------- */}
          <Section title="User Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard label="Name" value={user.name} />
              <InfoCard label="Email" value={user.email} />
              <InfoCard label="Phone" value={user.phone || "N/A"} />
              <InfoCard
                label="Joined"
                value={new Date(user.createdAt).toLocaleDateString()}
              />
            </div>
          </Section>

          {/* ---------- ORDERS ---------- */}
          <Section title={`Orders (${orders.length})`}>
  {orders.length === 0 ? (
    <p className="text-text-secondary text-sm">
      No orders placed yet.
    </p>
  ) : (
    <div className="divide-y divide-border rounded-2xl border border-border overflow-hidden">
      {orders.map((order) => (
        <OrderRow key={order._id} order={order} />
      ))}
    </div>
  )}
</Section>

        </div>
      </div>
    </Backdrop>
  );
}

/* ---------------- REUSABLE UI ---------------- */

function Backdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      {children}
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const createdAt = new Date(order.createdAt);

  const statusColor =
    order.orderStatus === "delivered"
      ? "text-green-600"
      : order.orderStatus === "cancelled"
      ? "text-red-600"
      : "text-yellow-600";

  return (
    <div className="px-6 py-4 hover:bg-surface-accent transition space-y-3">

      {/* TOP ROW */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            {createdAt.toLocaleDateString()}
            <span className="text-xs text-text-secondary ml-2">
              {createdAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </p>

          <p className="text-md text-text-secondary">
            <span className="font-semibold">Order ID: </span>{order._id}
          </p>
        </div>

        <span
          className={`text-xs px-3 py-1 rounded-full border border-border ${statusColor}`}
        >
          {order.orderStatus.toUpperCase()}
        </span>
      </div>

      {/* META INFO */}
      <div className="flex justify-between text-sm">

        <OrderMeta
          label="Items"
          value={order.orderItems.length}
        />

        <OrderMeta
          label="Total"
          value={`₹${order.totalPrice}`}
        />

        <OrderMeta
          label="Payment"
          value={order.paymentStatus ? "Paid" : "Pending"}
          valueClass={order.paymentStatus ? "text-green-600" : "text-yellow-600"}
        />
      </div>
    </div>
  );
}

function OrderMeta({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-text-secondary">
        {label}
      </p>
      <p className={`font-medium ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}


function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="px-3 py-1 rounded-full border border-border text-xs">
      {label}
    </span>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border p-4 bg-surface-accent">
      <p className="text-xs uppercase tracking-widest text-text-secondary mb-1">
        {label}
      </p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
