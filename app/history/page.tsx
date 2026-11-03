
"use client";

import { useEffect, useState } from "react";
import type { MoodEntry, JournalEntry } from "../../types/api";

export default function HistoryPage() {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadHistory() {
      try {
        setLoading(true);
        setError("");

        const [moodResponse, journalResponse] = await Promise.all([
          fetch("/api/moods", { signal: controller.signal }),
          fetch("/api/journals", { signal: controller.signal }),
        ]);

        if (!moodResponse.ok || !journalResponse.ok) {
          throw new Error("Unable to load your history.");
        }

        const moodData: MoodEntry[] = await moodResponse.json();
        const journalData: JournalEntry[] = await journalResponse.json();

        if (controller.signal.aborted) return;

        // Temporary user used for local development.
        setMoods(moodData.filter((entry) => entry.user_id === 1));
        setJournals(journalData.filter((entry) => entry.user_id === 1));
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

        {error && (
          <p role="alert" className="text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="space-y-8">
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
                      <p className="font-semibold capitalize text-slate-900">
                        {entry.mood}
                      </p>

                      <p className="text-sm text-slate-500">
                        {new Date(entry.created_at).toLocaleString()}
                      </p>

                      {entry.note && (
                        <p className="mt-2 text-slate-700">{entry.note}</p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>

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
                      <h3 className="font-semibold text-slate-900">
                        {entry.title}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {new Date(entry.created_at).toLocaleString()}
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-slate-700">
                        {entry.content}
                      </p>
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
