"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import api from "@/lib/api";
import type { Order } from "@/types/order";

type Props = {
  order: Order;
  onClose: () => void;
  onUpdated: () => void | Promise<void>;
};

const STATUSES = [
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

export default function ViewOrderModal({
  order,
  onClose,
  onUpdated,
}: Props) {
  const updateStatus = async (status: string) => {
    try {
      await api.put(`/orders/${order._id}/status`, {
        orderStatus: status,
      });

      await onUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to update order status", err);
      alert("Failed to update order status");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-2xl rounded-2xl p-6 relative"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-black"
        >
          <X />
        </button>

        {/* Header */}
        <h2 className="text-xl font-semibold mb-1">Order Details</h2>
        <p className="text-sm text-gray-500 mb-4">
          Order ID: {order._id}
        </p>

        {/* User */}
        {order.user && (
          <div className="mb-4">
            <p className="font-medium">{order.user.name}</p>
            <p className="text-sm text-gray-500">{order.user.email}</p>
          </div>
        )}

        {/* Items */}
        <div className="border rounded-xl divide-y mb-4">
          {order.orderItems.map((item, i) => (
            <div key={i} className="flex justify-between p-3">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity}
                </p>
              </div>
              <p className="font-medium">
                ₹{(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center mb-6">
          <p className="font-semibold">Total</p>
          <p className="font-semibold text-lg">
            ₹{order.totalPrice.toLocaleString()}
          </p>
        </div>

        {/* Status Actions */}
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => updateStatus(status)}
              className={`px-3 py-1 rounded-full text-sm border transition
                ${
                  order.orderStatus === status
                    ? "bg-black text-white"
                    : "hover:bg-gray-100"
                }`}
            >
              {status.replaceAll("_", " ")}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
