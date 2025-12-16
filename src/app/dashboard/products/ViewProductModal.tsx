"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/* ---------------- TYPES ---------------- */

interface Review {
  _id: string;
  user: string;       // userId
  userName: string;   // from Review schema
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductDetails {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  discount?: {
    percentage: number;
    discountedPrice: number;
  };
  ratings: number;
  numOfReviews: number;
  images: { url: string }[];
}

interface ViewProductModalProps {
  slug: string;
  onClose: () => void;
}

/* ---------------- COMPONENT ---------------- */

export default function ViewProductModal({
  slug,
  onClose,
}: ViewProductModalProps) {
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState<string | null>(null);

  /* -------- Fetch Product -------- */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_HOSTED_API_URL}/products/${slug}`
        );

        if (!res.ok) throw new Error("Failed to fetch product");

        const data = await res.json();
        setProduct(data.product);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (product?.images.length) {
      setActiveImage(product.images[0].url);
    }
  }, [product]);

  /* -------- Fetch Reviews -------- */
  useEffect(() => {
    if (!product?._id) return;

    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_HOSTED_API_URL}/reviews/${product._id}`
        );

        if (!res.ok) throw new Error("Failed to fetch reviews");

        const data = await res.json();
        setReviews(data.reviews || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [product?._id]);

  if (loadingProduct) return <p>Loading product details...</p>;
  if (error) return <p className="text-error">{error}</p>;
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-surface w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden">

        {/* ---------- HEADER ---------- */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border">
          <div>
            <h2 className="font-brand text-2xl">{product.name}</h2>
            <p className="text-text-secondary text-sm">{product.category}</p>
          </div>

          <button
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-full border border-border hover:bg-surface-accent transition"
          >
            Close ✕
          </button>
        </div>

        {/* ---------- CONTENT ---------- */}
        <div className="p-8 max-h-[80vh] overflow-y-auto space-y-10">

          {/* ---------- TOP SECTION ---------- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* ---------- LEFT : IMAGES ---------- */}
            <div className="flex gap-4">

              {/* Thumbnails */}
              <div className="flex lg:flex-col gap-3 overflow-auto max-h-105">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img.url)}
                    className={`border rounded-xl p-1 transition
              ${activeImage === img.url
                        ? "border-brand-primary"
                        : "border-border opacity-70 hover:opacity-100"}`}
                  >
                    <Image
                      src={img.url}
                      alt={product.name}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-1 bg-surface-accent rounded-2xl flex items-center justify-center">
                {activeImage && (
                  <Image
                    src={activeImage}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="rounded-2xl object-cover max-h-105"
                  />
                )}
              </div>
            </div>

            {/* ---------- RIGHT : DETAILS ---------- */}
            <div className="space-y-6">

              {/* Price */}
              <div>
                <p className="text-3xl font-semibold">
                  ₹{product.price.toLocaleString()}
                </p>

                {product.discount && (
                  <p className="text-sm text-brand-primary mt-1">
                    {product.discount.percentage}% OFF · ₹
                    {product.discount.discountedPrice}
                  </p>
                )}
              </div>

              {/* Meta */}
              <div className="flex gap-4 text-sm">
                <Badge label={`Stock: ${product.stock}`} />
                <Badge label={`${product.ratings} ⭐`} />
                <Badge label={`${product.numOfReviews} Reviews`} />
              </div>

              {/* Category */}
              <p className="text-sm text-text-secondary">
                Category: <span className="font-medium">{product.category}</span>
              </p>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* ---------- DESCRIPTION ---------- */}
              <div className="bg-surface-accent rounded-2xl">
                <h4 className="font-semibold mb-2">Product Description</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
          </div>

          {/* ---------- REVIEWS ---------- */}
          <div className="bg-surface-accent rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-6">
              Reviews ({reviews.length})
            </h3>

            {loadingReviews ? (
              <p>Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-text-secondary">No reviews yet</p>
            ) : (
              <div className="grid gap-4">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="rounded-xl border border-border p-4"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-medium">{review.userName}</p>
                      <span className="text-sm">{review.rating} ⭐</span>
                    </div>

                    <p className="text-sm text-text-secondary">
                      {review.comment}
                    </p>

                    <p className="text-xs text-text-secondary mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="px-3 py-1 rounded-full border border-border text-xs">
      {label}
    </span>
  );
}
