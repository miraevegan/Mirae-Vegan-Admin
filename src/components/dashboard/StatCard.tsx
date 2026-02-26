"use client";

import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string;
  hint?: string;
}

export default function StatCard({
  title,
  value,
  hint,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="relative rounded-2xl border border-border bg-surface p-6 overflow-hidden"
    >
      {/* Accent gradient */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-primary via-primary/60 to-transparent" />

      <p className="text-xs uppercase tracking-widest text-text-secondary">
        {title}
      </p>

      <p className="mt-2 text-3xl font-highlight tracking-tight">
        {value}
      </p>

      {hint && (
        <p className="mt-1 text-xs text-text-muted">
          {hint}
        </p>
      )}
    </motion.div>
  );
}
