
"use client";

import { useState } from "react";
import type {
  JournalCreate,
  JournalEntry,
} from "../../types/api";

export default function JournalPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function saveJournal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    const journal: JournalCreate = {
      user_id: 1,
      title: title.trim(),
      content: content.trim(),
    };

    try {
      const response = await fetch("/api/journals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(journal),
      });

      if (!response.ok) {
        throw new Error(`Failed to save journal (${response.status})`);
      }

      const saved: JournalEntry = await response.json();

      setMessage(`Journal saved successfully! ID: ${saved.id}`);
      setTitle("");
      setContent("");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          SoulSync Journal
        </h1>

        <p className="mb-6 text-slate-600">
          Write about your day.
        </p>

        <form onSubmit={saveJournal}>
          <label
            htmlFor="title"
            className="mb-2 block font-medium text-slate-800"
          >
            Journal Title
          </label>

          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="My day today"
            className="mb-4 w-full rounded-xl border border-slate-300 p-3 text-slate-900"
          />

          <label
            htmlFor="content"
            className="mb-2 block font-medium text-slate-800"
          >
            Your Thoughts
          </label>

          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={7}
            placeholder="What is on your mind?"
            className="mb-4 w-full rounded-xl border border-slate-300 p-3 text-slate-900"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Journal"}
          </button>

          {message && (
            <p role="status" className="mt-4 text-green-700">
              {message}
            </p>
          )}

          {error && (
            <p role="alert" className="mt-4 text-red-600">
              {error}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
