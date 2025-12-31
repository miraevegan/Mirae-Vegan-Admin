"use client";

interface Props {
  open: boolean;
  onClose: () => void;
  subject: string;
  setSubject: (v: string) => void;
  content: string;
  setContent: (v: string) => void;
  onSend: () => void;
  sending: boolean;
  result: string | null;
}

export default function SendNewsletterModal({
  open,
  onClose,
  subject,
  setSubject,
  content,
  setContent,
  onSend,
  sending,
  result,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <h2 className="text-2xl font-semibold mb-4">Send Newsletter</h2>

        <label className="block mb-2 font-medium">Subject</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full mb-4 border rounded px-3 py-2"
          disabled={sending}
        />

        <label className="block mb-2 font-medium">HTML Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="w-full mb-4 border rounded px-3 py-2 font-mono"
          disabled={sending}
        />

        {result && (
          <p className={`mb-4 ${result.includes("required") ? "text-red-500" : "text-green-600"}`}>
            {result}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={onSend}
            disabled={sending}
            className="px-4 py-2 bg-brand-primary text-white rounded disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
