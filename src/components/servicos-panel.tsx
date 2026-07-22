"use client";

import { FormEvent, useEffect, useState } from "react";
import { formatBRL } from "@/lib/money";

type ServiceRow = {
  id: string;
  name: string;
  slug: string;
  durationHours: number;
  priceFrom: number;
  active: boolean;
  category: string | null;
};

export function ServicosPanel() {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [priceFrom, setPriceFrom] = useState("120");
  const [durationHours, setDurationHours] = useState("2");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/services/admin");
    const data = await res.json();
    setServices(data.services ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/services/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        description: description || name,
        priceFrom: Number(priceFrom),
        durationHours: Number(durationHours),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Falha ao criar");
      return;
    }
    setName("");
    setSlug("");
    setDescription("");
    await load();
  }

  async function toggleActive(s: ServiceRow) {
    await fetch("/api/services/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: s.id, active: !s.active }),
    });
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-brand-gold">
          Catálogo
        </p>
        <h1 className="font-display mt-1 text-4xl text-white">Serviços</h1>
      </div>

      <form
        onSubmit={onCreate}
        className="grid gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 sm:grid-cols-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome"
          required
          className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
        />
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="slug (opcional)"
          className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
        />
        <input
          value={priceFrom}
          onChange={(e) => setPriceFrom(e.target.value)}
          type="number"
          placeholder="Preço"
          className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
        />
        <input
          value={durationHours}
          onChange={(e) => setDurationHours(e.target.value)}
          type="number"
          step="0.5"
          placeholder="Duração (h)"
          className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição"
          className="sm:col-span-2 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
        />
        {error && <p className="sm:col-span-2 text-sm text-red-300">{error}</p>}
        <button
          type="submit"
          className="sm:col-span-2 rounded-full bg-brand-gold py-2 text-sm font-semibold text-brand-ink"
        >
          Adicionar serviço
        </button>
      </form>

      <div className="space-y-3">
        {services.map((s) => (
          <article
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 p-4"
          >
            <div>
              <h2 className="font-semibold text-white">
                {s.name}{" "}
                {!s.active && (
                  <span className="text-xs text-white/40">(inativo)</span>
                )}
              </h2>
              <p className="text-sm text-white/55">
                {formatBRL(s.priceFrom)} · {s.durationHours}h · {s.slug}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void toggleActive(s)}
              className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/70"
            >
              {s.active ? "Desativar" : "Ativar"}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
