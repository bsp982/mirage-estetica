"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function GestorLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha no login");
      }
      router.push("/gestor");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-[radial-gradient(circle_at_top,_#0b2a8f_0%,_#050914_60%)] px-5 py-16">
      <div className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-black/30 p-8">
        <Link href="/" className="text-xs text-white/50 hover:text-white">
          ← Voltar ao site
        </Link>
        <p className="mt-6 text-xs uppercase tracking-[0.25em] text-brand-gold">
          Área restrita
        </p>
        <h1 className="font-display mt-2 text-4xl text-white">
          Gestor · Estética MVP
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Acesse para ver a agenda e os agendamentos do dia.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-white/70">Usuário</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-brand-gold"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/70">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-brand-gold"
              autoComplete="current-password"
              placeholder="••••••"
            />
          </div>
          {error && (
            <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand-gold py-3 font-semibold text-brand-ink disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-white/40">
          MVP: usuário <strong className="text-white/60">admin</strong> / senha{" "}
          <strong className="text-white/60">admin</strong>
        </p>
      </div>
    </div>
  );
}
