export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string; // ISO date string

  ordersCount: number;
  totalSpent: number;
}
