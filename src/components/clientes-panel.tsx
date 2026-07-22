"use client";

import { useEffect, useState } from "react";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  creditBalance: number;
  _count: { appointments: number };
  vehicles: { id: string; label: string }[];
};

export function ClientesPanel() {
  const [q, setQ] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  async function load(query = q) {
    setLoading(true);
    const res = await fetch(`/api/customers?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setCustomers(data.customers ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load("");
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-brand-gold">
          CRM
        </p>
        <h1 className="font-display mt-1 text-4xl text-white">Clientes</h1>
        <p className="mt-2 max-w-xl text-sm text-white/60">
          Cadastro automático no agendamento: se o telefone já existe, o
          sistema vincula ao cliente. Você só consulta e complementa dados.
        </p>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void load();
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar nome, telefone ou e-mail"
          className="flex-1 rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-brand-gold"
        />
        <button
          type="submit"
          className="rounded-full bg-brand-gold px-5 text-sm font-semibold text-brand-ink"
        >
          Buscar
        </button>
      </form>

      {loading && <p className="text-white/50">Carregando…</p>}

      <div className="space-y-3">
        {customers.map((c) => (
          <article
            key={c.id}
            className="rounded-2xl border border-white/10 bg-black/25 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-white">{c.name}</h2>
                <p className="text-sm text-white/60">
                  {c.phone}
                  {c.email ? ` · ${c.email}` : ""}
                </p>
              </div>
              <div className="text-right text-xs text-white/45">
                <p>{c._count.appointments} agendamento(s)</p>
                <p>Crédito: R$ {c.creditBalance.toFixed(2)}</p>
              </div>
            </div>
            {c.vehicles.length > 0 && (
              <p className="mt-3 text-sm text-white/70">
                Veículos: {c.vehicles.map((v) => v.label).join(" · ")}
              </p>
            )}
          </article>
        ))}
        {!loading && customers.length === 0 && (
          <p className="text-sm text-white/45">
            Nenhum cliente ainda. Eles aparecerão quando houver agendamentos
            pelo site.
          </p>
        )}
      </div>
    </div>
  );
}
