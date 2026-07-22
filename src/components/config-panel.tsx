"use client";

import { FormEvent, useEffect, useState } from "react";
import { GalleryManager } from "@/components/gallery-manager";

type Settings = {
  motto?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  hoursLabel?: string | null;
  address?: string | null;
  about?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  showGallery?: boolean;
  showTestimonials?: boolean;
  showAbout?: boolean;
};

export function ConfigPanel() {
  const [settings, setSettings] = useState<Settings>({});
  const [slug, setSlug] = useState("");
  const [domain, setDomain] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    void fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setSettings(d.settings ?? {});
        setSlug(d.company?.slug ?? "");
      });
  }, []);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setMsg(res.ok ? "Identidade salva" : "Falha ao salvar");
  }

  async function addDomain(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    });
    const data = await res.json();
    setMsg(res.ok ? "Domínio adicionado" : data.error || "Falha");
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-brand-gold">
          Site e identidade
        </p>
        <h1 className="font-display mt-1 text-4xl text-white">Configurações</h1>
        <p className="mt-2 text-sm text-white/60">
          Site público:{" "}
          <a className="text-brand-gold" href={`/s/${slug}`}>
            /s/{slug}
          </a>
        </p>
      </div>

      <GalleryManager />

      <form onSubmit={onSave} className="grid gap-3 sm:grid-cols-2">
        <p className="sm:col-span-2 text-sm font-semibold text-white">
          Identidade e contato
        </p>
        {(
          [
            ["motto", "Motto"],
            ["phone", "Telefone"],
            ["whatsapp", "WhatsApp"],
            ["instagram", "Instagram"],
            ["hoursLabel", "Horários"],
            ["address", "Endereço"],
            ["primaryColor", "Cor primária"],
            ["secondaryColor", "Cor secundária"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-sm text-white/70">
            {label}
            <input
              value={(settings[key] as string) ?? ""}
              onChange={(e) =>
                setSettings((s) => ({ ...s, [key]: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-white"
            />
          </label>
        ))}
        <label className="sm:col-span-2 block text-sm text-white/70">
          Sobre
          <textarea
            value={settings.about ?? ""}
            onChange={(e) =>
              setSettings((s) => ({ ...s, about: e.target.value }))
            }
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-white"
            rows={3}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-white/70 sm:col-span-2">
          <input
            type="checkbox"
            checked={settings.showGallery ?? true}
            onChange={(e) =>
              setSettings((s) => ({ ...s, showGallery: e.target.checked }))
            }
            className="accent-[#e0b12a]"
          />
          Exibir galeria antes/depois no site
        </label>
        <button
          type="submit"
          className="sm:col-span-2 rounded-full bg-brand-gold py-2.5 text-sm font-semibold text-brand-ink"
        >
          Salvar identidade
        </button>
      </form>

      <form onSubmit={addDomain} className="flex gap-2">
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="www.suaestetica.com.br"
          className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
        />
        <button
          type="submit"
          className="rounded-full border border-white/20 px-4 text-sm text-white"
        >
          Domínio próprio
        </button>
      </form>

      {msg && <p className="text-sm text-brand-gold">{msg}</p>}
    </div>
  );
}
