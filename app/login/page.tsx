"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      setError("Usuario o contraseña incorrectos.");
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold tracking-tight">
          Panel · <span className="text-yellow-400">Skatepark Perubeach</span>
        </h1>
        <p className="text-sm text-neutral-400">
          Ingresá para gestionar las inscripciones.
        </p>

        <div>
          <label className="block text-sm mb-1">Usuario</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="w-full rounded bg-neutral-800 border border-neutral-700 px-3 py-2 outline-none focus:border-yellow-400"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded bg-neutral-800 border border-neutral-700 px-3 py-2 outline-none focus:border-yellow-400"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-yellow-400 text-black font-semibold py-2 hover:bg-yellow-300 disabled:opacity-60"
        >
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
