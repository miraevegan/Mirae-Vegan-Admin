export interface Discount {
  percentage: number;
  discountedPrice: number;
}

export interface ProductImage {
  url: string;
  public_id: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  discount?: Discount;
  images?: ProductImage[];  // Added images array here
}
