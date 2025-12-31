"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import dayjs from "dayjs";
import axios from "axios";
import SendNewsletterModal from "@/components/newsletter/SendNewsletterModal";

type Subscriber = {
  _id: string;
  email: string;
  status: "subscribed" | "unsubscribed";
  subscribedAt: string;
};

export default function NewsletterAdminPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  /* ================= FETCH SUBSCRIBERS ================= */
  useEffect(() => {
    async function fetchSubscribers() {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get("/newsletter/subscribers", {
          params: { page, limit: pageSize, status: "subscribed" },
        });

        setSubscribers(res.data.subscribers);
        setTotal(res.data.total);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Failed to load subscribers");
        } else {
          setError("Failed to load subscribers");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchSubscribers();
  }, [page, pageSize]);

  /* ================= SEND NEWSLETTER ================= */
  async function handleSendNewsletter() {
    if (!subject.trim() || !content.trim()) {
      setSendResult("Subject and content are required");
      return;
    }

    try {
      setSending(true);
      setSendResult(null);
      setError(null);

      const res = await api.post(
        "/newsletter/send",
        {
          subject,
          templateName: "newsletter-broadcast.html",
          variables: {
            content, // injected inside template as {{content}}
          },
        },
        { withCredentials: true }
      );

      setSendResult(`Newsletter sent to ${res.data.sentTo} subscribers`);
      setSubject("");
      setContent("");
      setModalOpen(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to send newsletter");
      } else {
        setError("Failed to send newsletter");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Newsletter Subscribers</h1>

      <button
        onClick={() => setModalOpen(true)}
        className="mb-6 bg-brand-primary text-white px-5 py-2 rounded hover:bg-brand-primary-dark"
      >
        Send Newsletter
      </button>

      {loading && <p>Loading subscribers...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && subscribers.length === 0 && (
        <p>No subscribers found.</p>
      )}

      {!loading && subscribers.length > 0 && (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">Email</th>
              <th className="border border-gray-300 p-2 text-left">Status</th>
              <th className="border border-gray-300 p-2 text-left">Subscribed At</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map(({ _id, email, status, subscribedAt }) => (
              <tr key={_id} className="even:bg-gray-50">
                <td className="border border-gray-300 p-2">{email}</td>
                <td className="border border-gray-300 p-2 capitalize">
                  {status}
                </td>
                <td className="border border-gray-300 p-2">
                  {dayjs(subscribedAt).format("DD MMM YYYY, h:mm A")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="px-3 py-1 border rounded">{page}</span>

          <button
            onClick={() =>
              setPage((p) => (p * pageSize < total ? p + 1 : p))
            }
            disabled={page * pageSize >= total}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      <SendNewsletterModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        subject={subject}
        setSubject={setSubject}
        content={content}
        setContent={setContent}
        onSend={handleSendNewsletter}
        sending={sending}
        result={sendResult}
      />
    </main>
  );
}
