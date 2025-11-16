"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login:", { email, password });
    // On verra la vraie logique plus tard
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-700">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-blue-400 text-2xl font-bold mb-6">Connexion</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-blue-400 block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-6">
            <label className="text-blue-400 block text-sm font-medium mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Se connecter
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Pas de compte ?{" "}
          <a href="/register" className="text-blue-500">
            S&apos;inscrire
          </a>
        </p>
      </div>
    </div>
  );
}
