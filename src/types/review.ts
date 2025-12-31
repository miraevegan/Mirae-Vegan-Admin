export interface Review {
  _id: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
  testimonial?: boolean; // <-- new optional field

  product: {
    _id: string;
    name: string;
    slug: string;
  };

  user: {
    _id: string;
    name: string;
    email: string;
  };
}
