"use client";

import { useState } from "react";
import type { Product, ProductImage } from "@/types/product";
import Image from "next/image";

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
}

export default function EditProductModal({
  product,
  onClose,
  onSave,
}: EditProductModalProps) {
  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState(product.category);
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(product.stock);
  const [description, setDescription] = useState(product.description);
  const [discountPercentage, setDiscountPercentage] = useState(
    product.discount?.percentage || 0
  );
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [images, setImages] = useState(product.images || []);
  const [isDeletingImageId, setIsDeletingImageId] = useState<string | null>(null);

  const discountedPrice =
    price - (price * discountPercentage) / 100;

  // Handle new image files selection
  const handleNewImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImages(files);
      const urls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  // Delete image handler
  const handleDeleteImage = async (publicId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    setIsDeletingImageId(publicId);

    try {
      const encodedPublicId = encodeURIComponent(publicId);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${product._id}/images/${encodedPublicId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("mirae_admin_token")}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete image");

      const data = await res.json();

      setImages(data.images); // Update images after delete
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsDeletingImageId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use FormData to send updated fields + new images
    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("price", price.toString());
    formData.append("stock", stock.toString());
    formData.append("description", description);
    formData.append("discountPercentage", discountPercentage.toString());

    newImages.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${product._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("mirae_admin_token")}`,
            // IMPORTANT: Do NOT set Content-Type header with FormData!
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Failed to update product");

      const data = await res.json();
      onSave(data.product);
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unknown error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-surface w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">

        {/* ---------- HEADER ---------- */}
        <div className="px-8 py-6 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="font-brand text-2xl">Edit Product</h2>
            <p className="text-sm text-text-secondary">
              Update product details carefully
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-full border border-border hover:bg-surface-accent transition"
          >
            ✕ Close
          </button>
        </div>

        {/* ---------- FORM ---------- */}
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-8 max-h-[75vh] overflow-y-auto"
          encType="multipart/form-data"
        >
          {/* Basic Info */}
          <Section title="Basic Information">
            <Input label="Product Name" value={name} onChange={setName} required />
            <Input label="Category" value={category} onChange={setCategory} required />
          </Section>

          {/* Description */}
          <Section title="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </Section>

          {/* Pricing */}
          <Section title="Pricing & Stock">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NumberInput label="Price (₹)" value={price} onChange={setPrice} min={0} required />
              <NumberInput label="Stock" value={stock} onChange={setStock} min={0} required />
              <NumberInput
                label="Discount (%)"
                value={discountPercentage}
                onChange={setDiscountPercentage}
                min={0}
                max={100}
              />
            </div>

            {discountPercentage > 0 && (
              <div className="mt-4 rounded-xl bg-brand-primary/10 p-4">
                <p className="text-sm font-medium text-brand-primary">
                  Discounted Price
                </p>
                <p className="text-lg font-semibold">
                  ₹{discountedPrice.toLocaleString()}
                </p>
              </div>
            )}
          </Section>

          {/* Existing Images with Delete */}
          <Section title="Existing Images">
            <div className="flex flex-wrap gap-4">
              {images.length === 0 && (
                <p className="text-text-secondary">No images available</p>
              )}
              {images.map(({ url, public_id }: ProductImage) => (
                <div key={public_id} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                  <Image
                    src={url}
                    alt="Product Image"
                    width={150}
                    height={150}
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(public_id)}
                    disabled={isDeletingImageId === public_id}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700 transition"
                    title="Delete Image"
                  >
                    {isDeletingImageId === public_id ? "..." : "×"}
                  </button>
                </div>
              ))}
            </div>
          </Section>

          {/* Upload New Images */}
          <Section title="Add New Images">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleNewImagesChange}
              className="w-full text-sm text-text-secondary"
            />
            <div className="mt-4 flex flex-wrap gap-4">
              {previewUrls.map((url, idx) => (
                <Image
                  key={idx}
                  src={url}
                  width={150}
                  height={150}
                  alt={`New Preview ${idx + 1}`}
                  className="w-24 h-24 object-cover rounded-lg border border-border"
                />
              ))}
            </div>
          </Section>

          {/* ---------- FOOTER ---------- */}
          <div className="sticky bottom-0 bg-surface pt-6 border-t border-border flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-border hover:bg-surface-accent transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-brand-primary text-text-inverse hover:opacity-90 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- REUSABLE UI ---------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm text-text-secondary mb-1 block">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
        required={required}
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  required = false,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm text-text-secondary mb-1 block">
        {label}
      </label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
        required={required}
      />
    </div>
  );
}
