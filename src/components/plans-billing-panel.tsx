"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { readApiJson } from "@/lib/http";

type CatalogItem = {
  name: string;
  priceLabel: string;
  amountBrl: number;
  bullets: string[];
};

type BillingInfo = {
  planCode: string;
  planName: string;
  subscriptionStatus: string;
  billingMode: "stripe" | "demo" | "unavailable";
  catalog: Record<"PRO" | "PREMIUM", CatalogItem>;
};

export function PlansBillingPanel() {
  const search = useSearchParams();
  const [info, setInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"PRO" | "PREMIUM" | "portal" | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/billing/checkout");
      const data = await readApiJson<BillingInfo & { error?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Falha ao carregar planos");
      setInfo(data as BillingInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar planos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (search.get("success") === "1") {
      const plan = search.get("plan") || "";
      const demo = search.get("demo") === "1";
      setMessage(
        demo
          ? `Plano ${plan} ativado em modo demonstração.`
          : `Pagamento recebido! Plano ${plan} será liberado em instantes.`,
      );
      void load();
    }
    if (search.get("canceled") === "1") {
      setMessage("Checkout cancelado. Seu plano atual foi mantido.");
    }
  }, [search]);

  async function startCheckout(planCode: "PRO" | "PREMIUM") {
    setBusy(planCode);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode }),
      });
      const data = await readApiJson<{ url?: string; error?: string }>(res);
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Não foi possível iniciar o pagamento");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no checkout");
      setBusy(null);
    }
  }

  async function openPortal() {
    setBusy("portal");
    setError("");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await readApiJson<{ url?: string; error?: string }>(res);
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Portal indisponível");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao abrir portal");
      setBusy(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-white/55">Carregando planos…</p>;
  }

  if (!info) {
    return (
      <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        {error || "Não foi possível carregar a cobrança."}
      </p>
    );
  }

  const rank: Record<string, number> = { FREE: 0, PRO: 1, PREMIUM: 2 };
  const currentRank = rank[info.planCode] ?? 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-gold">
          Seu plano atual
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          {info.planName}{" "}
          <span className="text-sm font-normal text-white/50">
            ({info.subscriptionStatus})
          </span>
        </h2>
        <p className="mt-2 text-sm text-white/60">
          {info.billingMode === "demo"
            ? "Modo demonstração: o upgrade libera na hora (sem cartão)."
            : info.billingMode === "stripe"
              ? "Pagamento seguro via Stripe (assinatura mensal)."
              : "Configure as chaves Stripe para aceitar pagamentos reais."}
        </p>
        {info.billingMode === "stripe" && (
          <button
            type="button"
            onClick={() => void openPortal()}
            disabled={busy === "portal"}
            className="mt-4 rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40 disabled:opacity-50"
          >
            {busy === "portal" ? "Abrindo…" : "Gerenciar assinatura / cartão"}
          </button>
        )}
      </div>

      {message && (
        <p className="rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-4 py-3 text-sm text-brand-gold">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {(["PRO", "PREMIUM"] as const).map((code) => {
          const plan = info.catalog[code];
          const isCurrent = info.planCode === code;
          const isDowngrade = currentRank > (rank[code] ?? 0);
          const disabled = isCurrent || isDowngrade || busy !== null;

          return (
            <article
              key={code}
              className={`rounded-[1.5rem] border p-6 ${
                code === "PREMIUM"
                  ? "border-brand-gold/40 bg-gradient-to-b from-brand-blue/40 to-transparent"
                  : "border-white/10 bg-black/25"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-brand-gold">
                {plan.name}
              </p>
              <p className="mt-2 font-display text-4xl text-white">
                {plan.priceLabel}
              </p>
              <ul className="mt-5 space-y-2 text-sm text-white/70">
                {plan.bullets.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={disabled}
                onClick={() => void startCheckout(code)}
                className="mt-6 w-full rounded-full bg-brand-gold py-3 text-sm font-semibold text-brand-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy === code
                  ? "Redirecionando…"
                  : isCurrent
                    ? "Plano atual"
                    : isDowngrade
                      ? "Já incluso no seu plano"
                      : info.billingMode === "demo"
                        ? `Ativar ${code} (demo)`
                        : `Assinar ${code}`}
              </button>
            </article>
          );
        })}
      </div>

      <p className="text-xs text-white/40">
        Dúvidas sobre cobrança?{" "}
        <Link href="/" className="text-brand-gold/80 hover:text-brand-gold">
          Ver detalhes na página inicial
        </Link>
      </p>
    </div>
  );
}
