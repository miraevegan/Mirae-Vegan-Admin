"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import Image from "next/image";

interface VariantAttribute {
  key: "color" | "size" | string;
  value: string;
  hex?: string;
}

interface Variant {
  attributes: VariantAttribute[];
  price: number;
  stock: number;
  imageIndexes?: number[]; // 🔑 IMPORTANT
}

interface AddProductModalProps {
  onClose: () => void;
  onAdd: (newProduct: Product) => void;
}

interface NormalizedVariantAttributes {
  color?: {
    name: string;
    hex: string;
  };
  size?: string;
  [key: string]: unknown; // allows future attributes safely
}

export default function AddProductModal({ onClose, onAdd }: AddProductModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isJustLanded, setIsJustLanded] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [material, setMaterial] = useState("");
  const [fit, setFit] = useState("");
  const [care, setCare] = useState("");


  // Variants state - start with one empty variant by default
  const [variants, setVariants] = useState<Variant[]>([
    { attributes: [{ key: "", value: "" }], price: 0, stock: 0 },
  ]);

  // Handle images input and previews
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
      setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
    }
  };

  // Handle variant changes
  function updateVariantAttribute(variantIndex: number, attrIndex: number, field: "key" | "value", val: string) {
    const updated = [...variants];
    updated[variantIndex].attributes[attrIndex][field] = val;
    setVariants(updated);
  }

  function addVariantAttribute(variantIndex: number) {
    const updated = [...variants];
    updated[variantIndex].attributes.push({ key: "", value: "" });
    setVariants(updated);
  }

  function removeVariantAttribute(variantIndex: number, attrIndex: number) {
    const updated = [...variants];
    if (updated[variantIndex].attributes.length > 1) {
      updated[variantIndex].attributes.splice(attrIndex, 1);
      setVariants(updated);
    }
  }

  function updateVariant(index: number, field: "price" | "stock", value: number) {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setVariants(updated);
  }

  function addVariant() {
    setVariants([...variants, { attributes: [{ key: "", value: "" }], price: 0, stock: 0 }]);
  }

  function removeVariant(index: number) {
    if (variants.length === 1) return; // Always keep at least one variant
    setVariants(variants.filter((_, i) => i !== index));
  }

  const normalizeVariants = () => {
    return variants.map((variant) => {
      const attributes: NormalizedVariantAttributes = {};

      variant.attributes.forEach((attr) => {
        const normalizedKey = attr.key.toLowerCase();

        if (normalizedKey === "color") {
          attributes.color = {
            name: attr.value,
            hex: attr.hex || "#000000",
          };
        } else if (normalizedKey === "size") {
          attributes.size = attr.value;
        } else {
          attributes[normalizedKey] = attr.value;
        }
      });

      return {
        attributes,
        price: variant.price,
        stock: variant.stock,
        imageIndexes: variant.imageIndexes || [],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    // Validate variants - all names required and prices/stocks >= 0
    for (const variant of variants) {
      for (const attr of variant.attributes) {
        if (!attr.key.trim() || !attr.value.trim()) {
          alert("Variant attribute key and value cannot be empty.");
          return;
        }
      }
      if (variant.price < 0 || variant.stock < 0) {
        alert("Price and stock must be zero or positive.");
        return;
      }
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("description", description);
    formData.append(
      "discount",
      JSON.stringify({ percentage: discountPercentage })
    );
    formData.append(
      "attributes",
      JSON.stringify({
        material,
        fit,
      })
    );

    formData.append(
      "specifications",
      JSON.stringify({
        care,
      })
    );
    formData.append("isBestSeller", isBestSeller.toString());
    formData.append("isJustLanded", isJustLanded.toString());
    formData.append("isVegan", isVegan.toString());

    // Add variants as JSON string
    formData.append("variants", JSON.stringify(normalizeVariants()));

    images.forEach((image) => {
      formData.append("productImages", image);
    });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOSTED_API_URL}/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("mirae_admin_token")}`,
          // Do NOT set Content-Type for FormData
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to add product");

      const data = await res.json();

      onAdd(data);
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unknown error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-surface w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden">
        {/* HEADER */}
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

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="pt-8 px-8 space-y-8 max-h-[75vh] overflow-y-auto"
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
              rows={5}
              className="w-full rounded-xl border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
            />
          </Section>

          {/* Extras */}
          <Section title="Product Details">
            <Input label="Material" value={material} onChange={setMaterial} />
            <Input label="Fit" value={fit} onChange={setFit} />
            <Input
              label="Care Instructions (comma separated)"
              value={care}
              onChange={setCare}
            />
          </Section>

          {/* Variants */}
          <Section title="Variants (Name, Price, Stock)">
            {variants.map((variant, vIndex) => (
              <div key={vIndex} className="mb-6 border p-4 rounded-lg space-y-3">
                <div className="flex flex-wrap gap-2 items-center">
                  <h4 className="font-semibold">Variant {vIndex + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeVariant(vIndex)}
                    disabled={variants.length === 1}
                    className="text-red-600 hover:underline ml-auto"
                  >
                    Remove Variant
                  </button>
                </div>

                {/* Attributes */}
                {variant.attributes.map((attr, aIndex) => {
                  const isColor = attr.key.toLowerCase() === "color";

                  return (
                    <div key={aIndex} className="flex gap-2 items-center">
                      <Input
                        label="Attribute Key"
                        value={attr.key}
                        onChange={(val) => updateVariantAttribute(vIndex, aIndex, "key", val)}
                        required
                      />

                      {isColor ? (
                        <>
                          {/* Color Name */}
                          <Input
                            label="Color Name"
                            value={attr.value}
                            onChange={(val) =>
                              updateVariantAttribute(vIndex, aIndex, "value", val)
                            }
                            required
                          />

                          {/* Color Picker */}
                          <input
                            type="color"
                            value={attr.hex || "#000000"}
                            onChange={(e) => {
                              const updated = [...variants];
                              updated[vIndex].attributes[aIndex].hex = e.target.value;
                              setVariants(updated);
                            }}
                            className="w-12 h-12 rounded-lg border border-border cursor-pointer"
                            title="Pick color"
                          />
                        </>
                      ) : (
                        <Input
                          label="Attribute Value"
                          value={attr.value}
                          onChange={(val) =>
                            updateVariantAttribute(vIndex, aIndex, "value", val)
                          }
                          required
                        />
                      )}

                      <button
                        type="button"
                        onClick={() => removeVariantAttribute(vIndex, aIndex)}
                        disabled={variant.attributes.length === 1}
                        className="text-red-600 hover:underline"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => addVariantAttribute(vIndex)}
                  className="text-brand-primary hover:underline"
                >
                  + Add attribute
                </button>

                {/* Price and Stock */}
                <div className="flex gap-4 mt-4">
                  <NumberInput
                    label="Price (₹)"
                    value={variant.price}
                    onChange={(val) => updateVariant(vIndex, "price", val)}
                    min={0}
                    required
                  />
                  <NumberInput
                    label="Stock"
                    value={variant.stock}
                    onChange={(val) => updateVariant(vIndex, "stock", val)}
                    min={0}
                    required
                  />
                </div>

                {/* Variant Image Mapping */}
                <div className="mt-3">
                  <p className="text-sm text-text-secondary mb-1">
                    Variant Images (optional)
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {previewUrls.map((url, imgIndex) => {
                      const selected = variant.imageIndexes?.includes(imgIndex);

                      return (
                        <button
                          type="button"
                          key={imgIndex}
                          onClick={() => {
                            const updated = [...variants];
                            const indexes = new Set(updated[vIndex].imageIndexes || []);

                            if (indexes.has(imgIndex)) indexes.delete(imgIndex);
                            else indexes.add(imgIndex);

                            updated[vIndex].imageIndexes = Array.from(indexes);
                            setVariants(updated);
                          }}
                          className={`border rounded-lg p-1 ${selected ? "border-brand-primary" : "border-border"
                            }`}
                        >
                          <Image
                            src={url}
                            width={50}
                            height={50}
                            alt="variant"
                            className="w-12 h-12 object-cover rounded"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addVariant}
              className="text-brand-primary hover:underline"
            >
              + Add another variant
            </button>
          </Section>

          {/* Pricing Summary */}
          <Section title="Discount">
            <NumberInput
              label="Discount Percentage (%)"
              value={discountPercentage}
              onChange={(val) => setDiscountPercentage(val)}
              min={0}
              max={90}
            />
            <p className="text-sm font-medium text-brand-primary">
              Discount Percentage: {discountPercentage}%
            </p>
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

          {/* Flags */}
          <Section title="Additional Options">
            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="rounded"
              />
              <span>Mark as Best Seller</span>
            </label>

            <label className="inline-flex items-center space-x-2 ml-6">
              <input
                type="checkbox"
                checked={isJustLanded}
                onChange={(e) => setIsJustLanded(e.target.checked)}
                className="rounded"
              />
              <span>Mark as Just Landed</span>
            </label>

            {/* 🌱 VEGAN */}
            <label className="inline-flex items-center space-x-2 ml-6">
              <input
                type="checkbox"
                checked={isVegan}
                onChange={(e) => setIsVegan(e.target.checked)}
                className="rounded"
              />
              <span className="flex items-center gap-1">
                <span>Vegan</span>
                <span className="text-green-600">🌱</span>
              </span>
            </label>
          </Section>

          {/* FOOTER */}
          <div className="sticky bottom-0 bg-surface pt-4 pb-6 border-t border-border flex justify-end gap-4">
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
    <div className="min-w-37.5">
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
    <div className="min-w-37.5">
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
