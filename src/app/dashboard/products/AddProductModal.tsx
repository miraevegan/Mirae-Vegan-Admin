"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import Image from "next/image";

interface AddProductModalProps {
  onClose: () => void;
  onAdd: (newProduct: Product) => void;
}

export default function AddProductModal({ onClose, onAdd }: AddProductModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [description, setDescription] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const discountedPrice = price - (price * discountPercentage) / 100;

  // Update preview URLs when images change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);

      // Create preview URLs
      const urls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("price", price.toString());
    formData.append("stock", stock.toString());
    formData.append("description", description);
    formData.append("discountPercentage", discountPercentage.toString());

    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOSTED_API_URL}/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("mirae_admin_token")}`,
          // Note: Do NOT set Content-Type when sending FormData, browser sets it automatically with boundary
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to add product");

      const data = await res.json();

      onAdd(data.product);
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
            <h2 className="font-brand text-2xl">Add Product</h2>
            <p className="text-sm text-text-secondary">Enter new product details</p>
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
              required
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
                <p className="text-sm font-medium text-brand-primary">Discounted Price</p>
                <p className="text-lg font-semibold">₹{discountedPrice.toLocaleString()}</p>
              </div>
            )}
          </Section>

          {/* Images Upload */}
          <Section title="Product Images">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full text-sm text-text-secondary"
            />
            <div className="mt-4 flex flex-wrap gap-4">
              {previewUrls.map((url, idx) => (
                <Image
                  key={idx}
                  src={url}
                  width={100}
                    height={100}
                  alt={`Preview ${idx + 1}`}
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
              Add Product
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
      <label className="text-sm text-text-secondary mb-1 block">{label}</label>
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
      <label className="text-sm text-text-secondary mb-1 block">{label}</label>
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
