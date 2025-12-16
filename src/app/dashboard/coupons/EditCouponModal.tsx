"use client";

import { useState, useEffect } from "react";
import type { Coupon } from "@/types/coupon";
import axios from "axios";
import api from "@/lib/api";

interface EditCouponModalProps {
  coupon: Coupon;
  onClose: () => void;
  onSave: (coupon: Coupon) => void;
}

export default function EditCouponModal({ coupon, onClose, onSave }: EditCouponModalProps) {
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: 0,
    minCartValue: 0,
    maxDiscount: 0,
    expiryDate: "",
    usageLimit: 0,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minCartValue: coupon.minCartValue,
      maxDiscount: coupon.maxDiscount || 0,
      expiryDate: coupon.expiryDate.split("T")[0], // ISO date string to yyyy-mm-dd
      usageLimit: coupon.usageLimit || 0,
      isActive: coupon.isActive,
    });
  }, [coupon]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? target.checked
          : name === "discountValue" ||
            name === "minCartValue" ||
            name === "maxDiscount" ||
            name === "usageLimit"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.code || !form.expiryDate || form.discountValue <= 0) {
      setError("Please fill all required fields correctly");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { data } = await api.put(`/coupons/${coupon._id}`, form);

      onSave(data.coupon);
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to update coupon");
      } else {
        setError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-surface w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
      >
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="font-brand text-2xl">Edit Coupon</h2>
            <p className="text-sm text-text-secondary">Modify coupon details</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-full border border-border hover:bg-surface-accent transition"
            disabled={loading}
          >
            ✕ Close
          </button>
        </div>

        {/* FORM CONTENT */}
        <div className="p-8 space-y-8 overflow-y-auto flex-1">
          <Section title="Basic Information">
            <Input
              label="Coupon Code"
              name="code"
              value={form.code}
              onChange={handleChange}
              required
              placeholder="e.g. SAVE20"
            />

            <Select
              label="Discount Type"
              name="discountType"
              value={form.discountType}
              onChange={handleChange}
              options={[
                { label: "Percentage", value: "percentage" },
                { label: "Flat", value: "flat" },
              ]}
            />

            <NumberInput
              label="Discount Value"
              name="discountValue"
              value={form.discountValue}
              onChange={handleChange}
              min={0}
              required
            />

            {form.discountType === "percentage" && (
              <NumberInput
                label="Max Discount (optional)"
                name="maxDiscount"
                value={form.maxDiscount}
                onChange={handleChange}
                min={0}
              />
            )}

            <NumberInput
              label="Minimum Cart Value"
              name="minCartValue"
              value={form.minCartValue}
              onChange={handleChange}
              min={0}
            />

            <input
              type="date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
            />

            <NumberInput
              label="Usage Limit (optional)"
              name="usageLimit"
              value={form.usageLimit}
              onChange={handleChange}
              min={0}
            />

            <label className="inline-flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="rounded border border-border"
              />
              <span>Active</span>
            </label>
          </Section>
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 bg-surface pt-6 border-t border-border flex justify-end gap-4 px-8 py-6">
          {error && <p className="text-error self-center mr-auto">{error}</p>}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-border hover:bg-surface-accent transition"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-brand-primary text-text-inverse hover:opacity-90 transition"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Coupon"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- REUSABLE UI COMPONENTS ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder = "",
}: {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm text-text-secondary mb-1 block">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
        required={required}
      />
    </div>
  );
}

function NumberInput({
  label,
  name,
  value,
  onChange,
  min,
  max,
  required = false,
}: {
  label: string;
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  min?: number;
  max?: number;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm text-text-secondary mb-1 block">{label}</label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        className="w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
        required={required}
      />
    </div>
  );
}

function Select({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div>
      <label className="text-sm text-text-secondary mb-1 block">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
