
"use client";

import { useState } from "react";
import type { Mood, MoodCreate, MoodEntry } from "../../types/api";

const moods: Mood[] = [
  "happy",
  "sad",
  "angry",
  "calm",
  "anxious",
  "excited",
  "tired",
  "neutral",
];

export default function MoodPage() {
  const [mood, setMood] = useState<Mood>("happy");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function saveMood() {
    setLoading(true);
    setMessage("");
    setError("");

    const newMood: MoodCreate = {
      user_id: 1,
      mood,
      note,
    };

    try {
      const response = await fetch("/api/moods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMood),
      });

      if (!response.ok) {
        throw new Error(`Failed to save mood (${response.status})`);
      }

      const savedMood: MoodEntry = await response.json();

      setMessage(`Mood saved successfully! ID: ${savedMood.id}`);
      setNote("");
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
          SoulSync Mood Logger
        </h1>
        <p className="mb-6 text-slate-600">
          How are you feeling today?
        </p>

        <label className="mb-2 block font-medium text-slate-800">
          Select your mood
        </label>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {moods.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMood(item)}
              aria-pressed={mood === item}
              className={`rounded-xl border p-3 capitalize transition ${
                mood === item
                  ? "border-blue-600 bg-blue-50 text-blue-800"
                  : "border-slate-200 text-slate-700"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <label
          htmlFor="mood-note"
          className="mb-2 block font-medium text-slate-800"
        >
          Add a note (optional)
        </label>

        <textarea
          id="mood-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="Write about your day..."
          className="mb-4 w-full rounded-xl border border-slate-300 p-3 text-slate-900"
        />

        <button
          type="button"
          onClick={saveMood}
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Mood"}
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
      </section>
    </main>
  );
}
