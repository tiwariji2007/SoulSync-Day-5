
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type MoodEntry = {
  id: string;
  userId: string;
  mood: string;
  note: string | null;
  createdAt: string;
};

type JournalEntry = {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
};

export default function HistoryPage() {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const [editingMoodId, setEditingMoodId] = useState<string | null>(null);
  const [editMood, setEditMood] = useState("");
  const [editNote, setEditNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load history
  useEffect(() => {
    const controller = new AbortController();

    async function loadHistory() {
      try {
        setLoading(true);
        setError("");
        setUnauthorized(false);

        const [moodResponse, journalResponse] = await Promise.all([
          fetch("/api/moods", {
            signal: controller.signal,
            cache: "no-store",
          }),
          fetch("/api/journals", {
            signal: controller.signal,
            cache: "no-store",
          }),
        ]);

        if (
          moodResponse.status === 401 ||
          journalResponse.status === 401
        ) {
          setUnauthorized(true);
          return;
        }

        if (!moodResponse.ok || !journalResponse.ok) {
          throw new Error(
            `Unable to load history (moods: ${moodResponse.status}, journals: ${journalResponse.status}).`
          );
        }

        const moodData: MoodEntry[] = await moodResponse.json();
        const journalData: JournalEntry[] =
          await journalResponse.json();

        if (controller.signal.aborted) return;

        setMoods(moodData);
        setJournals(journalData);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => controller.abort();
  }, []);

  // Start journal editing
  function startEditing(entry: JournalEntry) {
    setEditingId(entry.id);
    setEditTitle(entry.title);
    setEditContent(entry.content);
    setActionError("");
  }

  // Update journal
  async function saveJournal(id: string) {
    if (!editTitle.trim() || !editContent.trim()) {
      setActionError("Title and content are required.");
      return;
    }

    try {
      setSaving(true);
      setActionError("");

      const response = await fetch(`/api/journals/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
        }),
      });

      if (response.status === 401) {
        setUnauthorized(true);
        return;
      }

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(
          result?.message || "Unable to update journal entry."
        );
      }

      setJournals((previous) =>
        previous.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                title: editTitle.trim(),
                content: editContent.trim(),
              }
            : entry
        )
      );

      setEditingId(null);
      setEditTitle("");
      setEditContent("");
    } catch (err: unknown) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving."
      );
    } finally {
      setSaving(false);
    }
  }

  // Delete journal
  async function deleteJournal(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this journal entry?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setActionError("");

      const response = await fetch(`/api/journals/${id}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        setUnauthorized(true);
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to delete journal entry.");
      }

      setJournals((previous) =>
        previous.filter((entry) => entry.id !== id)
      );
    } catch (err: unknown) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Something went wrong while deleting."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // Start mood editing
  function startMoodEditing(entry: MoodEntry) {
    setEditingMoodId(entry.id);
    setEditMood(entry.mood);
    setEditNote(entry.note ?? "");
    setActionError("");
  }

  // Update mood
  async function saveMood(id: string) {
    if (!editMood.trim()) {
      setActionError("Please select a mood.");
      return;
    }

    try {
      setSaving(true);
      setActionError("");

      const response = await fetch(`/api/moods/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mood: editMood,
          note: editNote.trim() || null,
        }),
      });

      if (response.status === 401) {
        setUnauthorized(true);
        return;
      }

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(
          result?.message || "Unable to update mood."
        );
      }

      setMoods((previous) =>
        previous.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                mood: editMood.trim(),
                note: editNote.trim() || null,
              }
            : entry
        )
      );

      setEditingMoodId(null);
      setEditMood("");
      setEditNote("");
    } catch (err: unknown) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving."
      );
    } finally {
      setSaving(false);
    }
  }

  // Delete mood
  async function deleteMood(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this mood entry?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setActionError("");

      const response = await fetch(`/api/moods/${id}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        setUnauthorized(true);
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to delete mood entry.");
      }

      setMoods((previous) =>
        previous.filter((entry) => entry.id !== id)
      );
    } catch (err: unknown) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Something went wrong while deleting."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">

        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          SoulSync History
        </h1>

        <p className="mb-6 text-slate-600">
          Your saved moods and journal entries.
        </p>

        {loading && (
          <p role="status" className="text-slate-600">
            Loading history...
          </p>
        )}

        {!loading && unauthorized && (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="mb-4 text-slate-700">
              Please log in to view your private history.
            </p>

            <Link
              href="/login"
              className="inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
            >
              Go to Login
            </Link>
          </div>
        )}

        {!loading && error && !unauthorized && (
          <p role="alert" className="rounded-xl bg-white p-4 text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && !unauthorized && (
          <div className="space-y-8">

            {actionError && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-red-600"
              >
                {actionError}
              </p>
            )}

            {/* Mood History */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-slate-900">
                Mood History
              </h2>

              {moods.length === 0 ? (
                <p className="rounded-xl bg-white p-4 text-slate-600">
                  No moods logged yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {moods.map((entry) => (
                    <article
                      key={entry.id}
                      className="rounded-xl bg-white p-4 shadow-sm"
                    >
                      {editingMoodId === entry.id ? (
                        <div className="space-y-3">
                          <select
                            value={editMood}
                            onChange={(e) =>
                              setEditMood(e.target.value)
                            }
                            className="w-full rounded-lg border border-slate-300 p-3 text-slate-900"
                          >
                            <option value="">Select mood</option>
                            <option value="Happy">Happy</option>
                            <option value="Sad">Sad</option>
                            <option value="Angry">Angry</option>
                            <option value="Anxious">Anxious</option>
                            <option value="Calm">Calm</option>
                            <option value="Excited">Excited</option>
                            <option value="Stressed">Stressed</option>
                            <option value="Neutral">Neutral</option>
                          </select>

                          <textarea
                            value={editNote}
                            onChange={(e) =>
                              setEditNote(e.target.value)
                            }
                            rows={3}
                            maxLength={1000}
                            placeholder="Mood note"
                            className="w-full rounded-lg border border-slate-300 p-3 text-slate-900"
                          />

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => saveMood(entry.id)}
                              disabled={saving}
                              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                            >
                              {saving ? "Saving..." : "Save Changes"}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingMoodId(null);
                                setActionError("");
                              }}
                              disabled={saving}
                              className="rounded-lg bg-slate-200 px-4 py-2 font-semibold text-slate-800"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="font-semibold capitalize text-slate-900">
                            {entry.mood}
                          </p>

                          <p className="text-sm text-slate-500">
                            {new Date(entry.createdAt).toLocaleString()}
                          </p>

                          {entry.note && (
                            <p className="mt-2 text-slate-700">
                              {entry.note}
                            </p>
                          )}

                          <div className="mt-4 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => startMoodEditing(entry)}
                              disabled={deletingId === entry.id || saving}
                              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteMood(entry.id)}
                              disabled={deletingId === entry.id || saving}
                              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            >
                              {deletingId === entry.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Journal History */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-slate-900">
                Journal History
              </h2>

              {journals.length === 0 ? (
                <p className="rounded-xl bg-white p-4 text-slate-600">
                  No journal entries yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {journals.map((entry) => (
                    <article
                      key={entry.id}
                      className="rounded-xl bg-white p-4 shadow-sm"
                    >
                      {editingId === entry.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) =>
                              setEditTitle(e.target.value)
                            }
                            maxLength={200}
                            placeholder="Journal title"
                            className="w-full rounded-lg border border-slate-300 p-3 text-slate-900"
                          />

                          <textarea
                            value={editContent}
                            onChange={(e) =>
                              setEditContent(e.target.value)
                            }
                            rows={5}
                            placeholder="Journal content"
                            className="w-full rounded-lg border border-slate-300 p-3 text-slate-900"
                          />

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => saveJournal(entry.id)}
                              disabled={saving}
                              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                            >
                              {saving ? "Saving..." : "Save Changes"}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setActionError("");
                              }}
                              disabled={saving}
                              className="rounded-lg bg-slate-200 px-4 py-2 font-semibold text-slate-800"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-semibold text-slate-900">
                            {entry.title}
                          </h3>

                          <p className="text-sm text-slate-500">
                            {new Date(entry.createdAt).toLocaleString()}
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-slate-700">
                            {entry.content}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => startEditing(entry)}
                              disabled={deletingId === entry.id || saving}
                              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteJournal(entry.id)}
                              disabled={deletingId === entry.id || saving}
                              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            >
                              {deletingId === entry.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
