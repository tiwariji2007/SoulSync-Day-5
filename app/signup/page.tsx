"use client";

import { useState } from "react";
import { authClient } from "@/src/lib/auth-client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setMessage("Creating account...");

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (error) {
      setMessage(error.message ?? "Signup failed");
      return;
    }

    setMessage("Signup successful! You can now log in.");
  }

  return (
    <main style={{ padding: 40, maxWidth: 450 }}>
      <h1>Create SoulSync Account</h1>

      <form onSubmit={handleSignup}>
        <input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password (minimum 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />

        <button type="submit">Sign Up</button>
      </form>

      <p>{message}</p>
    </main>
  );
}