"use client";

import { useEffect, useState } from "react";

type Vehicle = {
  id: string;
  label: string;
  customerName: string;
  brand: string;
  model: string;
  year: number | null;
  plate: string | null;
};

export function VeiculosPanel() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    void fetch("/api/vehicles")
      .then((r) => r.json())
      .then((d) => setVehicles(d.vehicles ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-brand-gold">
          Frota dos clientes
        </p>
        <h1 className="font-display mt-1 text-4xl text-white">Veículos</h1>
        <p className="mt-2 text-sm text-white/60">
          Criados automaticamente a partir do campo “carro” no agendamento.
        </p>
      </div>
      <div className="space-y-3">
        {vehicles.map((v) => (
          <article
            key={v.id}
            className="rounded-2xl border border-white/10 bg-black/25 p-4"
          >
            <h2 className="font-semibold text-white">{v.label}</h2>
            <p className="text-sm text-white/55">Cliente: {v.customerName}</p>
          </article>
        ))}
        {vehicles.length === 0 && (
          <p className="text-sm text-white/45">Nenhum veículo cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
