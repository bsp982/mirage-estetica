"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { PlatformHeader } from "@/components/platform-header";
import { PlatformFooter } from "@/components/platform-footer";
import { slugifyCompanyName } from "@/lib/platform";

type Success = {
  sitePath: string;
  email: string;
  companyName: string;
};

export default function OnboardingPage() {
  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<Success | null>(null);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugifyCompanyName(companyName));
    }
  }, [companyName, slugTouched]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/platform/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          slug,
          adminName,
          adminEmail,
          adminPassword,
          phone,
          whatsapp: whatsapp || phone,
          planCode: "FREE",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha no cadastro");
      }
      setSuccess({
        sitePath: data.sitePath,
        email: adminEmail,
        companyName: data.company.name,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no cadastro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <PlatformHeader />
      <main className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,_#0b2a8f_0%,_#050914_55%)] px-5 py-12">
        {success ? (
          <div className="w-full max-w-lg space-y-5 rounded-[1.75rem] border border-brand-gold/30 bg-black/35 p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-brand-gold">
              Conta criada
            </p>
            <h1 className="font-display text-4xl text-white">
              {success.companyName} no ar
            </h1>
            <p className="text-sm text-white/70">
              Seu plano FREE já está ativo. Compartilhe o site com clientes e
              entre no painel para acompanhar a agenda.
            </p>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
              <p>
                Site:{" "}
                <Link
                  href={success.sitePath}
                  className="text-brand-gold hover:underline"
                >
                  {success.sitePath}
                </Link>
              </p>
              <p className="mt-2">Login: {success.email}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={success.sitePath}
                className="rounded-full bg-brand-gold px-5 py-2.5 text-sm font-semibold text-brand-ink"
              >
                Abrir meu site
              </Link>
              <Link
                href="/gestor/login"
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm text-white"
              >
                Entrar no CRM
              </Link>
            </div>
            <p className="text-xs text-white/40">
              Dica: cadastre mais serviços em Serviços no painel. Já deixamos um
              serviço inicial para você receber o primeiro agendamento.
            </p>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="w-full max-w-lg space-y-4 rounded-[1.75rem] border border-white/10 bg-black/30 p-8"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-brand-gold">
              Plano FREE
            </p>
            <h1 className="font-display text-4xl text-white">
              Criar minha estética
            </h1>
            <p className="text-sm text-white/60">
              Sem cartão. Em poucos minutos você tem site + agenda.
            </p>

            <label className="block text-sm text-white/70">
              Nome da estética *
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                minLength={2}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-brand-gold"
                placeholder="Ex: Auto Detail João"
              />
            </label>

            <label className="block text-sm text-white/70">
              Endereço do site (slug) *
              <input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "-"),
                  );
                }}
                required
                pattern="^[a-z0-9-]+$"
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-brand-gold"
              />
              <span className="mt-1 block text-xs text-white/40">
                Seu site ficará em /s/{slug || "sua-estetica"}
              </span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-white/70">
                Seu nome *
                <input
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-brand-gold"
                />
              </label>
              <label className="block text-sm text-white/70">
                WhatsApp da loja
                <input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-brand-gold"
                  placeholder="11999990000"
                />
              </label>
            </div>

            <label className="block text-sm text-white/70">
              Telefone
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-brand-gold"
              />
            </label>

            <label className="block text-sm text-white/70">
              E-mail de acesso *
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-brand-gold"
              />
            </label>

            <label className="block text-sm text-white/70">
              Senha * (mín. 6)
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-brand-gold"
              />
            </label>

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
              {loading ? "Criando…" : "Criar conta FREE"}
            </button>

            <p className="text-center text-xs text-white/40">
              Ao continuar, você concorda com os{" "}
              <Link href="/termos" className="text-brand-gold/80">
                Termos
              </Link>{" "}
              e a{" "}
              <Link href="/privacidade" className="text-brand-gold/80">
                Privacidade
              </Link>
              .
            </p>
          </form>
        )}
      </main>
      <PlatformFooter />
    </div>
  );
}
