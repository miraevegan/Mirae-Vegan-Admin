"use client";

import { useEffect, useState } from "react";
import type { Coupon } from "@/types/coupon";
import api from "@/lib/api";
import axios from "axios";

interface ViewCouponModalProps {
  id: string;
  onClose: () => void;
}

export default function ViewCouponModal({ id, onClose }: ViewCouponModalProps) {
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get(`/coupons/${id}`);
        setCoupon(data.coupon);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Failed to fetch coupon");
        } else {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCoupon();
  }, [id]);

  if (loading)
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
        <p className="rounded-3xl shadow-2xl max-w-xl w-full p-6 text-center font-medium">
          Loading...
        </p>
      </div>
    );

  if (error || !coupon)
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
        <div className="rounded-3xl shadow-2xl max-w-xl w-full p-6 flex flex-col items-center gap-6">
          <p className="text-error text-center font-medium">{error || "Coupon not found"}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-brand-primary text-white hover:bg-brand-primary-dark transition"
          >
            Close
          </button>
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
      <div className="bg-surface rounded-3xl shadow-2xl max-w-xl w-full flex flex-col max-h-[80vh]">
        {/* HEADER */}
        <header className="px-8 py-6 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="font-brand text-2xl">Coupon Details</h2>
            <p className="text-sm text-text-secondary">Detailed information about the coupon</p>
          </div>
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-full border border-border hover:bg-surface-accent transition"
            aria-label="Close modal"
          >
            ✕ Close
          </button>
        </header>

        {/* CONTENT */}
        <main className="p-8 space-y-8 overflow-y-auto flex-1">
          <Section title="Basic Info">
            <InfoRow label="Code" value={<span className="uppercase font-semibold">{coupon.code}</span>} />
            <InfoRow label="Status" value={coupon.isActive ? "Active" : "Inactive"} />
          </Section>

          <Section title="Discount Details">
            <InfoRow label="Type" value={capitalize(coupon.discountType)} />
            <InfoRow
              label="Value"
              value={
                coupon.discountType === "percentage"
                  ? `${coupon.discountValue}%`
                  : `₹${coupon.discountValue.toLocaleString()}`
              }
            />
            {coupon.discountType === "percentage" && coupon.maxDiscount && (
              <InfoRow label="Max Discount" value={`₹${coupon.maxDiscount.toLocaleString()}`} />
            )}
          </Section>

          <Section title="Usage">
            <InfoRow label="Minimum Cart Value" value={`₹${coupon.minCartValue.toLocaleString()}`} />
            <InfoRow label="Usage Limit" value={coupon.usageLimit ? coupon.usageLimit : "No limit"} />
            <InfoRow label="Used Count" value={coupon.usedCount} />
            <InfoRow label="Expiry Date" value={new Date(coupon.expiryDate).toLocaleDateString()} />
          </Section>
        </main>

        {/* FOOTER */}
        <footer className="sticky bottom-0 bg-surface border-t border-border p-6 flex justify-end rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-brand-primary text-text-inverse hover:opacity-90 transition"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ---------- REUSABLE UI COMPONENTS ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between text-sm text-text-secondary">
      <span className="font-medium text-text-primary">{label}</span>
      <span>{value}</span>
    </div>
  );
}

/* Utility */
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
