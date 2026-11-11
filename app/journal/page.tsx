
"use client";

import { useState } from "react";

export default function JournalPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [journalId, setJournalId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Save a new journal
  async function saveJournal() {
    if (!title.trim() || !content.trim()) {
      setMessage("Please enter a title and your thoughts.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/journals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error || `Failed to save journal (${response.status})`
        );
        return;
      }

      setJournalId(data.id);
      setMessage(`Journal saved successfully! ID: ${data.id}`);
    } catch {
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  // Update the saved journal
  async function updateJournal() {
    if (!journalId) {
      setMessage("Please save a journal first.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setMessage("Title and content cannot be empty.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/journals/${journalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error || `Update failed (${response.status})`
        );
        return;
      }

      setMessage("Journal updated successfully!");
    } catch {
      setMessage("Unable to update journal.");
    } finally {
      setLoading(false);
    }
  }

  // Delete the saved journal
  async function deleteJournal() {
    if (!journalId) {
      setMessage("Please save a journal first.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this journal permanently?"
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/journals/${journalId}`, {
        method: "DELETE",
      });

      if (response.status === 204) {
        setMessage("Journal deleted successfully!");
        setJournalId(null);
        setTitle("");
        setContent("");
      } else {
        const data = await response.json();
        setMessage(
          data.error || `Delete failed (${response.status})`
        );
      }
    } catch {
      setMessage("Unable to delete journal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: "720px",
        margin: "40px auto",
        padding: "30px",
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <h1
        style={{
          fontSize: "36px",
          fontWeight: "bold",
          color: "#0f172a",
          marginBottom: "10px",
        }}
      >
        SoulSync Journal
      </h1>

      <p style={{ color: "#475569", marginBottom: "30px" }}>
        Write about your day.
      </p>

      <label
        htmlFor="journal-title"
        style={{ display: "block", marginBottom: "10px" }}
      >
        Journal Title
      </label>

      <input
        id="journal-title"
        type="text"
        placeholder="My day today"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
        style={{
          width: "100%",
          padding: "14px",
          border: "1px solid #cbd5e1",
          borderRadius: "12px",
          marginBottom: "24px",
          color: "#0f172a",
          backgroundColor: "white",
        }}
      />

      <label
        htmlFor="journal-content"
        style={{ display: "block", marginBottom: "10px" }}
      >
        Your Thoughts
      </label>

      <textarea
        id="journal-content"
        placeholder="What is on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        style={{
          width: "100%",
          padding: "14px",
          border: "1px solid #cbd5e1",
          borderRadius: "12px",
          marginBottom: "24px",
          color: "#0f172a",
          backgroundColor: "white",
        }}
      />

      <button
        type="button"
        onClick={saveJournal}
        disabled={loading}
        style={{
          width: "100%",
          backgroundColor: "#2563eb",
          color: "white",
          padding: "15px",
          borderRadius: "10px",
          fontWeight: "bold",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Processing..." : "Save Journal"}
      </button>

      {message && (
        <p
          role="status"
          style={{
            marginTop: "20px",
            color: message.includes("successfully")
              ? "#15803d"
              : "#dc2626",
            overflowWrap: "anywhere",
          }}
        >
          {message}
        </p>
      )}

      {journalId && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "20px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={updateJournal}
            disabled={loading}
            style={{
              backgroundColor: "#16a34a",
              color: "white",
              padding: "12px 20px",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            Test Journal Update
          </button>

          <button
            type="button"
            onClick={deleteJournal}
            disabled={loading}
            style={{
              backgroundColor: "#dc2626",
              color: "white",
              padding: "12px 20px",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            Test Journal Delete
          </button>
        </div>
      )}
    </main>
  );
}
