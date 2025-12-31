"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import ReviewText from "./ReviewText";
import { Review } from "@/types/review";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sort, setSort] = useState("latest");
  const [rating, setRating] = useState("");

  /* ---------- PAGINATION ---------- */
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const limit = 10;

  /* ---------- FETCH ---------- */
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const { data } = await api.get("/reviews/admin/all", {
          params: { sort, rating, page, limit },
        });

        setReviews(data.reviews);
        setPages(data.pagination.pages);
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      }
    };

    loadReviews();
  }, [sort, rating, page]);

  /* ---------- DELETE ---------- */
  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;

    await api.delete(`/reviews/${id}`);

    const { data } = await api.get("/reviews/admin/all", {
      params: { sort, rating, page, limit },
    });

    setReviews(data.reviews);
    setPages(data.pagination.pages);
  };

  /* ---------- TOGGLE TESTIMONIAL ---------- */
  const toggleTestimonial = async (id: string, value: boolean) => {
    try {
      await api.patch(`/reviews/${id}/testimonial`, { testimonial: value });
      setReviews((reviews) =>
        reviews.map((r) => (r._id === id ? { ...r, testimonial: value } : r))
      );
    } catch (error) {
      console.error("Failed to update testimonial status", error);
      // You can add toast notifications here if you want
    }
  };

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Product Reviews</h1>
          <p className="text-sm text-gray-500">
            Manage customer reviews across all products
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="rounded-xl border px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            <option value="">All Ratings</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} Star
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="rating_desc">Highest Rating</option>
            <option value="rating_asc">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* ===== Table Card ===== */}
      <div className="rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface sticky top-0">
            <tr className="text-left">
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4 text-center">Rating</th>
              <th className="px-6 py-4">Review</th>
              <th className="px-6 py-4 text-center">Date</th>
              <th className="px-6 py-4 text-center">Testimonial</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {reviews.map((review) => (
              <tr
                key={review._id}
                className="border-b last:border-none hover:bg-gray-50/50 transition"
              >
                <td className="px-6 py-4 font-medium">{review.product.name}</td>

                <td className="px-6 py-4">
                  <p className="font-medium">{review.user.name}</p>
                  <p className="text-xs text-gray-500">{review.user.email}</p>
                </td>

                <td className="px-6 py-4 text-center font-medium">⭐ {review.rating}</td>

                <td className="px-6 py-4 max-w-md">
                  <ReviewText text={review.comment} />
                </td>

                <td className="px-6 py-4 text-center text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </td>

                {/* Testimonial toggle checkbox */}
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={review.testimonial || false}
                    onChange={() =>
                      toggleTestimonial(review._id, !review.testimonial)
                    }
                    className="cursor-pointer"
                  />
                </td>

                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => deleteReview(review._id)}
                    className="text-red-500 hover:text-red-600 text-sm font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {reviews.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No reviews found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Pagination ===== */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {pages}
          </p>

          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 rounded-xl text-sm border ${page === i + 1
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "hover:bg-gray-100"
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={page === pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
