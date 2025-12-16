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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [addingProduct, setAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProductSlug, setViewingProductSlug] = useState<string | null>(null);

  /* ---------- SEARCH & FILTER ---------- */
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();

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

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in" && product.stock > 0) ||
        (stockFilter === "out" && product.stock === 0);

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

        <button onClick={() => setAddingProduct(true)} className="px-5 py-2 rounded-full bg-brand-primary text-text-inverse hover:opacity-90 transition">
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
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-text-secondary">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <ProductRow
                  key={product._id}
                  product={product}
                  onEdit={() => setEditingProduct(product)}
                  onView={() => setViewingProductSlug(product.slug)}
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
            }
        }
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
  return (
    <tr className="border-b border-border last:border-none hover:bg-surface-accent/40 transition">
      <td className="px-6 py-4 font-medium">{product.name}</td>
      <td className="px-6 py-4">{product.category}</td>
      <td className="px-6 py-4">₹{product.price.toLocaleString()}</td>
      <td className="px-6 py-4">
        {product.stock > 0 ? (
          <span className="text-success">In stock</span>
        ) : (
          <span className="text-error">Out of stock</span>
        )}
      </td>
      <td className="px-6 py-4 text-right space-x-4">
        <button onClick={onView} className="text-brand-primary hover:underline">
          View
        </button>
        <button onClick={onEdit} className="text-brand-secondary hover:underline">
          Edit
        </button>
        <button className="text-error hover:underline">Delete</button>
      </td>
    </tr>
  );
}
