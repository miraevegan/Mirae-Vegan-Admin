"use client";

import { useState } from "react";
import api from "@/lib/api";
import HeroPreview from "./HeroPreview";

export default function HeroUploadForm() {
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (files.length === 0) return;

    const formData = new FormData();
    formData.append("mediaType", mediaType);
    files.forEach((file) => formData.append("media", file));

    try {
      setLoading(true);
      await api.post("/hero", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Hero updated successfully");
      setFiles([]);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 space-y-6">
      <h2 className="text-lg font-medium">Upload Hero Media</h2>

      {/* Media Type */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={mediaType === "image"}
            onChange={() => setMediaType("image")}
          />
          Image Carousel
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={mediaType === "video"}
            onChange={() => setMediaType("video")}
          />
          Video
        </label>
      </div>

      {/* File input */}
      <input
        type="file"
        multiple={mediaType === "image"}
        accept={mediaType === "image" ? "image/*" : "video/*"}
        onChange={(e) => {
          if (!e.target.files) return;
          setFiles(Array.from(e.target.files));
        }}
      />

      <p className="text-sm text-gray-500">
        {mediaType === "image"
          ? "Recommended: 1920x1080 images (auto carousel)"
          : "Recommended: 1920x1080 MP4, max 20s, muted autoplay"}
      </p>

      {/* Preview */}
      <HeroPreview files={files} mediaType={mediaType} />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-6 py-3 bg-black text-white text-sm tracking-widest disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Update Hero"}
      </button>
    </div>
  );
}
