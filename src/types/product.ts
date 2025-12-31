export interface ProductImage {
  url: string;
  public_id: string;
}

export interface VariantAttribute {
  color?: {
    name: string;
    hex: string;
  };
  size?: string;
  // You can extend this if you want to match other attribute keys
}

export interface Variant {
  _id?: string;
  attributes: VariantAttribute;
  price: number;
  stock: number;
  images?: ProductImage[];
  sku?: string;
}

export interface Discount {
  percentage?: number; // optional because backend sets default to 0
}

export interface Specifications {
  material?: string;
  care?: string;
  origin?: string;
  weight?: string;
  warranty?: string;
}

export interface ProductAttributes {
  [key: string]: unknown; // flexible for arbitrary product-level attributes
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  description: string;

  images: ProductImage[];
  variants: Variant[];

  discount?: Discount;

  attributes?: ProductAttributes;

  specifications?: Specifications;

  ratings?: number;
  numOfReviews?: number;

  isBestSeller?: boolean;
  isJustLanded?: boolean;
}
