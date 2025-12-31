"use client";

import { useEffect, useMemo, useState } from "react";
import EditProductModal from "./EditProductModal";
import ViewProductModal from "./ViewProductModal";
import type { Discount, Product } from "@/types/product";
import AddProductModal from "./AddProductModal";

interface ApiProduct extends Omit<Product, "discount"> {
  discount: Discount | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [addingProduct, setAddingProduct] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProductSlug, setViewingProductSlug] = useState<string | null>(null);

  /* ---------- SEARCH & FILTER ---------- */
  const [search, setSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();

      // Sanitize discount to undefined if null to match Product interface
      const sanitized: Product[] = (data.products as ApiProduct[]).map((p) => ({
        ...p,
        discount: p.discount ?? undefined,
      }));

      setProducts(sanitized);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
  };

  /* ---------- DERIVED DATA ---------- */
  const categories = useMemo(() => {
    const validCategories = products
      .filter((p): p is Product => Boolean(p && p.category))
      .map((p) => p.category);

    return ["all", ...Array.from(new Set(validCategories))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (!product || !product.name || !product.category) return false;

      // Aggregate stock of all variants
      const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);

      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in" && totalStock > 0) ||
        (stockFilter === "out" && totalStock === 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="text-error">{error}</p>;

  return (
    <div className="space-y-8">
      {/* ---------- HEADER ---------- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-brand text-2xl mb-1">Products</h1>
          <p className="text-text-secondary text-sm">
            Manage Mirae product catalog
          </p>
        </div>

        <button
          onClick={() => setAddingProduct(true)}
          className="px-5 py-2 rounded-full bg-brand-primary text-text-inverse hover:opacity-90 transition"
        >
          Add Product
        </button>
      </div>

      {/* ---------- SEARCH & FILTER BAR ---------- */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex flex-col md:flex-row gap-4 md:items-center">
        <input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-border px-3 py-2 text-sm bg-transparent"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "all" ? "All Categories" : cat}
            </option>
          ))}
        </select>

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="rounded-xl border border-border px-3 py-2 text-sm bg-transparent"
        >
          <option value="all">All Stock</option>
          <option value="in">In Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* ---------- TABLE ---------- */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface sticky top-0 z-10">
            <tr className="text-left text-text-secondary">
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price <span className="font-normal text-xs">(after applying the discount)</span></th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-text-secondary"
                >
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <ProductRow
                  key={product._id}
                  product={product}
                  onEdit={() => setEditingProduct(product)}
                  onView={() => {
                    console.log("View clicked for:", product.slug)
                    setViewingProductSlug(product.slug)
                  }}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- MODALS ---------- */}
      {viewingProductSlug && (
        <ViewProductModal
          slug={viewingProductSlug}
          onClose={() => setViewingProductSlug(null)}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleSave}
        />
      )}

      {addingProduct && (
        <AddProductModal
          onClose={() => setAddingProduct(false)}
          onAdd={(newProduct) => {
            setProducts((prev) => [newProduct, ...prev]);
            setAddingProduct(false);
          }}
        />
      )}
    </div>
  );
}

/* ---------- ROW ---------- */
function ProductRow({
  product,
  onEdit,
  onView,
}: {
  product: Product;
  onEdit: () => void;
  onView: () => void;
}) {
  /* ---------------- PRICE ---------------- */

  const prices = product.variants.map((v) => v.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const discountPercentage = product.discount?.percentage ?? 0;

  const discountedMin =
    discountPercentage > 0
      ? Math.round(minPrice * (1 - discountPercentage / 100))
      : minPrice;

  const discountedMax =
    discountPercentage > 0
      ? Math.round(maxPrice * (1 - discountPercentage / 100))
      : maxPrice;

  /* ---------------- STOCK ---------------- */

  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);

  let stockLabel = "Out of stock";
  let stockClass = "bg-red-100 text-red-700";

  if (totalStock > 0) {
    stockLabel = "In Stock";
    stockClass = "bg-green-100 text-green-700";
  } else if (totalStock <= 0) {
    stockLabel = "Out of Stock";
    stockClass = "bg-yellow-100 text-yellow-700";
  }

  /* ---------------- VARIANTS ---------------- */

  const variantCount = product.variants.length;

  return (
    <tr className="border-b border-border last:border-none hover:bg-surface-accent/40 transition">
      {/* PRODUCT */}
      <td className="px-6 py-4 font-medium">
        <div className="flex flex-col">
          <span>{product.name}</span>
          <span className="text-xs text-text-secondary">
            {variantCount} variant{variantCount !== 1 ? "s" : ""}
          </span>
        </div>
      </td>

      {/* CATEGORY */}
      <td className="px-6 py-4">{product.category ?? "-"}</td>

      {/* PRICE PILL */}
      <td className="px-6 py-4">
        <div className="inline-flex flex-col gap-1">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-900 text-sm font-medium">
            ₹{discountedMin.toLocaleString()}
            {minPrice !== maxPrice && (
              <>
                <span className="text-gray-400">–</span>
                ₹{discountedMax.toLocaleString()}
              </>
            )}
          </span>

          {discountPercentage > 0 && (
            <span className="text-xs text-green-600 font-medium">
              {discountPercentage}% OFF
            </span>
          )}
        </div>
      </td>

      {/* STOCK HEAT */}
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${stockClass}`}
        >
          <span className="w-2 h-2 rounded-full bg-current opacity-70" />
          {stockLabel}
        </span>
      </td>

      {/* ACTIONS */}
      <td className="px-6 py-4 text-right space-x-4">
        <button
          onClick={onView}
          className="text-brand-primary hover:underline cursor-pointer"
          type="button"
        >
          View
        </button>
        <button
          onClick={onEdit}
          className="text-brand-secondary hover:underline cursor-pointer"
          type="button"
        >
          Edit
        </button>
        <button className="text-error hover:underline cursor-pointer" type="button">
          Delete
        </button>
      </td>
    </tr>
  );
}