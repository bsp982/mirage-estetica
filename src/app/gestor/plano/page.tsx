import { Suspense } from "react";
import { PlansBillingPanel } from "@/components/plans-billing-panel";

export default function GestorPlanoPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-brand-gold">
          Assinatura
        </p>
        <h1 className="font-display mt-2 text-4xl text-white">Planos</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/60">
          Faça upgrade do FREE para PRO ou PREMIUM e liberar financeiro,
          indicações e mais recursos de operação.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-white/55">Carregando…</p>}>
        <PlansBillingPanel />
      </Suspense>
    </div>
  );
}
