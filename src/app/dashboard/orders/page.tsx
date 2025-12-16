"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Order } from "@/types/order";
import OrdersTable from "./OrdersTable";
import ViewOrderModal from "./ViewOrderModal";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await api.get("/orders");
    setOrders(data.orders);
    setLoading(false);
  };

  useEffect(() => {
  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/orders");
      setOrders(data.orders);
    } finally {
      setLoading(false);
    }
  };

  loadOrders();
}, []);

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-brand text-2xl mb-1">Orders</h1>
        <p className="text-text-secondary text-sm">
          Manage customer orders & payments
        </p>
      </div>

      <OrdersTable
        orders={orders}
        onView={setViewingOrder}
        onRefresh={fetchOrders}
      />

      {viewingOrder && (
        <ViewOrderModal
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
          onUpdated={fetchOrders}
        />
      )}
    </div>
  );
}
