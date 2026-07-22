"use client";

import { useEffect, useState } from "react";
import { UpgradeBanner } from "@/components/upgrade-banner";

type Referral = {
  id: string;
  status: string;
  referrerReward: number;
  referredReward: number;
  referrer: { name: string; phone: string };
  referred: { name: string; phone: string };
};

export function IndicacoesPanel() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    void fetch("/api/referrals")
      .then((r) => r.json())
      .then((d) => {
        setReferrals(d.referrals ?? []);
        setLocked(Boolean(d.locked));
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-brand-gold">
          Crescimento
        </p>
        <h1 className="font-display mt-1 text-4xl text-white">Indicações</h1>
        <p className="mt-2 text-sm text-white/60">
          No agendamento, o cliente pode informar o telefone de quem indicou.
          Após finalizar o serviço, créditos são gerados.
        </p>
      </div>
      {locked && (
        <UpgradeBanner
          featureLabel="Programa de indicação e créditos"
          planHint="PREMIUM"
        />
      )}
      <div className="space-y-3">
        {referrals.map((r) => (
          <article
            key={r.id}
            className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm"
          >
            <p className="text-white">
              {r.referrer.name} → {r.referred.name}
            </p>
            <p className="text-white/50">
              Status {r.status} · recompensas R$ {r.referrerReward} / R${" "}
              {r.referredReward}
            </p>
          </article>
        ))}
        {!locked && referrals.length === 0 && (
          <p className="text-white/45">Nenhuma indicação registrada.</p>
        )}
      </div>
    </div>
  );
}
