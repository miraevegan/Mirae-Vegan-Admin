export interface OrderItemVariant {
  id: string;
  label: string;   // e.g. "color: Black / size: XL"
  price: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  product: {
    _id: string;
    name?: string; // populated in admin
  };
  variant: OrderItemVariant;
  quantity: number;
  image?: string;
}

export interface PaymentResult {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  status: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  city: string;
  state: string;
  pincode: string;
  addressLine1?: string;    // Optional, you can add these if your data may have them
  addressLine2?: string;
  country?: string;
}

export interface Order {
  _id: string;

  user?: {
    name: string;
    email: string;
  };

  orderItems: OrderItem[];

  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;

  paymentMethod: "UPI_MANUAL" | "RAZORPAY";
  paymentStatus: "pending" | "paid" | "failed";

  orderStatus: OrderStatus;
  
  paidAt?: string;
  deliveredAt?: string;

  createdAt: string;
  updatedAt: string;

  paymentResult?: PaymentResult;
  shippingAddress?: ShippingAddress;
}
