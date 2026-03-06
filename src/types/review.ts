export interface ReviewImage {
  url: string;
  public_id: string;
}

export interface Review {
  _id: string;

  rating: number;
  comment: string;

  userName: string;
  phone?: string;

  createdAt: string;

  testimonial?: boolean;

  source?: "website" | "manual";

  image?: ReviewImage;

  product: {
    _id: string;
    name: string;
    slug?: string;
  };

  user?: {
    _id: string;
    name: string;
    email: string;
  };
}