export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  _id: string;

  user?: {
    name: string;
    email: string;
  };

  orderItems: OrderItem[]; // ✅ REQUIRED
  totalPrice: number;

  paymentStatus: "pending" | "paid" | "failed";
  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";

  isPaid: boolean;
  isDelivered: boolean;

  createdAt: string;
}
