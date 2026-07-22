/** Marca da plataforma SaaS (não da estética do cliente). */
export const PLATFORM = {
  name: "Estética CRM",
  shortName: "ESTÉTICA CRM",
  mark: "EC",
  tagline: "Site + agendamento para a sua estética automotiva",
  description:
    "Crie o site da sua estética, receba agendamentos online e gerencie a agenda — comece grátis.",
};

export const FREE_PLAN_BULLETS = [
  "Página da sua estética com seus serviços",
  "Agendamento online 24h",
  "Agenda do gestor em tempo real",
  "Clientes cadastrados automaticamente no agendamento",
] as const;

export const PAID_PLAN_TEASERS = [
  {
    plan: "PRO",
    price: "R$ 97/mês",
    items: ["Financeiro", "Histórico de veículos", "Relatórios"],
  },
  {
    plan: "PREMIUM",
    price: "R$ 197/mês",
    items: ["WhatsApp e e-mail", "Indicações", "Google Agenda", "Automações"],
  },
] as const;

export function slugifyCompanyName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
