
"use client";

import { useState } from "react";

const moods = [
  "happy",
  "sad",
  "angry",
  "calm",
  "anxious",
  "excited",
  "tired",
  "neutral",
] as const;

type Mood = (typeof moods)[number];

type MoodEntry = {
  id: string;
  userId: string;
  mood: string;
  note: string | null;
  createdAt: string;
};

export default function MoodPage() {
  const [mood, setMood] = useState<Mood>("happy");
  const [note, setNote] = useState("");
  const [moodId, setMoodId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function saveMood() {
    if (loading) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/moods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mood,
          note,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || `Failed to save mood (${response.status})`
        );
        return;
      }

      const savedMood = data as MoodEntry;

      setMoodId(savedMood.id);
      setMessage("Mood saved successfully!");
    } catch (err) {
      console.error("Save mood error:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  async function updateMood() {
    if (!moodId || loading) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/moods/${moodId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mood,
          note,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || `Update failed (${response.status})`
        );
        return;
      }

      setMessage("Mood updated successfully!");
    } catch (err) {
      console.error("Update mood error:", err);
      setError("Unable to update mood.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteMood() {
    if (!moodId || loading) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this test mood?"
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/moods/${moodId}`, {
        method: "DELETE",
      });

      if (response.status === 204) {
        setMoodId(null);
        setNote("");
        setMessage("Mood deleted successfully!");
      } else {
        const data = await response.json();
        setError(
          data.error || `Delete failed (${response.status})`
        );
      }
    } catch (err) {
      console.error("Delete mood error:", err);
      setError("Unable to delete mood.");
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
              disabled={loading}
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
          disabled={loading}
          className="mb-4 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900"
        />

        <button
          type="button"
          onClick={saveMood}
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Processing..." : "Save Mood"}
        </button>

        {moodId && (
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={updateMood}
              disabled={loading}
              className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
            >
              Test Mood Update
            </button>

            <button
              type="button"
              onClick={deleteMood}
              disabled={loading}
              className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
            >
              Test Mood Delete
            </button>
          </div>
        )}

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
