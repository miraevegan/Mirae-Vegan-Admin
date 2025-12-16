"use client";

import { useEffect, useMemo, useState } from "react";
import AddCouponModal from "./AddCouponModal";
import EditCouponModal from "./EditCouponModal";
import ViewCouponModal from "./ViewCouponModal";
import type { Coupon } from "@/types/coupon";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [addingCoupon, setAddingCoupon] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [viewingCouponId, setViewingCouponId] = useState<string | null>(null);

  // Search/filter state if you want to add later
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOSTED_API_URL}/coupons`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("mirae_admin_token")}`, // adjust auth if needed
        },
      });
      if (!res.ok) throw new Error("Failed to fetch coupons");

      const data = await res.json();
      setCoupons(data.coupons);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOSTED_API_URL}/coupons/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // adjust auth if needed
        },
      });
      if (!res.ok) throw new Error("Failed to delete coupon");

      fetchCoupons();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  // Optionally filter coupons by search
  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) =>
      coupon.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [coupons, search]);

  if (loading) return <p>Loading coupons...</p>;
  if (error) return <p className="text-error">{error}</p>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-brand text-2xl mb-1">Coupons</h1>
          <p className="text-text-secondary text-sm">
            Manage your store coupons and discounts
          </p>
        </div>

        <button
          onClick={() => setAddingCoupon(true)}
          className="px-5 py-2 rounded-full bg-brand-primary text-text-inverse hover:opacity-90 transition"
        >
          Add Coupon
        </button>
      </div>

      {/* Search bar */}
      <input
        placeholder="Search coupons…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
      />

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface sticky top-0 z-10">
            <tr className="text-left text-text-secondary">
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Value</th>
              <th className="px-6 py-4">Min Cart</th>
              <th className="px-6 py-4">Expiry</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredCoupons.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-text-secondary">
                  No coupons found
                </td>
              </tr>
            ) : (
              filteredCoupons.map((coupon) => (
                <tr
                  key={coupon._id}
                  className="border-b border-border last:border-none hover:bg-surface-accent/40 transition"
                >
                  <td className="px-6 py-4 font-medium uppercase">{coupon.code}</td>
                  <td className="px-6 py-4 capitalize">{coupon.discountType}</td>
                  <td className="px-6 py-4">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}%`
                      : `₹${coupon.discountValue.toLocaleString()}`}
                  </td>
                  <td className="px-6 py-4">₹{coupon.minCartValue.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {new Date(coupon.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <button
                      onClick={() => setViewingCouponId(coupon._id)}
                      className="text-brand-primary hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setEditingCoupon(coupon)}
                      className="text-brand-secondary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(coupon._id)}
                      className="text-error hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {addingCoupon && (
        <AddCouponModal
          onClose={() => setAddingCoupon(false)}
          onAdd={(newCoupon) => {
            setCoupons((prev) => [newCoupon, ...prev]);
            setAddingCoupon(false);
          }}
        />
      )}

      {editingCoupon && (
        <EditCouponModal
          coupon={editingCoupon}
          onClose={() => setEditingCoupon(null)}
          onSave={(updatedCoupon) => {
            setCoupons((prev) =>
              prev.map((c) => (c._id === updatedCoupon._id ? updatedCoupon : c))
            );
            setEditingCoupon(null);
          }}
        />
      )}

      {viewingCouponId && (
        <ViewCouponModal
          id={viewingCouponId}
          onClose={() => setViewingCouponId(null)}
        />
      )}
    </div>
  );
}
