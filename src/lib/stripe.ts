import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

/** Modo demo: permite upgrade sem Stripe (útil até configurar chaves). */
export function isBillingDemoMode(): boolean {
  if (process.env.BILLING_MODE?.trim().toLowerCase() === "demo") return true;
  // Sem Stripe → demo automático em non-production; em produção exige BILLING_MODE=demo explícito
  if (!isStripeConfigured()) {
    return process.env.BILLING_MODE?.trim().toLowerCase() !== "stripe";
  }
  return false;
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY não configurada");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export type PaidPlanCode = "PRO" | "PREMIUM";

export function stripePriceIdForPlan(planCode: PaidPlanCode): string | null {
  if (planCode === "PRO") {
    return process.env.STRIPE_PRICE_PRO?.trim() || null;
  }
  return process.env.STRIPE_PRICE_PREMIUM?.trim() || null;
}

export const PLAN_CATALOG: Record<
  PaidPlanCode,
  { name: string; priceLabel: string; amountBrl: number; bullets: string[] }
> = {
  PRO: {
    name: "PRO",
    priceLabel: "R$ 97/mês",
    amountBrl: 97,
    bullets: [
      "Tudo do FREE",
      "Controle financeiro",
      "Receita automática ao finalizar serviço",
      "Resumo mensal e ticket médio",
    ],
  },
  PREMIUM: {
    name: "PREMIUM",
    priceLabel: "R$ 197/mês",
    amountBrl: 197,
    bullets: [
      "Tudo do PRO",
      "Programa de indicações com créditos",
      "E-mail de confirmação de agendamento",
      "Prioridade em automações",
    ],
  },
};
