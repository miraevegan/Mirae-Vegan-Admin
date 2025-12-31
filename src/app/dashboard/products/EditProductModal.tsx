"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product, ProductImage, Variant } from "@/types/product";
import AddVariantModal from "./AddVariantModal";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
}

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

export default function EditProductModal({
  product,
  onClose,
  onSave,
}: EditProductModalProps) {
  /* ---------------- BASIC ---------------- */

  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState(product.category);
  const [description, setDescription] = useState(product.description);

  const [discountPercentage, setDiscountPercentage] = useState(
    product.discount?.percentage ?? 0
  );

  const [showAddVariantModal, setAddVariantModal] = useState(false);

  const handleAddVariant = (newVariant: Variant) => {
    setVariants((prev) => [...prev, newVariant]);
  };

  /* ---------------- VARIANTS ---------------- */

  const [variants, setVariants] = useState<Variant[]>(product.variants);

  // Update price or stock
  const updateVariant = (
    index: number,
    field: "price" | "stock",
    value: number
  ) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      )
    );
  };

  // Update variant attribute for 'color' specifically, supporting both name and hex
  const updateVariantColor = (
    index: number,
    field: "name" | "hex",
    value: string
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== index) return v;
        return {
          ...v,
          attributes: {
            ...v.attributes,
            color: {
              ...(v.attributes.color ?? { name: "", hex: "#000000" }),
              [field]: value,
            },
          },
        };
      })
    );
  };

  /* ---------------- PRODUCT IMAGES ---------------- */

  const [images, setImages] = useState<ProductImage[]>(product.images ?? []);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  /* 🔥 MAIN IMAGE PREVIEW */
  const [activeImage, setActiveImage] = useState<string | null>(
    product.images?.[0]?.url ?? null
  );

  const [isBestSeller, setIsBestSeller] = useState<boolean>(
    product.isBestSeller ?? false
  );

  const [isJustLanded, setIsJustLanded] = useState<boolean>(
    product.isJustLanded ?? false
  );

  const handleNewImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    setNewImages(files);
    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
  };

  const handleDeleteImage = async (publicId: string) => {
    if (!confirm("Delete this image?")) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${product._id}/images/${encodeURIComponent(
        publicId
      )}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "mirae_admin_token"
          )}`,
        },
      }
    );

    if (!res.ok) {
      alert("Failed to delete image");
      return;
    }

    const updated: Product = await res.json();
    setImages(updated.images);

    if (activeImage === images.find((i) => i.public_id === publicId)?.url) {
      setActiveImage(updated.images?.[0]?.url ?? null);
    }
  };

  /* ---------------- VARIANT IMAGE SELECTION (FROM PRODUCT IMAGES) ---------------- */

  const toggleVariantImage = (variantIndex: number, image: ProductImage) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== variantIndex) return v;

        const imagesSet = new Set(
          v.images?.map((img) => img.public_id) || []
        );

        if (imagesSet.has(image.public_id)) {
          imagesSet.delete(image.public_id);
        } else {
          imagesSet.add(image.public_id);
        }

        return {
          ...v,
          images: images.filter((img) => imagesSet.has(img.public_id)),
        };
      })
    );
  };

  /* ---------------- VARIANT CLICK = AUTO IMAGE SWITCH ---------------- */

  const handleVariantClick = (variant: Variant) => {
    if (variant.images?.length) {
      setActiveImage(variant.images[0].url);
    }
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", name);
    formData.append("category", category);
    formData.append("description", description);
    formData.append(
      "discount",
      JSON.stringify({ percentage: discountPercentage })
    );
    formData.append("variants", JSON.stringify(variants));

    newImages.forEach((img) => {
      formData.append("productImages", img);
    });
    formData.append("isBestSeller", String(isBestSeller));
    formData.append("isJustLanded", String(isJustLanded));

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${product._id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "mirae_admin_token"
          )}`,
        },
        body: formData,
      }
    );

    if (!res.ok) {
      alert("Failed to update product");
      return;
    }

    const updatedProduct: Product = await res.json();
    onSave(updatedProduct);
    onClose();
  };

  /* -------------------------------------------------------------------------- */
  /*                                    UI                                      */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
      <div className="bg-background max-w-5xl w-full rounded-3xl shadow-xl overflow-hidden">
        <div className="px-8 py-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Edit Product</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-8 max-h-[75vh] overflow-y-auto"
        >
          {/* IMAGE PREVIEW */}
          <div className="space-y-4">
            {activeImage && (
              <div className="w-full flex justify-center">
                <Image
                  src={activeImage}
                  width={320}
                  height={320}
                  alt=""
                  className="rounded-2xl border"
                />
              </div>
            )}

            <div className="flex gap-3 flex-wrap justify-center">
              {images.map((img) => (
                <Image
                  key={img.public_id}
                  src={img.url}
                  width={70}
                  height={70}
                  alt=""
                  onClick={() => setActiveImage(img.url)}
                  className="rounded-lg border cursor-pointer hover:opacity-80"
                />
              ))}

              {previewUrls.map((url, i) => (
                <Image
                  key={i}
                  src={url}
                  width={70}
                  height={70}
                  alt=""
                  className="rounded-lg opacity-70"
                />
              ))}
            </div>
          </div>

          {/* BASIC */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium">Product Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border p-3 rounded-xl w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border p-3 rounded-xl w-full"
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              rows={5}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-xl p-3"
            />
          </div>

          {/* Discount */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Discount (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(Number(e.target.value))}
              className="border p-3 rounded-xl w-full"
            />
          </div>

          {/* FLAGS */}
          <div className="grid grid-cols-2 gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Best Seller</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isJustLanded}
                onChange={(e) => setIsJustLanded(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Just Landed</span>
            </label>
          </div>


          {/* VARIANTS */}
          <div className="space-y-6">
            <div className="pt-4 flex justify-between items-center">
              <p className="font-bold text-lg">Variants</p>
              <button
                type="button"
                onClick={() => setAddVariantModal(true)}
                className="px-4 py-2 bg-brand-primary text-sm text-white rounded-md"
              >
                Add Variant
              </button>
            </div>
            {variants.map((v, i) => (
              <div
                key={v._id ?? i}
                className="border p-5 rounded-2xl space-y-4"
                onClick={() => handleVariantClick(v)}
              >
                <div className="flex justify-between items-center">
                  <p className="font-semibold">
                    Variant {i + 1} —{" "}
                    <input
                      type="text"
                      value={v.attributes?.color?.name ?? ""}
                      placeholder="Color name"
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateVariantColor(i, "name", e.target.value)}
                      className="border p-1 rounded-md text-sm w-24 mr-2"
                    />
                    <input
                      type="color"
                      value={v.attributes?.color?.hex ?? "#000000"}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateVariantColor(i, "hex", e.target.value)}
                      className="w-10 h-8 rounded-md border cursor-pointer p-0 align-middle"
                    />
                  </p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVariants((prev) => prev.filter((_, idx) => idx !== i));
                    }}
                    className="text-sm text-red-600"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Price</label>
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) =>
                        updateVariant(i, "price", Number(e.target.value))
                      }
                      className="border p-2 rounded-xl w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">Stock</label>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) =>
                        updateVariant(i, "stock", Number(e.target.value))
                      }
                      className="border p-2 rounded-xl w-full"
                    />
                  </div>
                </div>

                {/* SELECT VARIANT IMAGES FROM PRODUCT IMAGES */}
                <label className="text-sm font-medium">Variant Images</label>
                <div className="flex gap-3 flex-wrap max-h-32 overflow-auto p-2 border rounded-md">
                  {images.map((img) => {
                    const isSelected = v.images?.some(
                      (vi) => vi.public_id === img.public_id
                    );
                    return (
                      <div
                        key={img.public_id}
                        className={`relative cursor-pointer rounded-lg border ${isSelected ? "border-blue-600" : "border-transparent"
                          }`}
                        onClick={() => toggleVariantImage(i, img)}
                      >
                        <Image
                          src={img.url}
                          width={60}
                          height={60}
                          alt=""
                          className={`rounded-lg ${isSelected ? "opacity-100" : "opacity-50"
                            }`}
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* PRODUCT IMAGE UPLOAD */}
          <div className="space-y-1 flex flex-col">
            <label className="text-sm font-medium">Add Product Images</label>
            <input type="file" multiple onChange={handleNewImagesChange} />
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="bg-black text-white px-6 py-2 rounded-full"
            >
              Save
            </button>
          </div>
        </form>
      </div>
      {showAddVariantModal && (
        <AddVariantModal
          onClose={() => setAddVariantModal(false)}
          onAdd={handleAddVariant}
        />
      )}

    </div>
  );

}