"use client";

import { motion } from "framer-motion";
import { X, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import type { Order, OrderStatus } from "@/types/order";
import Image from "next/image";

type Props = {
  order: Order;
  onClose: () => void;
  onUpdated: () => void | Promise<void>;
};

const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped"],
  shipped: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-200 text-yellow-900 border-yellow-300",
  confirmed: "bg-blue-200 text-blue-900 border-blue-300",
  processing: "bg-purple-200 text-purple-900 border-purple-300",
  shipped: "bg-indigo-200 text-indigo-900 border-indigo-300",
  out_for_delivery: "bg-teal-200 text-teal-900 border-teal-300",
  delivered: "bg-green-200 text-green-900 border-green-300",
  cancelled: "bg-red-200 text-red-900 border-red-300",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: "bg-green-200 text-green-900",
  pending: "bg-yellow-200 text-yellow-900",
  failed: "bg-red-200 text-red-900",
};

export default function ViewOrderModal({
  order,
  onClose,
  onUpdated,
}: Props) {
  const [updatingStatus, setUpdatingStatus] = useState<OrderStatus | null>(null);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const allowedNext = STATUS_FLOW[order.orderStatus];
  const modalRef = useRef<HTMLDivElement>(null);

  // Accessibility: Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Focus trap (basic)
  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  const updateStatus = async (status: OrderStatus) => {
    if (status === order.orderStatus || updatingStatus) return;

    if (status === "cancelled") {
      const confirmCancel = window.confirm(
        "Are you sure you want to cancel this order?"
      );
      if (!confirmCancel) return;
    }

    try {
      setUpdatingStatus(status);
      setMessage(null);

      await api.put(`/orders/${order._id}/status`, { orderStatus: status });

      setMessage({ type: "success", text: `Order status updated to ${status.replaceAll("_", " ")}` });
      await onUpdated();
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error("Failed to update order status", err);
      setMessage({ type: "error", text: "Failed to update order status" });
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Visual progress bar for order status
  const statusIndex = STATUSES.indexOf(order.orderStatus);

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="bg-background w-full max-w-3xl rounded-3xl shadow-lg flex flex-col max-h-[90vh] focus:outline-none"
        tabIndex={-1}
        ref={modalRef}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            // Simple focus trap could be implemented here for accessibility
          }
        }}
      >
        {/* Sticky Header */}
        <header className="sticky top-0 bg-background z-20 p-6 border-b border-gray-200 flex justify-between items-center rounded-t-3xl">
          <div className="">
            <h2 id="modal-title" className="text-2xl font-semibold">
            Order Details
          </h2>
          {/* Order ID */}
          <p className="text-gray-600 select-text break-all text-sm">
            <span className="font-semibold">Order Id: </span>{order._id}
          </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-500 hover:text-gray-900 transition"
            disabled={updatingStatus !== null}
          >
            <X size={28} />
          </button>
        </header>

        {/* Scrollable content */}
        <main className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Order Status Timeline */}
          <section>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              Order Status{" "}
              <Info size={18} className="text-blue-500" />
            </h3>
            <div className="flex items-center space-x-4 overflow-x-auto border border-dashed border-border rounded-2xl p-4 justify-center">
              {STATUSES.map((status, idx) => {
                const isActive = status === order.orderStatus;
                const isCompleted = idx < statusIndex;
                // const isNext = idx === statusIndex + 1;

                return (
                  <div key={status} className="flex items-center gap-2">
                    <div
                      className={`flex items-center justify-center rounded-full w-6 h-6 border-2
                      ${
                        isCompleted
                          ? "bg-brand-primary border-brand-primary text-white"
                          : isActive
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "border-gray-300 text-gray-400"
                      }
                      `}
                      aria-current={isActive ? "step" : undefined}
                    >
                      {isCompleted || isActive ? <CheckCircle size={20} /> : idx + 1}
                    </div>
                    {idx !== STATUSES.length - 1 && (
                      <div
                        className={`h-1 w-12 ${
                          isCompleted
                            ? "bg-brand-primary"
                            : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Customer Info */}
          {order.user && (
            <section>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                Customer Info <Info size={18} className="text-blue-500" />
              </h3>
              <p>{order.user.name}</p>
              <p className="text-gray-500">{order.user.email}</p>
            </section>
          )}

          {/* Payment & Shipping */}
          <section>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              Payment & Shipping <Info size={18} className="text-blue-500" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Payment ID:</span>{" "}
                  <span className="font-mono">
                    {order.paymentResult?.razorpayPaymentId || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Payment Status:</span>{" "}
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                      PAYMENT_STATUS_COLORS[order.paymentStatus] ||
                      "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {order.paymentStatus.charAt(0).toUpperCase() +
                      order.paymentStatus.slice(1)}
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Payment Method:</span>{" "}
                  {order.paymentMethod}
                </p>
                {order.paidAt && (
                  <p>
                    <span className="font-semibold">Paid At:</span>{" "}
                    {new Date(order.paidAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div>
                <p>
                  <span className="font-semibold">Order Date:</span>{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </p>

                <p className="font-semibold mt-3 mb-1">Shipping Address:</p>
                <address className="not-italic text-gray-700 text-sm ml-2 whitespace-pre-line">
                  {order.shippingAddress
                    ? `${order.shippingAddress.fullName || "N/A"}\n` +
                      (order.shippingAddress.addressLine1
                        ? order.shippingAddress.addressLine1 + "\n"
                        : "") +
                      (order.shippingAddress.addressLine2
                        ? order.shippingAddress.addressLine2 + "\n"
                        : "") +
                      `${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}\n` +
                      (order.shippingAddress.country
                        ? order.shippingAddress.country + "\n"
                        : "") +
                      `Phone: ${order.shippingAddress.phone || "N/A"}`
                    : "No shipping address provided."}
                </address>

                {order.deliveredAt && (
                  <p className="mt-2 text-sm text-green-700 font-semibold">
                    Delivered At: {new Date(order.deliveredAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Order Items */}
          <section className="border rounded-xl divide-y divide-gray-200 max-h-64 overflow-y-auto">
            {order.orderItems.map((item, i) => (
              <div
                key={i}
                className="flex justify-between p-4 hover:bg-gray-50 transition rounded-t-xl last:rounded-b-xl"
              >
                <div className="flex items-center gap-4">
                  {item.image && (
                    <Image
                      src={item.image}
                      height={48}
                      width={48}
                      alt={item.product?.name || "Product image"}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium">{item.product?.name ?? "Product"}</p>
                    {item.variant.label && (
                      <p className="text-xs text-gray-500 mt-1">{item.variant.label}</p>
                    )}
                    <p className="text-sm text-gray-400 mt-1">Qty: {item.quantity}</p>
                  </div>
                </div>

                <p className="font-semibold text-gray-700">
                  ₹{(item.variant.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </section>

          {/* Price Summary */}
          <section className="text-right space-y-1">
            <div>
              <span className="font-semibold">Items Price: </span>₹
              {order.itemsPrice.toLocaleString()}
            </div>
            <div>
              <span className="font-semibold">Tax: </span>₹{order.taxPrice.toLocaleString()}
            </div>
            <div>
              <span className="font-semibold">Shipping: </span>₹
              {order.shippingPrice.toLocaleString()}
            </div>
            <div className="text-xl font-bold text-green-700">
              Total: ₹{order.totalPrice.toLocaleString()}
            </div>
          </section>
        </main>

        {/* Status Buttons */}
        <footer className="sticky bottom-0 bg-background z-20 border-t border-gray-200 p-6 flex flex-wrap gap-3 justify-end rounded-b-3xl">
          {message && (
            <div
              className={`flex items-center gap-2 text-sm font-semibold ${
                message.type === "success"
                  ? "text-green-700"
                  : "text-red-700"
              }`}
              role="alert"
            >
              {message.type === "success" ? (
                <CheckCircle size={18} />
              ) : (
                <AlertTriangle size={18} />
              )}
              {message.text}
            </div>
          )}

          {STATUSES.map((status) => {
            const isActive = order.orderStatus === status;
            const isDisabled =
              updatingStatus !== null ||
              isActive ||
              !allowedNext.includes(status);

            return (
              <button
                key={status}
                disabled={isDisabled}
                onClick={() => updateStatus(status)}
                title={
                  isDisabled && !isActive
                    ? "You cannot select this status yet"
                    : undefined
                }
                className={`capitalize px-4 py-2 rounded-full border font-semibold text-sm flex items-center justify-center gap-2
                  ${isActive
                    ? `${STATUS_COLORS[status]} cursor-default`
                    : "border-gray-300 bg-white hover:bg-gray-100"
                  }
                  ${isDisabled && !isActive ? "opacity-40 cursor-not-allowed" : ""}
                `}
                aria-pressed={isActive}
              >
                {updatingStatus === status ? (
                  <>
                    <span className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    Updating…
                  </>
                ) : (
                  status.replaceAll("_", " ")
                )}
              </button>
            );
          })}
        </footer>
      </motion.div>
    </div>
  );
}
