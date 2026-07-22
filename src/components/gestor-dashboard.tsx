"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatBRL } from "@/lib/money";

type Stats = {
  todayCount: number;
  inProgress: number;
  awaitingPickup: number;
  finishedMonth: number;
  newCustomers: number;
  monthRevenue: number;
  features: string[];
};

export function GestorDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    void fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => undefined);
  }, []);

  const cards = [
    { label: "Hoje", value: stats?.todayCount ?? "—" },
    { label: "Em execução", value: stats?.inProgress ?? "—" },
    { label: "Aguardando retirada", value: stats?.awaitingPickup ?? "—" },
    { label: "Finalizados (mês)", value: stats?.finishedMonth ?? "—" },
    { label: "Clientes novos", value: stats?.newCustomers ?? "—" },
    {
      label: "Faturamento (mês)",
      value:
        stats && stats.features.includes("FINANCIAL")
          ? formatBRL(stats.monthRevenue)
          : "—",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-brand-gold">
          Painel
        </p>
        <h1 className="font-display mt-1 text-4xl text-white">Dashboard</h1>
        <p className="mt-2 text-sm text-white/60">
          Visão rápida da operação. Clientes entram automaticamente pelo
          agendamento online.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-white/10 bg-black/25 p-5"
          >
            <p className="text-xs uppercase tracking-wider text-white/45">
              {c.label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">{c.value}</p>
          </div>
        ))}
      </div>

      <Link
        href="/gestor/agenda"
        className="inline-flex rounded-full bg-brand-gold px-5 py-2.5 text-sm font-semibold text-brand-ink"
      >
        Abrir agenda
      </Link>
    </div>
  );
}
