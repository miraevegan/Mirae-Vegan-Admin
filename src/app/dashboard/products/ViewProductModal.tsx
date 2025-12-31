"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface Review {
  _id: string;
  user: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductImage {
  url: string;
}

interface Variant {
  _id: string;
  price: number;
  stock: number;
  images?: ProductImage[];
  sku?: string;
  attributes: {
    color?: { name: string; hex: string };
    size?: string;
  };
}

interface Discount {
  percentage: number;
}

interface ProductDetails {
  _id: string;
  name: string;
  category: string;
  description: string;
  variants: Variant[];
  discount?: Discount;
  ratings: number;
  numOfReviews: number;
  images: ProductImage[];
  attributes?: {
    material?: string;
    fit?: string;
  }
  specifications?: {
    care?: string;
  };
}

interface ViewProductModalProps {
  slug: string;
  onClose: () => void;
}

export default function ViewProductModal({ slug, onClose }: ViewProductModalProps) {
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        setError("");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`);

        if (!res.ok) throw new Error(`Failed to fetch product: ${res.status}`);

        const data = await res.json();
        setProduct(data);

        console.log("Fetched product data:", data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (!product) return;

    const variant = product.variants[activeVariantIndex];
    const variantImage = variant?.images?.[0]?.url;
    const fallbackImage = product.images?.[0]?.url;

    setActiveImage(variantImage || fallbackImage || null);
  }, [product, activeVariantIndex]);

  useEffect(() => {
    if (!product?._id) return;

    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${product._id}`);

        if (!res.ok) throw new Error(`Failed to fetch reviews: ${res.status}`);

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

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const getTotalStock = (variants: Variant[]) => {
    return variants.reduce((acc, v) => acc + v.stock, 0);
  };

  const getActiveVariant = () => {
    return product?.variants[activeVariantIndex];
  };

  const getDiscountedPrice = (price: number, discount?: Discount) => {
    if (!discount || discount.percentage <= 0) return price;
    return Math.round(price - (price * discount.percentage) / 100);
  };

  const getDiscountAmount = (price: number, discount?: Discount) => {
    if (!discount || discount.percentage <= 0) return 0;
    return Math.round((price * discount.percentage) / 100);
  };

  if (loadingProduct) return <p>Loading product details...</p>;
  if (error) return <p className="text-error">{error}</p>;
  if (!product) return null;

  const getDisplayImages = () => {
    if (!product) return [];

    const variantImages =
      product.variants[activeVariantIndex]?.images ?? [];

    const variantUrls = new Set(variantImages.map((img) => img.url));

    const remainingProductImages = product.images.filter(
      (img) => !variantUrls.has(img.url)
    );

    return [...variantImages, ...remainingProductImages];
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-title"
    >
      <div className="bg-surface w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border">
          <div>
            <h2 id="product-title" className="font-brand text-2xl">{product.name}</h2>
            <p className="text-text-secondary text-sm">{product.category}</p>
          </div>

          <button
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-full border border-border hover:bg-surface-accent transition"
            aria-label="Close product details"
            type="button"
          >
            Close ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-8 max-h-[80vh] overflow-y-auto space-y-10">

          {/* TOP SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* IMAGES */}
            <div className="flex gap-4">

              {/* Thumbnails */}
              <div className="flex lg:flex-col gap-3 overflow-auto max-h-105">
                {getDisplayImages().map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img.url)}
                    className={`border rounded-xl p-1 transition
                        ${activeImage === img.url
                        ? "border-brand-primary"
                        : "border-border opacity-70 hover:opacity-100"}`}
                    type="button"
                  >
                    <Image
                      src={img.url}
                      alt={`${product.name} image ${i + 1}`}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-1 bg-surface-accent rounded-2xl flex justify-center">
                {activeImage ? (
                  <Image
                    src={activeImage}
                    alt={`${product.name} main image`}
                    width={500}
                    height={500}
                    className="rounded-2xl object-cover max-h-105"
                  />
                ) : (
                  <div className="text-text-secondary">No Image Available</div>
                )}
              </div>
            </div>

            {/* DETAILS */}
            <div className="space-y-6">

              {/* Price */}
              <div>
                {(() => {
                  const variant = getActiveVariant();
                  if (!variant) return null;

                  console.log("DISCOUNT:", product.discount);

                  const originalPrice = variant.price;
                  const discountedPrice = getDiscountedPrice(originalPrice, product.discount);
                  const discountAmount = getDiscountAmount(originalPrice, product.discount);

                  return (
                    <div className="space-y-1">
                      {/* Discounted Price */}
                      <p className="text-3xl font-semibold">
                        ₹{discountedPrice.toLocaleString()}
                      </p>

                      {/* Original Price + Discount Info */}
                      {product.discount && product.discount.percentage > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="line-through text-text-secondary">
                            ₹{originalPrice.toLocaleString()}
                          </span>

                          <span className="text-green-600 font-medium">
                            Save ₹{discountAmount.toLocaleString()} ({product.discount.percentage}% OFF)
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Meta */}
              <div className="flex gap-4 text-sm">
                <Badge label={`Stock: ${getTotalStock(product.variants)}`} />
                <Badge label={`${product.ratings} ⭐`} />
                <Badge label={`${product.numOfReviews} Reviews`} />
              </div>

              {/* Category */}
              <p className="text-sm text-text-secondary">
                Category: <span className="font-medium">{product.category}</span>
              </p>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Description */}
              <div className="bg-surface-accent rounded-2xl">
                <h4 className="font-semibold mb-2">Product Description</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* VARIANTS */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">
                  Variants ({product.variants.length})
                </h4>

                <div className="space-y-4">
                  {product.variants.map((variant, index) => (
                    <div
                      key={variant._id}
                      className={`border rounded-2xl p-4 space-y-3 cursor-pointer transition
                          ${activeVariantIndex === index
                          ? "border-brand-primary bg-border"
                          : "border-border hover:border-brand-primary/50"}`}
                      onClick={() => {
                        setActiveVariantIndex(index);
                        setActiveImage(variant.images?.[0]?.url || null);
                      }}
                    >
                      {/* Variant Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Color Swatch */}
                          {variant.attributes.color && (
                            <span
                              className="w-5 h-5 rounded-full border"
                              style={{ backgroundColor: variant.attributes.color.hex }}
                              title={variant.attributes.color.name}
                            />
                          )}

                          <span className="text-sm font-medium">
                            Variant {index + 1}
                            {variant.attributes.color &&
                              ` · ${variant.attributes.color.name}`}
                          </span>
                        </div>

                        <span className="text-sm font-semibold">
                          ₹{getDiscountedPrice(variant.price, product.discount).toLocaleString()}
                        </span>
                      </div>

                      {/* Stock */}
                      <div className="text-sm text-text-secondary">
                        Stock:{" "}
                        <span
                          className={
                            variant.stock > 0
                              ? "text-green-600 font-medium"
                              : "text-red-600 font-medium"
                          }
                        >
                          {variant.stock > 0 ? variant.stock : "Out of stock"}
                        </span>
                      </div>

                      {/* Variant Images */}
                      {variant.images && variant.images.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {variant.images.map((img, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setActiveImage(img.url)}
                              className="border rounded-lg p-1 hover:border-brand-primary transition"
                            >
                              <Image
                                src={img.url}
                                alt="Variant image"
                                width={60}
                                height={60}
                                className="rounded-md object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* REVIEWS */}
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

                    <p className="text-sm text-text-secondary">{review.comment}</p>

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
