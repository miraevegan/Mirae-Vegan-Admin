"use client";

import HeroUploadForm from "@/components/hero/HeroUploadForm";
import ActiveHeroCard from "@/components/hero/ActiveHeroCard";

export default function AdminHeroPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      <h1 className="text-2xl font-semibold">Hero Section Manager</h1>

      {/* Upload */}
      <HeroUploadForm />

      {/* Active Hero */}
      <ActiveHeroCard />
    </div>
  );
}
