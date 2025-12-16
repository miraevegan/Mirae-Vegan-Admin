"use client";

import { useState } from "react";

export default function ReviewText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="max-w-md">
      <p
        className={`text-sm text-gray-700 ${
          expanded ? "" : "line-clamp-3"
        }`}
      >
        {text}
      </p>

      {text.length > 120 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-primary text-xs mt-1"
        >
          {expanded ? "Show less" : "Expand"}
        </button>
      )}
    </div>
  );
}
