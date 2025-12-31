"use client";

import { useState } from "react";
import type { Variant, VariantAttribute } from "@/types/product";

interface AddVariantModalProps {
  onClose: () => void;
  onAdd: (variant: Variant) => void;
}

type AttributeType = "text" | "color";

/* ---------- Attribute Models (DISCRIMINATED UNION) ---------- */

type TextAttribute = {
  type: "text";
  key: string;
  value: string;
};

type ColorAttribute = {
  type: "color";
  key: string;
  value: {
    name: string;
    hex: string;
  };
};

type AttributeInput = TextAttribute | ColorAttribute;

export default function AddVariantModal({
  onClose,
  onAdd,
}: AddVariantModalProps) {
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [attributes, setAttributes] = useState<AttributeInput[]>([]);

  /* ---------------- ADD ATTRIBUTE ---------------- */

  const addAttribute = (type: AttributeType) => {
    if (type === "color") {
      setAttributes((prev) => [
        ...prev,
        {
          type: "color",
          key: "",
          value: { name: "", hex: "#000000" },
        },
      ]);
    } else {
      setAttributes((prev) => [
        ...prev,
        {
          type: "text",
          key: "",
          value: "",
        },
      ]);
    }
  };

  const updateAttributeKey = (index: number, key: string) => {
    setAttributes((prev) =>
      prev.map((attr, i) => (i === index ? { ...attr, key } : attr))
    );
  };

  const updateAttributeValue = (
    index: number,
    value: string | { name: string; hex: string }
  ) => {
    setAttributes((prev) =>
      prev.map((attr, i) => {
        if (i !== index) return attr;

        if (attr.type === "text" && typeof value === "string") {
          return { ...attr, value };
        }

        if (
          attr.type === "color" &&
          typeof value === "object"
        ) {
          return { ...attr, value };
        }

        return attr;
      })
    );
  };

  const removeAttribute = (index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------------- SUBMIT ---------------- */

  const handleAdd = () => {
    const finalAttributes: Record<string, unknown> = {};

    for (const attr of attributes) {
      if (!attr.key) {
        alert("Attribute key cannot be empty");
        return;
      }

      finalAttributes[attr.key as keyof VariantAttribute] = attr.value;
    }

    onAdd({
      price,
      stock,
      attributes: finalAttributes as VariantAttribute,
      images: [],
    });

    onClose();
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-6">
      <div className="bg-background rounded-xl w-full max-w-lg p-6 space-y-6">
        <h3 className="text-xl font-semibold">Add Variant</h3>


        <div className="space-y-4">
          <p className="font-medium">Attributes</p>

          {attributes.map((attr, i) => (
            <div key={i} className="border rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  placeholder="Attribute key (eg: color, size)"
                  value={attr.key}
                  onChange={(e) =>
                    updateAttributeKey(i, e.target.value)
                  }
                  className="border p-2 rounded flex-1"
                />
                <button
                  onClick={() => removeAttribute(i)}
                  className="text-red-600 text-sm"
                >
                  Remove
                </button>
              </div>

              {attr.type === "text" && (
                <input
                  placeholder="Value"
                  value={attr.value}
                  onChange={(e) =>
                    updateAttributeValue(i, e.target.value)
                  }
                  className="border p-2 rounded w-full"
                />
              )}

              {attr.type === "color" && (
                <div className="flex gap-3">
                  <input
                    placeholder="Color name"
                    value={attr.value.name}
                    onChange={(e) =>
                      updateAttributeValue(i, {
                        ...attr.value,
                        name: e.target.value,
                      })
                    }
                    className="border p-2 rounded flex-1"
                  />
                  <input
                    type="color"
                    value={attr.value.hex}
                    onChange={(e) =>
                      updateAttributeValue(i, {
                        ...attr.value,
                        hex: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => addAttribute("text")}
              className="px-3 py-1 border rounded"
            >
              + Text Attribute
            </button>
            <button
              type="button"
              onClick={() => addAttribute("color")}
              className="px-3 py-1 border rounded"
            >
              + Color Attribute
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="">Price</label>
            <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="border p-2 rounded"
          />
          </div>

          <div className="flex flex-col">
            <label className="">Stock</label>
            <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className="border p-2 rounded"
          />
          </div>
        </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button onClick={onClose} className="border px-4 py-2 rounded">
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Add Variant
          </button>
        </div>
      </div>
    </div>
  );
}
