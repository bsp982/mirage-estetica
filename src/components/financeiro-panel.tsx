"use client";

import { FormEvent, useEffect, useState } from "react";
import { formatBRL } from "@/lib/money";
import { UpgradeBanner } from "@/components/upgrade-banner";

type Summary = {
  income: number;
  expense: number;
  profit: number;
  ticketMedio: number;
};

type Tx = {
  id: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  date: string;
};

export function FinanceiroPanel() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [error, setError] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [category, setCategory] = useState("OUTROS");

  async function load() {
    const res = await fetch("/api/financial");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Financeiro indisponível no plano");
      return;
    }
    setSummary(data.summary);
    setTxs(data.transactions ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/financial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        category,
        description,
        amount: Number(amount),
      }),
    });
    if (res.ok) {
      setDescription("");
      setAmount("");
      await load();
    }
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-4xl text-white">Financeiro</h1>
        <UpgradeBanner featureLabel="Controle financeiro" planHint="PRO" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-brand-gold">
          Caixa
        </p>
        <h1 className="font-display mt-1 text-4xl text-white">Financeiro</h1>
      </div>

      {summary && (
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            ["Receitas", summary.income],
            ["Despesas", summary.expense],
            ["Lucro", summary.profit],
            ["Ticket médio", summary.ticketMedio],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-2xl border border-white/10 bg-black/25 p-4"
            >
              <p className="text-xs text-white/45">{label}</p>
              <p className="mt-1 text-xl text-white">
                {formatBRL(Number(value))}
              </p>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={onCreate}
        className="grid gap-2 rounded-2xl border border-white/10 bg-black/25 p-4 sm:grid-cols-4"
      >
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "INCOME" | "EXPENSE")}
          className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
        >
          <option value="EXPENSE">Despesa</option>
          <option value="INCOME">Receita</option>
        </select>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Categoria"
          className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição"
          required
          className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
        />
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          placeholder="Valor"
          required
          className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
        />
        <button
          type="submit"
          className="sm:col-span-4 rounded-full bg-brand-gold py-2 text-sm font-semibold text-brand-ink"
        >
          Lançar
        </button>
      </form>

      <div className="space-y-2">
        {txs.map((t) => (
          <div
            key={t.id}
            className="flex justify-between rounded-xl border border-white/10 px-4 py-3 text-sm"
          >
            <div>
              <p className="text-white">{t.description}</p>
              <p className="text-white/40">
                {t.type} · {t.category}
              </p>
            </div>
            <p
              className={
                t.type === "INCOME" ? "text-emerald-300" : "text-red-300"
              }
            >
              {formatBRL(t.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
