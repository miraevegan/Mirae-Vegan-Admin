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
        <div className="flex items-center justify-between px-8 py-6 border-b border-border">
          <div>
            <h2 className="font-brand text-2xl">{user.name}</h2>
            <p className="text-sm text-text-secondary">{user.email}</p>
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
            <InfoRow label="Name" value={user.name} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Phone" value={user.phone || "N/A"} />
            <InfoRow
              label="Joined"
              value={new Date(user.createdAt).toLocaleDateString()}
            />
            <InfoRow
              label="Admin"
              value={
                user.role == "admin" ? (
                  <Badge label="Yes" />
                ) : (
                  <Badge label="No" />
                )
              }
            />
          </Section>

          {/* ---------- ORDERS ---------- */}
          <Section title={`Orders (${orders.length})`}>
            {orders.length === 0 ? (
              <p className="text-text-secondary text-sm">
                No orders placed yet.
              </p>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="border border-border rounded-xl p-4 space-y-2"
                  >
                    <InfoRow label="Order ID" value={order._id} />
                    <InfoRow
                      label="Items"
                      value={order.orderItems.length}
                    />
                    {/* <InfoRow
                      label="Total"
                      value={`₹${order.totalPrice.toLocaleString()}`}
                    /> */}
                    <InfoRow
                      label="Paid"
                      value={
                        order.isPaid ? (
                          <span className="text-green-600 font-medium">
                            Yes
                          </span>
                        ) : (
                          <span className="text-red-600 font-medium">
                            No
                          </span>
                        )
                      }
                    />
                    <InfoRow
                      label="Delivered"
                      value={
                        order.isDelivered ? (
                          <span className="text-green-600 font-medium">
                            Yes
                          </span>
                        ) : (
                          <span className="text-red-600 font-medium">
                            No
                          </span>
                        )
                      }
                    />
                    <InfoRow
                      label="Ordered On"
                      value={new Date(
                        order.createdAt
                      ).toLocaleDateString()}
                    />
                  </div>
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

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between text-sm text-text-secondary">
      <span className="font-medium text-text-primary">{label}</span>
      <span>{value}</span>
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
