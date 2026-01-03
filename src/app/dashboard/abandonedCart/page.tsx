"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, Clock, Phone, RefreshCw } from "lucide-react";
import api from "@/lib/api";

type AbandonedCartItem = {
  productId: string;
  variantId: string;
  name: string;
  variantName?: string;
  quantity: number;
};

type AbandonedCart = {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  items: AbandonedCartItem[];
  status: "abandoned" | "converted";
  createdAt: string;
  convertedAt?: string;
};

export default function AdminAbandonedCarts() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCarts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/abandoned_carts");
      setCarts(res.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to load carts");
    } finally {
      setLoading(false);
    }
  };

  const markAsConverted = async (cartId: string) => {
    try {
      await api.put(`/abandoned_carts/${cartId}/convert`);
      fetchCarts();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "Failed to update cart");
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  if (loading)
    return (
      <p className="text-center py-10 text-lg font-medium text-gray-700">
        Loading abandoned carts...
      </p>
    );
  if (error)
    return (
      <p className="text-center py-10 text-red-600 font-medium text-lg">
        {error}
      </p>
    );

  return (
    <div className="max-w-full overflow-x-auto p-8 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">
        Abandoned Carts
      </h1>

      {carts.length === 0 ? (
        <p className="text-center text-gray-600 text-lg mt-16">
          No abandoned carts found.
        </p>
      ) : (
        <table className="min-w-full rounded-lg shadow-md overflow-hidden bg-surface border border-border">
          <thead className="text-brand-primary sticky top-0 z-10 border-b border-border">
            <tr>
              <th className="text-left py-4 px-6 font-medium">User</th>
              <th className="text-left py-4 px-6 font-medium">Email</th>
              <th className="text-left py-4 px-6 font-medium">Phone</th>
              <th className="text-left py-4 px-6 font-medium">Status</th>
              <th className="text-left py-4 px-6 font-medium max-w-xs">
                Cart Items
              </th>
              <th className="text-left py-4 px-6 font-medium">Converted On</th>
              <th className="text-center py-4 px-6 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {carts.map((cart) => (
              <tr
                key={cart._id}
                className="border-b hover:bg-background transition-colors cursor-default"
              >
                <td className="py-4 px-6 whitespace-nowrap text-gray-800 font-medium">
                  {cart.userName}
                </td>
                <td className="py-4 px-6 whitespace-nowrap text-gray-600 font-medium">
                  {cart.userEmail}
                </td>
                <td className="py-4 px-6 whitespace-nowrap text-gray-600 flex items-center gap-2">
                  {cart.userPhone ? (
                    <>
                      <Phone size={16} />
                      {cart.userPhone}
                    </>
                  ) : (
                    <span className="italic text-gray-400">N/A</span>
                  )}
                </td>
                <td className="py-4 px-6 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium text-xs tracking-wide ${
                      cart.status === "converted"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {cart.status === "converted" ? (
                      <CheckCircle size={14} />
                    ) : (
                      <Clock size={14} />
                    )}
                    {cart.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-4 px-6 max-w-xs max-h-28 overflow-auto text-sm text-gray-700">
                  {Array.isArray(cart.items) && cart.items.length > 0 ? (
                    <ul className="space-y-1">
                      {cart.items.map((item, idx) => (
                        <li
                          key={idx}
                          title={`${item.name} ${
                            item.variantName ? `(${item.variantName})` : ""
                          }`}
                          className="truncate"
                        >
                          {item.name}
                          {item.variantName ? ` (${item.variantName})` : ""} ×{" "}
                          {item.quantity}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="italic text-gray-400">No items found</span>
                  )}
                </td>
                <td className="py-4 px-6 whitespace-nowrap text-gray-500 text-sm">
                  {cart.status === "converted" && cart.convertedAt
                    ? new Date(cart.convertedAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "-"}
                </td>
                <td className="py-4 px-6 whitespace-nowrap text-center">
                  {cart.status === "abandoned" && (
                    <button
                      onClick={() => markAsConverted(cart._id)}
                      title="Mark as Converted"
                      className="inline-flex items-center gap-1 px-3 hover:cursor-pointer py-1 rounded bg-brand-primary text-white text-sm font-medium hover:bg-hover transition"
                    >
                      <RefreshCw size={16} />
                      Convert
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
