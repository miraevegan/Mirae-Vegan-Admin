import api from "@/lib/api";
import type { Order } from "@/types/order";

interface Props {
    orders: Order[];
    onView: (order: Order) => void;
    onRefresh: () => void;
}

export default function OrdersTable({ orders, onView, onRefresh }: Props) {
    const markPaid = async (id: string) => {
        if (!confirm("Mark this order as paid?")) return;
        await api.put(`/orders/${id}/pay`);
        onRefresh();
    };

    return (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-surface border-b border-border">
                    <tr className="text-text-secondary text-left">
                        <th className="px-6 py-4">Order</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Total</th>
                        <th className="px-6 py-4">Payment</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {orders.map((order) => (
                        <tr
                            key={order._id}
                            className="border-b border-border last:border-none hover:bg-surface-accent/40"
                        >
                            <td className="px-6 py-4 font-mono">
                                #{order._id.slice(-6)}
                            </td>

                            <td className="px-6 py-4">
                                <div className="font-medium">{order.user?.name}</div>
                                <div className="text-xs text-text-secondary">
                                    {order.user?.email}
                                </div>
                            </td>

                            <td className="px-6 py-4">
                                ₹{(order.totalPrice ?? 0).toLocaleString()}
                            </td>

                            <td className="px-6 py-4">
                                {order.paymentStatus === "paid" ? (
                                    <span className="text-green-600 font-medium">Paid</span>
                                ) : order.paymentMethod === "UPI_MANUAL" ? (
                                    <button
                                        onClick={() => markPaid(order._id)}
                                        className="text-brand-primary hover:underline"
                                    >
                                        Mark Paid
                                    </button>
                                ) : (
                                    <span className="text-xs text-green-700">Razorpay</span>
                                )}
                            </td>

                            <td className="px-6 py-4 capitalize">
                                {order.orderStatus.replaceAll("_", " ")}
                            </td>

                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={() => onView(order)}
                                    className="text-brand-secondary hover:underline"
                                >
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
