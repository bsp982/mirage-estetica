"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";

type GalleryItem = {
  id: string;
  beforeUrl: string;
  afterUrl: string;
  description: string | null;
  vehicleLabel: string | null;
  active: boolean;
};

export function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [before, setBefore] = useState<File | null>(null);
  const [after, setAfter] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState("");
  const [afterPreview, setAfterPreview] = useState("");
  const [description, setDescription] = useState("");
  const [vehicleLabel, setVehicleLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/gallery");
    const data = await res.json();
    setItems(data.items ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!before) {
      setBeforePreview("");
      return;
    }
    const url = URL.createObjectURL(before);
    setBeforePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [before]);

  useEffect(() => {
    if (!after) {
      setAfterPreview("");
      return;
    }
    const url = URL.createObjectURL(after);
    setAfterPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [after]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMsg("");
    if (!before || !after) {
      setError("Selecione a foto suja (antes) e a limpa (depois)");
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.set("before", before);
      form.set("after", after);
      form.set("description", description);
      form.set("vehicleLabel", vehicleLabel);
      const res = await fetch("/api/gallery", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha no upload");
      setBefore(null);
      setAfter(null);
      setDescription("");
      setVehicleLabel("");
      setMsg("Antes e depois publicado no site");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no upload");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Remover este antes/depois do site?")) return;
    await fetch(`/api/gallery?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    await load();
  }

  async function toggleActive(item: GalleryItem) {
    await fetch("/api/gallery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, active: !item.active }),
    });
    await load();
  }

  return (
    <section className="space-y-4 rounded-[1.75rem] border border-white/10 bg-black/25 p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-brand-gold">
          Galeria do site
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-white">
          Antes e depois
        </h2>
        <p className="mt-2 text-sm text-white/60">
          Envie uma foto do carro sujo (antes) e outra limpo (depois). Elas
          aparecem no site público da sua estética.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-white/70">
            Antes (carro sujo) *
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setBefore(e.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-xs text-white/60 file:mr-3 file:rounded-full file:border-0 file:bg-brand-gold file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-ink"
            />
            {beforePreview && (
              <span className="relative mt-3 block h-36 overflow-hidden rounded-xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={beforePreview}
                  alt="Prévia antes"
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">
                  Antes
                </span>
              </span>
            )}
          </label>

          <label className="block text-sm text-white/70">
            Depois (carro limpo) *
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setAfter(e.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-xs text-white/60 file:mr-3 file:rounded-full file:border-0 file:bg-brand-gold file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-ink"
            />
            {afterPreview && (
              <span className="relative mt-3 block h-36 overflow-hidden rounded-xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={afterPreview}
                  alt="Prévia depois"
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-2 top-2 rounded bg-brand-gold px-2 py-0.5 text-[10px] uppercase tracking-wider text-brand-ink">
                  Depois
                </span>
              </span>
            )}
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-white/70">
            Veículo (opcional)
            <input
              value={vehicleLabel}
              onChange={(e) => setVehicleLabel(e.target.value)}
              placeholder="Ex: Honda Civic preto"
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-white"
            />
          </label>
          <label className="block text-sm text-white/70">
            Descrição (opcional)
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Lavagem detalhada"
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-white"
            />
          </label>
        </div>

        {error && <p className="text-sm text-red-300">{error}</p>}
        {msg && <p className="text-sm text-brand-gold">{msg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-brand-gold px-5 py-2.5 text-sm font-semibold text-brand-ink disabled:opacity-60"
        >
          {loading ? "Enviando…" : "Publicar no site"}
        </button>
      </form>

      <div className="space-y-3 border-t border-white/10 pt-4">
        <p className="text-sm text-white/50">
          {items.length === 0
            ? "Nenhum antes/depois ainda."
            : `${items.length} item(ns) na galeria`}
        </p>
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-3"
          >
            <div className="grid grid-cols-2 gap-2">
              <div className="relative h-28 overflow-hidden rounded-xl">
                <Image
                  src={item.beforeUrl}
                  alt="Antes"
                  fill
                  className="object-cover"
                  unoptimized={item.beforeUrl.startsWith("/uploads/")}
                />
                <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[10px] uppercase text-white">
                  Antes
                </span>
              </div>
              <div className="relative h-28 overflow-hidden rounded-xl">
                <Image
                  src={item.afterUrl}
                  alt="Depois"
                  fill
                  className="object-cover"
                  unoptimized={item.afterUrl.startsWith("/uploads/")}
                />
                <span className="absolute left-2 top-2 rounded bg-brand-gold px-2 py-0.5 text-[10px] uppercase text-brand-ink">
                  Depois
                </span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <div className="text-white/70">
                <p>{item.vehicleLabel || "Veículo não informado"}</p>
                {item.description && (
                  <p className="text-white/45">{item.description}</p>
                )}
                {!item.active && (
                  <p className="text-amber-200/80">Oculto no site</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void toggleActive(item)}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70"
                >
                  {item.active ? "Ocultar" : "Exibir"}
                </button>
                <button
                  type="button"
                  onClick={() => void remove(item.id)}
                  className="rounded-full border border-red-400/30 px-3 py-1 text-xs text-red-200"
                >
                  Remover
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
