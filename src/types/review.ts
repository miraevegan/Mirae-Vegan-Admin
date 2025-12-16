export interface Review {
  _id: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;

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
