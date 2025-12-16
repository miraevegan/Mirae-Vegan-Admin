export interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minCartValue: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
