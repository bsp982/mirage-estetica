# Estética MVP — CRM + Agendamento

CRM vertical para estéticas automotivas (Next.js + Prisma + **Supabase Postgres**).

## O que já existe

- Site público configurável (`/` e `/s/[slug]`)
- Agendamento com **find-or-create de cliente por telefone** (gestor não cadastra na mão)
- Painel CRM: dashboard, agenda com status, clientes, veículos, serviços, financeiro (PRO), indicações (PREMIUM), configurações
- Multi-tenant preparado (`company_id`), planos FREE→ENTERPRISE, feature flags
- Comunicação (log + hooks), Google Calendar (stub), cron de lembretes, onboarding FREE

## Setup (Supabase)

Veja o passo a passo em [docs/SUPABASE.md](docs/SUPABASE.md).

```bash
cp .env.example .env
# preencha DATABASE_URL, DIRECT_URL, SESSION_SECRET
npm install
npm run db:setup
npm run dev
```

## Login demo (após seed)

- `admin@estetica.local` / `admin`
- Site: `/s/estetica-mvp`
- Onboarding: `/onboarding`

## Scripts

| Script | Uso |
|--------|-----|
| `npm run db:setup` | `prisma db push` + seed no Supabase |
| `npm run db:migrate` | migrations Prisma |
| `npm run db:seed` | seed isolado |
| `npm run dev` | Next.js |

## Fluxo de cliente

1. Cliente agenda no site (nome + WhatsApp + veículo)
2. Backend normaliza telefone e vincula/cria `Customer` + `Vehicle`
3. Gestor vê na agenda e em `/gestor/clientes` — sem cadastro prévio
